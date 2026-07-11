'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pause, Play, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { pauseSubscription, resumeSubscription, cancelSubscription, toggleSkipNextCycle } from './actions'

interface SubscriptionRow {
  id: string
  frequency: string
  quantity: number
  unit_price: number
  status: string
  next_billing_date: string
  skip_next_cycle: boolean
  products: { name_bn: string; name_en: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

const FREQUENCY_LABELS: Record<string, { en: string; bn: string }> = {
  daily: { en: 'Daily', bn: 'প্রতিদিন' },
  weekly: { en: 'Weekly', bn: 'সাপ্তাহিক' },
  biweekly: { en: 'Every 2 weeks', bn: 'প্রতি ২ সপ্তাহে' },
  monthly: { en: 'Monthly', bn: 'মাসিক' },
}

export default function SubscriptionsClient({
  subscriptions,
  locale,
}: {
  subscriptions: SubscriptionRow[]
  locale: string
}) {
  const router = useRouter()
  const isBn = locale === 'bn'
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function run(id: string, fn: () => Promise<unknown>) {
    setPendingId(id)
    await fn()
    router.refresh()
    setPendingId(null)
  }

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        {isBn ? 'কোনো সক্রিয় সাবস্ক্রিপশন নেই।' : "You don't have any subscriptions yet."}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((s) => {
        const name = isBn ? s.products?.name_bn : s.products?.name_en
        const freq = FREQUENCY_LABELS[s.frequency]
        const busy = pendingId === s.id
        return (
          <Card key={s.id}>
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{name} × {s.quantity}</p>
                  <Badge className={STATUS_COLORS[s.status] ?? ''}>{s.status}</Badge>
                  {s.skip_next_cycle && s.status === 'active' && (
                    <Badge variant="outline" className="text-xs">{isBn ? 'পরবর্তী চক্র বাদ' : 'Next cycle skipped'}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {isBn ? freq?.bn : freq?.en} · ৳{s.unit_price.toLocaleString('bn-BD')} ·{' '}
                  {isBn ? 'পরবর্তী' : 'Next'}: {s.next_billing_date}
                </p>
              </div>
              {s.status !== 'cancelled' && (
                <div className="flex gap-2">
                  {s.status === 'active' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => run(s.id, () => toggleSkipNextCycle({ id: s.id, skip: !s.skip_next_cycle }))}
                        className="gap-1"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {s.skip_next_cycle ? (isBn ? 'বাদ বাতিল' : 'Undo Skip') : (isBn ? 'পরবর্তী বাদ দিন' : 'Skip Next')}
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => run(s.id, () => pauseSubscription({ id: s.id }))} className="gap-1">
                        <Pause className="h-3.5 w-3.5" /> {isBn ? 'স্থগিত' : 'Pause'}
                      </Button>
                    </>
                  )}
                  {s.status === 'paused' && (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => run(s.id, () => resumeSubscription({ id: s.id }))} className="gap-1">
                      <Play className="h-3.5 w-3.5" /> {isBn ? 'পুনরায় শুরু' : 'Resume'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      if (confirm(isBn ? 'বাতিল করবেন?' : 'Cancel this subscription?')) {
                        run(s.id, () => cancelSubscription({ id: s.id }))
                      }
                    }}
                    className="gap-1 text-red-600 hover:text-red-700"
                  >
                    <X className="h-3.5 w-3.5" /> {isBn ? 'বাতিল' : 'Cancel'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
