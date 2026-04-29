import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-gray-800 text-gray-300 border-gray-700',
  growth:  'bg-blue-900 text-blue-300 border-blue-700',
  pro:     'bg-violet-900 text-violet-300 border-violet-700',
}

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, plan, modules, owner_email, created_at')
    .order('created_at', { ascending: false })

  const clients = businesses ?? []

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">All Clients</h1>
          <p className="text-gray-400 mt-1 text-sm">{clients.length} client{clients.length !== 1 ? 's' : ''} on the platform</p>
        </div>
        <Link
          href="/superadmin/clients/new"
          className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Client
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {clients.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-gray-500 text-sm mb-3">No clients yet.</p>
            <Link
              href="/superadmin/clients/new"
              className="text-violet-400 text-sm hover:underline"
            >
              Onboard your first client →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Modules</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {clients.map((b) => {
                const modules: string[] = b.modules ?? []
                const joined = new Date(b.created_at).toLocaleDateString('en-ZA', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })
                return (
                  <tr key={b.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{b.name}</p>
                      <p className="text-xs text-gray-500">{b.owner_email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-400">/{b.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${PLAN_COLORS[b.plan] ?? PLAN_COLORS.starter}`}>
                        {b.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {modules.map((m) => (
                          <span key={m} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                            {m.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{joined}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/superadmin/clients/${b.id}`}
                        className="text-violet-400 hover:text-violet-300 text-xs font-medium"
                      >
                        Manage →
                      </Link>
                    </td>
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
