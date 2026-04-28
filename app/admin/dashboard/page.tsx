import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import type { LeadStatus } from '@/types'

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  closed: 'Closed',
  lost: 'Lost',
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  quoted: 'bg-purple-100 text-purple-700',
  closed: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="text-center py-20 text-gray-500">
        No business linked to your account. Contact support.
      </div>
    )
  }

  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, email, status, created_at, services(name)')
    .eq('business_id', profile.business_id)
    .order('created_at', { ascending: false })

  const allLeads = leads ?? []

  const counts = (Object.keys(STATUS_LABELS) as LeadStatus[]).map((status) => ({
    status,
    count: allLeads.filter((l) => l.status === status).length,
  }))

  const recent = allLeads.slice(0, 5)

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Status counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
        {counts.map(({ status, count }) => (
          <Link
            key={status}
            href={`/admin/leads?status=${status}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-3xl font-bold text-gray-900">{count}</p>
            <p className="text-sm text-gray-500 mt-1">{STATUS_LABELS[status]}</p>
          </Link>
        ))}
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Leads</h2>
          <Link href="/admin/leads" className="text-xs text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            No leads yet. Share your form link to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recent.map((lead) => {
              const service = (lead.services as unknown as { name: string } | null)?.name
              return (
                <li key={lead.id}>
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                      <p className="text-xs text-gray-400 truncate">{lead.email}{service ? ` · ${service}` : ''}</p>
                    </div>
                    <span className={`ml-4 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status as LeadStatus]}`}>
                      {STATUS_LABELS[lead.status as LeadStatus]}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
