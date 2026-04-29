import type { BusinessConfig } from '@/types'

/**
 * Copy this file and rename it to your client's slug (e.g. greens-salon.ts).
 * Fill in every field, then register the export in config/businesses/index.ts.
 *
 * After populating, insert a matching row into the `businesses` Supabase table
 * and replace REPLACE_WITH_SUPABASE_ID below with the returned UUID.
 */
export const templateConfig: BusinessConfig = {
  id: 'REPLACE_WITH_SUPABASE_ID',
  slug: 'your-slug',
  name: 'Business Name',
  ownerEmail: 'owner@business.com',
  plan: 'starter',
  modules: ['lead_capture'],

  branding: {
    logoUrl: '',            // publicly accessible image URL, or leave blank
    primaryColor: '#1D4ED8',
    tagline: 'Your tagline here',
  },

  settings: {
    followUpHours: 24,
    fileUploadEnabled: false,
    fileAcceptTypes: '.pdf,.jpg,.png',
    maxFileSizeMB: 10,
    replyToEmail: 'owner@business.com',
  },

  services: [
    { name: 'Service One', durationMinutes: 60, price: 0 },
    { name: 'Service Two', durationMinutes: 60, price: 0 },
    { name: 'Service Three', durationMinutes: 60, price: 0 },
  ],

  customFields: [
    // Add dynamic fields here. Each field is rendered below the base fields.
    // Example:
    // {
    //   name: 'quantity',
    //   label: 'Quantity Required',
    //   type: 'number',
    //   required: true,
    //   placeholder: 'e.g. 500',
    // },
    // {
    //   name: 'preferred_time',
    //   label: 'Preferred Time',
    //   type: 'select',
    //   required: false,
    //   options: ['Morning', 'Afternoon', 'Evening'],
    // },
  ],
}
