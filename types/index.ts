// ============================================================
// Mikai Platform — Shared Types
// ============================================================

// ── Modules & Plans ──────────────────────────────────────────

export type ModuleType =
  | 'lead_capture'
  | 'bookings'
  | 'payments'
  | 'invoicing'
  | 'calendar'
  | 'client_records'

export type PlanType = 'starter' | 'growth' | 'pro'

export const PLAN_MODULES: Record<PlanType, ModuleType[]> = {
  starter: ['lead_capture'],
  growth:  ['lead_capture', 'bookings', 'payments', 'client_records'],
  pro:     ['lead_capture', 'bookings', 'payments', 'invoicing', 'calendar', 'client_records'],
}

export function hasModule(config: BusinessConfig, module: ModuleType): boolean {
  return config.modules.includes(module)
}

// ── Field Config (dynamic forms) ─────────────────────────────

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: string[]
}

// ── Business Config ───────────────────────────────────────────

export interface BusinessBranding {
  logoUrl?: string
  primaryColor: string
  secondaryColor?: string
  tagline?: string
}

export interface BusinessSettings {
  followUpHours: number
  fileUploadEnabled: boolean
  fileAcceptTypes?: string
  maxFileSizeMB: number
  replyToEmail: string
  depositPercentage?: number       // e.g. 30 = 30% deposit
  cancellationHours?: number       // hours before appointment for free cancellation
  bookingBufferMinutes?: number    // gap between appointments
}

export interface ServiceConfig {
  name: string
  description?: string
  durationMinutes: number
  price: number
  currency?: string                // defaults to ZAR
}

export interface BusinessConfig {
  id: string
  slug: string
  name: string
  ownerEmail: string
  plan: PlanType
  modules: ModuleType[]
  branding: BusinessBranding
  settings: BusinessSettings
  services: ServiceConfig[]
  customFields: FieldConfig[]
}

// ── Website Content ───────────────────────────────────────────

export type WebsiteSection =
  | 'hero'
  | 'services'
  | 'gallery'
  | 'testimonials'
  | 'about'
  | 'contact'
  | 'faq'

export interface WebsiteContent {
  id: string
  business_id: string
  section: WebsiteSection
  content: Record<string, unknown>
  is_active: boolean
  sort_order: number
}

// ── Lead ─────────────────────────────────────────────────────

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

// ── Client ───────────────────────────────────────────────────

export interface Client {
  id: string
  business_id: string
  name: string
  email: string
  phone?: string | null
  notes?: string | null
  created_at: string
}

// ── Booking ──────────────────────────────────────────────────

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'

export interface Booking {
  id: string
  business_id: string
  client_id?: string | null
  service_id?: string | null
  service_name?: string | null
  service_price?: number | null
  service_duration_minutes?: number | null
  date: string
  start_time: string
  end_time: string
  status: BookingStatus
  deposit_paid: boolean
  deposit_amount?: number | null
  notes?: string | null
  created_at: string
  updated_at: string
}

// ── Availability ─────────────────────────────────────────────

export interface Availability {
  id: string
  business_id: string
  day_of_week?: number | null
  specific_date?: string | null
  start_time: string
  end_time: string
  is_blocked: boolean
}

// ── Payment ──────────────────────────────────────────────────

export type PaymentProvider = 'payfast' | 'stripe'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  business_id: string
  booking_id?: string | null
  amount: number
  currency: string
  provider: PaymentProvider
  provider_payment_id?: string | null
  status: PaymentStatus
  metadata: Record<string, unknown>
  created_at: string
}

// ── Message / activity log ────────────────────────────────────

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

// ── Form submission ───────────────────────────────────────────

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
  data?: Record<string, unknown>
}
