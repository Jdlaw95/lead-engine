import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id, role, businesses(*)')
    .eq('id', user.id)
    .single()

  const business = (profile?.businesses as unknown as Record<string, unknown> | null)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Account */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Account</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex gap-3">
              <dt className="text-gray-400 w-28 shrink-0">Email</dt>
              <dd className="text-gray-900">{user.email}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-400 w-28 shrink-0">Role</dt>
              <dd className="text-gray-900 capitalize">{profile?.role ?? '—'}</dd>
            </div>
          </dl>
        </div>

        {/* Business */}
        {business && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Business</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-3">
                <dt className="text-gray-400 w-28 shrink-0">Name</dt>
                <dd className="text-gray-900">{String(business.name ?? '—')}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-gray-400 w-28 shrink-0">Slug</dt>
                <dd className="text-gray-900 font-mono text-xs bg-gray-50 px-2 py-0.5 rounded">{String(business.slug ?? '—')}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-gray-400 w-28 shrink-0">Owner email</dt>
                <dd className="text-gray-900">{String(business.owner_email ?? '—')}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-gray-400 w-28 shrink-0">Form URL</dt>
                <dd>
                  <a
                    href={`/${business.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-mono text-xs"
                  >
                    /{String(business.slug ?? '')}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Cron / Automation */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Automation</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Follow-up reminders run automatically every hour via Vercel Cron.
            Leads still in <span className="font-medium text-gray-700">New</span> status
            past your configured threshold will trigger a reminder to the business owner.
          </p>
          <p className="text-xs text-gray-400 mt-3">
            Cron schedule: <span className="font-mono">0 * * * *</span>
          </p>
        </div>
      </div>
    </div>
  )
}
