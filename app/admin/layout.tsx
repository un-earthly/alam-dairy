import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Milk,
  LogOut,
} from 'lucide-react'

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-col bg-gray-900 text-white md:flex">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-800">
          <Milk className="h-5 w-5 text-green-400" />
          <span className="font-bold text-sm">Alam Dairy Admin</span>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/signout" method="POST">
          <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white border-t border-gray-800 hover:bg-gray-800 transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center gap-3 bg-gray-900 px-4 py-3 md:hidden">
        <Milk className="h-5 w-5 text-green-400" />
        <span className="font-bold text-sm text-white">Alam Dairy Admin</span>
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
