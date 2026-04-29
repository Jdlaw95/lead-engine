import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Verify superadmin status
  const { data: superadmin } = await supabase
    .from('superadmins')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!superadmin) redirect('/admin/dashboard')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-white">Mikai</span>
          <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full font-medium">
            Superadmin
          </span>
        </div>
        <span className="text-sm text-gray-400">{user.email}</span>
      </header>

      {/* Nav + content */}
      <div className="flex">
        <aside className="w-52 min-h-[calc(100vh-57px)] border-r border-gray-800 p-4 shrink-0">
          <nav className="space-y-1">
            {[
              { href: '/superadmin', label: 'Overview' },
              { href: '/superadmin/clients', label: 'All Clients' },
              { href: '/superadmin/clients/new', label: '+ New Client' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
