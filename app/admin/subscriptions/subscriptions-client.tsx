'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface SubscriptionRow {
  id: string
  frequency: string
  quantity: number
  unit_price: number
  status: string
  next_billing_date: string
  last_renewal_status: string | null
  last_renewal_error: string | null
  last_renewal_at: string | null
  products: { name_en: string } | null
  profiles: { full_name: string | null; phone: string | null } | null
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default function SubscriptionsClient({ subscriptions }: { subscriptions: SubscriptionRow[] }) {
  const router = useRouter()
  const [retryingId, setRetryingId] = useState<string | null>(null)

  async function handleRetry(id: string) {
    setRetryingId(id)
    await fetch(`/api/admin/subscriptions/${id}/retry`, { method: 'POST' })
    router.refresh()
    setRetryingId(null)
  }

  if (subscriptions.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No subscriptions yet.</p>
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Frequency</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Next Billing</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Last Renewal</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">{s.profiles?.full_name ?? s.profiles?.phone ?? '—'}</td>
                  <td className="px-4 py-3">{s.products?.name_en} × {s.quantity}</td>
                  <td className="px-4 py-3 capitalize">{s.frequency}</td>
                  <td className="px-4 py-3">{s.next_billing_date}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={STATUS_COLORS[s.status] ?? ''}>{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.last_renewal_status === 'failed' ? (
                      <span className="text-xs text-red-600" title={s.last_renewal_error ?? ''}>Failed</span>
                    ) : s.last_renewal_status === 'success' ? (
                      <span className="text-xs text-green-600">OK</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.last_renewal_status === 'failed' && s.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={retryingId === s.id}
                        onClick={() => handleRetry(s.id)}
                        className="gap-1"
                      >
                        <RefreshCw className="h-3 w-3" /> Retry
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
