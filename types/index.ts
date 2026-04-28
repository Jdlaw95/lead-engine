// ============================================================
// Lead Engine System — Shared Types
// ============================================================

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'

export interface FieldConfig {
  name: string         // key stored in lead.metadata
  label: string        // display label on the form
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: string[]   // only for type: 'select'
}

export interface BusinessBranding {
  logoUrl?: string
  primaryColor: string // hex e.g. '#1D4ED8'
  tagline?: string
}

export interface BusinessSettings {
  followUpHours: number
  fileUploadEnabled: boolean
  fileAcceptTypes?: string  // e.g. '.pdf,.jpg,.png'
  maxFileSizeMB: number
  replyToEmail: string
}

export interface BusinessConfig {
  id: string           // matches businesses.id in Supabase
  slug: string         // URL slug e.g. 'printco'
  name: string
  ownerEmail: string
  branding: BusinessBranding
  settings: BusinessSettings
  services: string[]        // displayed in the service selector
  customFields: FieldConfig[] // dynamic fields beyond the base set
}

// ---- Lead ----

export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'closed' | 'lost'

export interface Lead {
  id: string
  business_id: string
  service_id?: string | null
  name: string
  email: string
  phone?: string | null
  message?: string | null
  status: LeadStatus
  metadata: Record<string, unknown>
  file_urls: string[]
  source?: string | null
  created_at: string
  updated_at: string
}

// ---- Message / interaction log ----

export type MessageType = 'email_sent' | 'note' | 'follow_up' | 'status_change'

export interface Message {
  id: string
  lead_id: string
  business_id: string
  type: MessageType
  content: string
  sent_by?: string | null
  resend_id?: string | null
  created_at: string
}

// ---- Form submission payload ----

export interface LeadSubmissionInput {
  businessId: string
  businessSlug: string
  name: string
  email: string
  phone?: string
  service?: string
  message?: string
  metadata: Record<string, string>
  fileUrls?: string[]
}

export interface ActionResult {
  error?: string
}
