import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { updateLeadStatusAction } from './actions'
import type { LeadStatus, MessageType } from '@/types'

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

const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  email_sent: 'Email sent',
  follow_up: 'Follow-up reminder sent',
  status_change: 'Status changed',
  note: 'Note',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: lead } = await supabase
    .from('leads')
    .select('*, services(name)')
    .eq('id', id)
    .single()

  if (!lead) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })

  const service = (lead.services as unknown as { name: string } | null)?.name
  const metadata = (lead.metadata ?? {}) as Record<string, string>
  const fileUrls = (lead.file_urls ?? []) as string[]
  const allMessages = messages ?? []

  const updateAction = updateLeadStatusAction.bind(null, id)

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link href="/admin/leads" className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-block">
        ← Back to leads
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{lead.email}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[lead.status as LeadStatus]}`}>
          {STATUS_LABELS[lead.status as LeadStatus]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Lead info */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Lead Details</h2>

          <dl className="space-y-3 text-sm">
            {lead.phone && (
              <div className="flex gap-3">
                <dt className="text-gray-400 w-24 shrink-0">Phone</dt>
                <dd className="text-gray-900">{lead.phone}</dd>
              </div>
            )}
            {service && (
              <div className="flex gap-3">
                <dt className="text-gray-400 w-24 shrink-0">Service</dt>
                <dd className="text-gray-900">{service}</dd>
              </div>
            )}
            {lead.source && (
              <div className="flex gap-3">
                <dt className="text-gray-400 w-24 shrink-0">Source</dt>
                <dd className="text-gray-900">{lead.source}</dd>
              </div>
            )}
            <div className="flex gap-3">
              <dt className="text-gray-400 w-24 shrink-0">Submitted</dt>
              <dd className="text-gray-900">
                {new Date(lead.created_at).toLocaleString('en-AU', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: 'numeric', minute: '2-digit',
                })}
              </dd>
            </div>

            {Object.entries(metadata).filter(([, v]) => v).map(([key, value]) => (
              <div key={key} className="flex gap-3">
                <dt className="text-gray-400 w-24 shrink-0 capitalize">{key.replace(/_/g, ' ')}</dt>
                <dd className="text-gray-900">{String(value)}</dd>
              </div>
            ))}
          </dl>

          {lead.message && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Message</p>
              <p className="text-sm text-gray-700 leading-relaxed">{lead.message}</p>
            </div>
          )}

          {fileUrls.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Attachments</p>
              <ul className="space-y-1.5">
                {fileUrls.map((url, i) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      📎 {url.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Update status */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Update Status</h2>
          <form action={updateAction} className="space-y-3">
            <select
              name="status"
              defaultValue={lead.status}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Save
            </button>
          </form>
        </div>
      </div>

      {/* Activity log */}
      {allMessages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Activity</h2>
          <ul className="space-y-3">
            {allMessages.map((msg) => (
              <li key={msg.id} className="flex gap-3 text-sm">
                <span className="text-gray-400 shrink-0 text-xs pt-0.5">
                  {new Date(msg.created_at).toLocaleString('en-AU', {
                    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
                  })}
                </span>
                <span className="text-gray-600">
                  <span className="font-medium text-gray-800">{MESSAGE_TYPE_LABELS[msg.type as MessageType]}</span>
                  {' — '}
                  {msg.content}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
