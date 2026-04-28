'use server'

import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/sender'
import { confirmationEmailHtml } from '@/lib/email/templates/confirmation'
import { notificationEmailHtml } from '@/lib/email/templates/notification'
import { getBusinessConfig } from '@/config/businesses'
import { baseLeadSchema } from '@/lib/validations/lead.schema'
import type { LeadSubmissionInput, ActionResult } from '@/types'

// Service role client — used for all public form inserts (bypasses RLS)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/**
 * Server Action: validate, persist, and notify on a new lead submission.
 *
 * Flow:
 *   1. Validate base fields with Zod
 *   2. Resolve service_id if a service name was provided
 *   3. Insert the lead row
 *   4. Send confirmation email to the lead
 *   5. Send notification email to the business owner
 *   6. Log the outbound email in the messages table
 */
export async function submitLead(input: LeadSubmissionInput): Promise<ActionResult> {
  // 1. Validate base fields
  const parsed = baseLeadSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Please check your details and try again.' }
  }

  const supabase = getServiceClient()

  // 2. Resolve service_id
  let serviceId: string | null = null
  if (input.service) {
    const { data: service } = await supabase
      .from('services')
      .select('id')
      .eq('business_id', input.businessId)
      .eq('name', input.service)
      .single()

    serviceId = service?.id ?? null
  }

  // 3. Insert lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .insert({
      business_id: input.businessId,
      service_id: serviceId,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message ?? null,
      status: 'new',
      metadata: input.metadata ?? {},
      file_urls: input.fileUrls ?? [],
      source: 'direct',
    })
    .select('id')
    .single()

  if (leadError || !lead) {
    console.error('[submitLead] DB insert error:', leadError)
    return { error: 'Failed to submit your enquiry. Please try again.' }
  }

  // 4–6. Email & logging (non-blocking — errors here don't fail the submission)
  const config = getBusinessConfig(input.businessSlug)

  if (config) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Confirmation to lead
    const confirmResendId = await sendEmail({
      to: input.email,
      // In dev/testing: Resend only allows sending from onboarding@resend.dev
      // In production: replace with your verified domain e.g. 'noreply@yourdomain.com'
      from: `${config.name} <onboarding@resend.dev>`,
      replyTo: config.settings.replyToEmail,
      subject: `We've received your enquiry — ${config.name}`,
      html: confirmationEmailHtml({
        businessName: config.name,
        leadName: input.name,
        service: input.service,
        primaryColor: config.branding.primaryColor,
      }),
    })

    // Notification to business owner
    await sendEmail({
      to: config.ownerEmail,
      from: 'Lead Engine <onboarding@resend.dev>',
      subject: `New enquiry from ${input.name}`,
      html: notificationEmailHtml({
        businessName: config.name,
        leadName: input.name,
        leadEmail: input.email,
        leadPhone: input.phone,
        service: input.service,
        message: input.message,
        metadata: input.metadata,
        fileUrls: input.fileUrls,
        dashboardUrl: `${appUrl}/admin/leads/${lead.id}`,
      }),
    })

    // Log the sent email
    await supabase.from('messages').insert({
      lead_id: lead.id,
      business_id: input.businessId,
      type: 'email_sent',
      content: `Confirmation email sent to ${input.email}`,
      resend_id: confirmResendId,
    })
  }

  return {}
}
