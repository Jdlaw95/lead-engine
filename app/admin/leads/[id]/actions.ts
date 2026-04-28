'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { LeadStatus } from '@/types'

const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'quoted', 'closed', 'lost']

export async function updateLeadStatusAction(leadId: string, formData: FormData) {
  const status = formData.get('status') as string

  if (!VALID_STATUSES.includes(status as LeadStatus)) return

  const supabase = await createClient()

  const { data: lead } = await supabase
    .from('leads')
    .select('id, business_id, status')
    .eq('id', leadId)
    .single()

  if (!lead) return

  await supabase
    .from('leads')
    .update({ status })
    .eq('id', leadId)

  await supabase.from('messages').insert({
    lead_id: leadId,
    business_id: lead.business_id,
    type: 'status_change',
    content: `Status changed from ${lead.status} to ${status}`,
  })

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath('/admin/leads')
  revalidatePath('/admin/dashboard')
}
