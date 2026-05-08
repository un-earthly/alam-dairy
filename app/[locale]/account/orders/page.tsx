import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, Package } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ success?: string }>
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  dispatched: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_BN: Record<string, string> = {
  pending: 'অপেক্ষমাণ',
  confirmed: 'নিশ্চিত',
  processing: 'প্রক্রিয়াধীন',
  dispatched: 'পাঠানো হয়েছে',
  delivered: 'ডেলিভারি হয়েছে',
  cancelled: 'বাতিল',
}

export default async function OrdersPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { success } = await searchParams
  const isBn = locale === 'bn'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let orders: Array<{ id: string; status: string; total: number; created_at: string; payment_method: string }> = []

  if (user) {
    const { data } = await supabase
      .from('orders')
      .select('id, status, total, created_at, payment_method')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    orders = data ?? []
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">
              {isBn ? 'অর্ডার সফল হয়েছে!' : 'Order placed successfully!'}
            </p>
            <p className="text-sm text-green-700">
              {isBn ? `অর্ডার আইডি: ${success}` : `Order ID: ${success}`}
            </p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isBn ? 'আমার অর্ডার' : 'My Orders'}
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="font-medium">{isBn ? 'কোনো অর্ডার নেই' : 'No orders yet'}</p>
          <Link href={`/${locale}/shop`} className="mt-4 inline-block text-sm text-green-600 hover:underline">
            {isBn ? 'কেনাকাটা শুরু করুন' : 'Start shopping'}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 font-mono">{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString(isBn ? 'bn-BD' : 'en-GB')}
                </p>
              </div>
              <div className="flex-1 text-right">
                <p className="font-bold text-green-700">৳{order.total.toLocaleString(isBn ? 'bn-BD' : 'en-BD')}</p>
              </div>
              <Badge className={STATUS_COLORS[order.status] ?? ''}>
                {isBn ? STATUS_BN[order.status] : order.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
