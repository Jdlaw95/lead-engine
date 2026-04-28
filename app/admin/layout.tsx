import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from '@/components/admin/AdminNav'
import { signOutAction } from './actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id, businesses(name)')
    .eq('id', user.id)
    .single()

  const businessName = (profile?.businesses as unknown as { name: string } | null)?.name ?? 'Lead Engine'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Lead Engine</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{businessName}</p>
        </div>

        <div className="flex-1 px-3 py-4">
          <AdminNav />
        </div>

        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 truncate mb-2">{user.email}</p>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-8">
        {children}
      </main>
    </div>
  )
}
