import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import OrderStatusSelect from '@/components/admin/OrderStatusSelect'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-teal-100 text-teal-800',
  dispatched: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total, payment_method, payment_status, address, contact_phone, created_at, notes')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(orders ?? []).map((order) => {
                  const address = order.address as Record<string, string> | null
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-gray-500">{order.order_number ?? order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{address?.name ?? 'Guest'}</p>
                        <p className="text-xs text-gray-400">{order.contact_phone ?? address?.phone}</p>
                        <p className="text-xs text-gray-400">{address?.area}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="uppercase text-xs font-medium text-gray-600">{order.payment_method}</p>
                        <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_COLORS[order.payment_status] ?? ''}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-700">
                        ৳{order.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                      </td>
                    </tr>
                  )
                })}
                {(orders ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
