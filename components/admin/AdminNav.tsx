'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/settings', label: 'Settings' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-0.5">
      {links.map(({ href, label }) => {
        const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
              active
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
