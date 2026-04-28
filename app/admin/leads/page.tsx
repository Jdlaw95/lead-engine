import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { LeadStatus } from '@/types'

const STATUSES: LeadStatus[] = ['new', 'contacted', 'quoted', 'closed', 'lost']

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

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function LeadsPage({ searchParams }: Props) {
  const { status: statusFilter } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  let query = supabase
    .from('leads')
    .select('id, name, email, phone, status, created_at, services(name)')
    .eq('business_id', profile.business_id)
    .order('created_at', { ascending: false })

  if (statusFilter && STATUSES.includes(statusFilter as LeadStatus)) {
    query = query.eq('status', statusFilter)
  }

  const { data: leads } = await query
  const allLeads = leads ?? []

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leads</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href="/admin/leads"
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !statusFilter ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/leads?status=${s}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {allLeads.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            No leads found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Service</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allLeads.map((lead) => {
                const service = (lead.services as unknown as { name: string } | null)?.name
                const date = new Date(lead.created_at).toLocaleDateString('en-AU', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })
                return (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/leads/${lead.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">{service ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status as LeadStatus]}`}>
                        {STATUS_LABELS[lead.status as LeadStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 hidden md:table-cell">{date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
