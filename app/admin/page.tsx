import { createClient } from '@/lib/supabase/server'
import { ShoppingBag, Package, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [ordersRes, productsRes, customersRes] = await Promise.all([
    supabase.from('orders').select('id, total, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])

  const orders = ordersRes.data ?? []
  const totalProducts = productsRes.count ?? 0
  const totalCustomers = customersRes.count ?? 0
  const todayRevenue = orders
    .filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + o.total, 0)

  const stats = [
    { label: "Today's Revenue", value: `৳${todayRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-success' },
    { label: 'Total Orders',    value: orders.length.toString(),             icon: ShoppingBag, color: 'text-primary' },
    { label: 'Products',        value: totalProducts.toString(),             icon: Package,     color: 'text-primary' },
    { label: 'Customers',       value: totalCustomers.toString(),            icon: Users,       color: 'text-muted-foreground' },
  ]

  const STATUS_COLOR: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    processing: 'bg-primary/10 text-primary',
    dispatched: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    delivered:  'bg-success/10 text-success',
    cancelled:  'bg-destructive/10 text-destructive',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-xs text-primary hover:text-primary/80 transition-colors">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-mono text-foreground">{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-success">৳{order.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { href: '/admin/products/new', label: 'Add Product',      icon: '➕' },
          { href: '/admin/orders',        label: 'View Orders',      icon: '📦' },
          { href: '/admin/inventory',     label: 'Check Inventory',  icon: '📊' },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all duration-150"
          >
            <span className="text-xl">{a.icon}</span>
            <span className="text-sm font-medium text-foreground">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
