import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  LogOut,
} from 'lucide-react'
import Logo from '@/components/layout/Logo'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: BarChart3 },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/bn')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'staff'].includes(profile.role)) redirect('/bn')

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-col bg-gray-950 text-white md:flex">
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10">
          <Logo height={28} className="shrink-0 brightness-0 invert" />
          <span className="font-semibold text-sm">Alam Dairy Admin</span>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/8 transition-colors rounded-none"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/signout" method="POST">
          <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white/40 hover:text-white border-t border-white/10 hover:bg-white/8 transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center gap-3 bg-gray-950 px-4 py-3 md:hidden">
        <Logo height={28} className="shrink-0 brightness-0 invert" />
        <span className="font-semibold text-sm text-white">Alam Dairy Admin</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 pt-16 md:pt-4 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
