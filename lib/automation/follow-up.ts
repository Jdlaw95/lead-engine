import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/sender'
import { followUpEmailHtml } from '@/lib/email/templates/follow-up'

interface BusinessSettings {
  followUpHours?: number
  replyToEmail?: string
}

interface LeadWithBusiness {
  id: string
  name: string
  email: string
  phone: string | null
  service_id: string | null
  status: string
  created_at: string
  businesses: {
    id: string
    name: string
    slug: string
    owner_email: string
    settings: BusinessSettings
  } | null
}

/**
 * Processes all overdue leads and sends a single follow-up reminder
 * to the relevant business owner for each one.
 *
 * "Overdue" = lead is still 'new' and has been waiting longer than
 * the business's configured followUpHours with no prior follow_up logged.
 *
 * This function is idempotent — it checks for existing follow_up messages
 * before sending, so running it multiple times is safe.
 *
 * Returns a summary of what was processed.
 */
export async function processFollowUps(): Promise<{
  checked: number
  sent: number
  skipped: number
  errors: number
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // ── 1. Fetch all 'new' leads older than 1h, with their business settings ──
  // 1 hour is the minimum possible followUpHours, so we pull everything
  // older than that and filter precisely in step 3.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { data: candidates, error: fetchError } = await supabase
    .from('leads')
    .select(`
      id,
      name,
      email,
      phone,
      service_id,
      status,
      created_at,
      businesses (
        id,
        name,
        slug,
        owner_email,
        settings
      )
    `)
    .eq('status', 'new')
    .lt('created_at', oneHourAgo)

  if (fetchError || !candidates) {
    console.error('[follow-up] Failed to fetch candidates:', fetchError)
    return { checked: 0, sent: 0, skipped: 0, errors: 1 }
  }

  if (candidates.length === 0) {
    return { checked: 0, sent: 0, skipped: 0, errors: 0 }
  }

  // ── 2. Get lead IDs that already have a follow_up logged ──
  const leadIds = candidates.map((l) => l.id)

  const { data: existingFollowUps } = await supabase
    .from('messages')
    .select('lead_id')
    .eq('type', 'follow_up')
    .in('lead_id', leadIds)

  const alreadyFollowedUp = new Set(
    (existingFollowUps ?? []).map((m) => m.lead_id as string)
  )

  // ── 3. Filter to leads that are genuinely overdue ──
  const now = Date.now()

  const overdue = (candidates as unknown as LeadWithBusiness[]).filter((lead) => {
    if (alreadyFollowedUp.has(lead.id)) return false
    if (!lead.businesses) return false

    const followUpHours = lead.businesses.settings?.followUpHours ?? 24
    const ageHours = (now - new Date(lead.created_at).getTime()) / (1000 * 60 * 60)

    return ageHours >= followUpHours
  })

  // ── 4. Send reminder emails and log each one ──
  let sent = 0
  let errors = 0
  const skipped = candidates.length - overdue.length

  for (const lead of overdue) {
    const business = lead.businesses!
    const ageHours = Math.floor(
      (now - new Date(lead.created_at).getTime()) / (1000 * 60 * 60)
    )

    // Resolve service name if needed (best-effort — failure is non-fatal)
    let serviceName: string | null = null
    if (lead.service_id) {
      const { data: service } = await supabase
        .from('services')
        .select('name')
        .eq('id', lead.service_id)
        .single()
      serviceName = service?.name ?? null
    }

    const resendId = await sendEmail({
      to: business.owner_email,
      from: 'Lead Engine <onboarding@resend.dev>',
      subject: `Reminder: ${lead.name} is still waiting — ${business.name}`,
      html: followUpEmailHtml({
        businessName: business.name,
        leadName: lead.name,
        leadEmail: lead.email,
        leadPhone: lead.phone,
        service: serviceName,
        hoursAgo: ageHours,
        dashboardUrl: `${appUrl}/admin/leads/${lead.id}`,
      }),
    })

    // Log it — even if email failed, log the attempt so we don't retry forever
    const { error: logError } = await supabase.from('messages').insert({
      lead_id: lead.id,
      business_id: business.id,
      type: 'follow_up',
      content: `Follow-up reminder sent to ${business.owner_email} (${ageHours}h after submission)`,
      resend_id: resendId,
    })

    if (logError) {
      console.error(`[follow-up] Failed to log message for lead ${lead.id}:`, logError)
      errors++
    } else {
      sent++
    }
  }

  return { checked: candidates.length, sent, skipped, errors }
}
