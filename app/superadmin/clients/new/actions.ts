'use server'

import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const serviceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

const onboardSchema = z.object({
  name:        z.string().min(2, 'Business name required'),
  slug:        z.string().min(2, 'Slug required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  owner_email: z.string().email('Valid email required'),
  owner_password: z.string().min(8, 'Password must be at least 8 characters'),
  plan:        z.enum(['starter', 'growth', 'pro']),
  primary_color: z.string().default('#6d28d9'),
  tagline:     z.string().optional(),
})

export async function onboardClient(_: unknown, formData: FormData) {
  const raw = {
    name:           formData.get('name'),
    slug:           formData.get('slug'),
    owner_email:    formData.get('owner_email'),
    owner_password: formData.get('owner_password'),
    plan:           formData.get('plan'),
    primary_color:  formData.get('primary_color') || '#6d28d9',
    tagline:        formData.get('tagline'),
  }

  const parsed = onboardSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, slug, owner_email, owner_password, plan, primary_color, tagline } = parsed.data

  const supabase = serviceClient()

  // Module sets per plan
  const MODULE_SETS: Record<string, string[]> = {
    starter: ['lead_capture'],
    growth:  ['lead_capture', 'bookings', 'payments', 'client_records'],
    pro:     ['lead_capture', 'bookings', 'payments', 'invoicing', 'calendar', 'client_records'],
  }

  // 1. Check slug is unique
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    return { error: `Slug "${slug}" is already taken. Choose a different one.` }
  }

  // 2. Create business row
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .insert({
      name,
      slug,
      owner_email,
      plan,
      modules: MODULE_SETS[plan],
      branding: { primaryColor: primary_color, tagline: tagline ?? '' },
      settings: {
        followUpHours: 24,
        fileUploadEnabled: false,
        maxFileSizeMB: 10,
        replyToEmail: owner_email,
      },
    })
    .select('id')
    .single()

  if (bizError || !business) {
    console.error('[onboardClient] Business insert error:', bizError)
    return { error: 'Failed to create business. Please try again.' }
  }

  // 3. Create auth user for the business owner
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: owner_email,
    password: owner_password,
    email_confirm: true,
    user_metadata: {
      business_id: business.id,
      role: 'owner',
    },
  })

  if (authError || !authUser.user) {
    // Roll back the business row
    await supabase.from('businesses').delete().eq('id', business.id)
    console.error('[onboardClient] Auth user error:', authError)
    return { error: 'Failed to create user account. Please try again.' }
  }

  redirect(`/superadmin/clients/${business.id}`)
}
