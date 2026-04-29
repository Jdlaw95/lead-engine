import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SuperadminOverviewPage() {
  const supabase = await createClient()

  const [
    { count: totalBusinesses },
    { count: totalLeads },
    { count: totalBookings },
    { data: recentBusinesses },
  ] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase
      .from('businesses')
      .select('id, name, slug, plan, modules, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: 'Total Clients',   value: totalBusinesses ?? 0 },
    { label: 'Total Leads',     value: totalLeads ?? 0 },
    { label: 'Total Bookings',  value: totalBookings ?? 0 },
  ]

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
        <p className="text-gray-400 mt-1 text-sm">All clients and activity across Mikai.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent clients */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Clients</h2>
          <Link
            href="/superadmin/clients"
            className="text-xs text-violet-400 hover:text-violet-300"
          >
            View all
          </Link>
        </div>

        {!recentBusinesses?.length ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No clients yet.{' '}
            <Link href="/superadmin/clients/new" className="text-violet-400 hover:underline">
              Add your first client →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {recentBusinesses.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/superadmin/clients/${b.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-800 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{b.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">/{b.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-full capitalize">
                      {b.plan}
                    </span>
                    <span className="text-gray-600 text-xs">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick action */}
      <div className="mt-6">
        <Link
          href="/superadmin/clients/new"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + Onboard New Client
        </Link>
      </div>
    </div>
  )
}
