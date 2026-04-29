import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-gray-800 text-gray-300',
  growth:  'bg-blue-900 text-blue-300',
  pro:     'bg-violet-900 text-violet-300',
}

interface Props {
  params: Promise<{ businessId: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  const { businessId } = await params
  const supabase = await createClient()

  const [
    { data: business },
    { count: leadCount },
    { count: bookingCount },
    { data: recentLeads },
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single(),
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId),
    supabase
      .from('leads')
      .select('id, name, email, status, created_at')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  if (!business) notFound()

  const modules: string[] = business.modules ?? []
  const branding = business.branding as Record<string, string> ?? {}

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link
            href="/superadmin/clients"
            className="text-xs text-gray-500 hover:text-gray-300 mb-2 inline-block"
          >
            ← All clients
          </Link>
          <h1 className="text-2xl font-bold text-white">{business.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            /{business.slug} · {business.owner_email}
          </p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${PLAN_COLORS[business.plan] ?? PLAN_COLORS.starter}`}>
          {business.plan}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Leads',    value: leadCount ?? 0 },
          { label: 'Total Bookings', value: bookingCount ?? 0 },
          { label: 'Active Modules', value: modules.length },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Modules */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Active Modules</h2>
          <div className="space-y-1.5">
            {['lead_capture', 'bookings', 'payments', 'invoicing', 'calendar', 'client_records'].map((m) => {
              const active = modules.includes(m)
              return (
                <div key={m} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-gray-700'}`} />
                  <span className={`text-sm capitalize ${active ? 'text-gray-200' : 'text-gray-600'}`}>
                    {m.replace(/_/g, ' ')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Branding */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Branding</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg border border-gray-700"
                style={{ backgroundColor: branding.primaryColor ?? '#6d28d9' }}
              />
              <span className="text-sm text-gray-300">{branding.primaryColor ?? '—'}</span>
            </div>
            {branding.tagline && (
              <p className="text-sm text-gray-400 italic">"{branding.tagline}"</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Public form URL</p>
            <a
              href={`/${business.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-violet-400 hover:underline"
            >
              mikai.io/{business.slug} ↗
            </a>
          </div>
        </div>
      </div>

      {/* Recent leads */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Recent Leads</h2>
        </div>
        {!recentLeads?.length ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">No leads yet.</div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {recentLeads.map((lead) => (
              <li key={lead.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">{lead.name}</p>
                  <p className="text-xs text-gray-500">{lead.email}</p>
                </div>
                <span className="text-xs text-gray-500 capitalize">{lead.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
