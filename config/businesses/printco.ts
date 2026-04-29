import type { BusinessConfig } from '@/types'

/**
 * PrintCo Melbourne — printing company example config.
 * Demonstrates: file upload, custom select fields, custom text field.
 *
 * After inserting into Supabase businesses table, replace the id below.
 */
export const printcoConfig: BusinessConfig = {
  id: 'cd0d6b85-d9aa-4b14-86a0-af8d54f7ad3a',
  slug: 'printco',
  name: 'PrintCo Melbourne',
  ownerEmail: 'hello@printco.com.au',
  plan: 'starter',
  modules: ['lead_capture'],

  branding: {
    logoUrl: '',
    primaryColor: '#1D4ED8',
    tagline: 'Professional Print, Every Time',
  },

  settings: {
    followUpHours: 24,
    fileUploadEnabled: true,
    fileAcceptTypes: '.pdf,.ai,.eps,.jpg,.png',
    maxFileSizeMB: 20,
    replyToEmail: 'hello@printco.com.au',
  },

  services: [
    { name: 'Business Cards',        durationMinutes: 0, price: 0 },
    { name: 'Flyers & Brochures',    durationMinutes: 0, price: 0 },
    { name: 'Banners & Signage',     durationMinutes: 0, price: 0 },
    { name: 'Stationery',            durationMinutes: 0, price: 0 },
    { name: 'Packaging',             durationMinutes: 0, price: 0 },
    { name: 'Large Format Printing', durationMinutes: 0, price: 0 },
    { name: 'Other',                 durationMinutes: 0, price: 0 },
  ],

  customFields: [
    {
      name: 'quantity',
      label: 'Print Quantity',
      type: 'select',
      required: true,
      options: ['Under 100', '100–500', '500–1,000', '1,000–5,000', '5,000+'],
    },
    {
      name: 'paper_finish',
      label: 'Paper Finish',
      type: 'select',
      required: false,
      options: ['Gloss', 'Matte', 'Uncoated', 'Not Sure'],
    },
    {
      name: 'deadline',
      label: 'Required By',
      type: 'text',
      required: false,
      placeholder: 'e.g. 15 May 2026',
    },
  ],
}
