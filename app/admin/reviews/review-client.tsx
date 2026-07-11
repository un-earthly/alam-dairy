'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { approveReviews, deleteReviews } from './actions'

interface ReviewRow {
  id: string
  rating: number
  title: string | null
  body: string | null
  is_approved: boolean
  created_at: string
  products: { name_en: string } | null
  profiles: { full_name: string | null; phone: string | null } | null
}

export default function ReviewsClient({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function handleApprove(id: string) {
    setPendingId(id)
    await approveReviews({ ids: [id] })
    router.refresh()
    setPendingId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this review?')) return
    setPendingId(id)
    await deleteReviews({ ids: [id] })
    router.refresh()
    setPendingId(null)
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No reviews yet.</p>
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-4 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <Badge className={r.is_approved ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                  {r.is_approved ? 'Approved' : 'Pending'}
                </Badge>
                <span className="text-xs text-gray-500">{r.products?.name_en}</span>
              </div>
              {r.title && <p className="text-sm font-semibold">{r.title}</p>}
              {r.body && <p className="text-sm text-gray-600">{r.body}</p>}
              <p className="text-xs text-gray-400">
                {r.profiles?.full_name ?? r.profiles?.phone ?? 'Anonymous'} · {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              {!r.is_approved && (
                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" disabled={pendingId === r.id} onClick={() => handleApprove(r.id)}>
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" disabled={pendingId === r.id} onClick={() => handleDelete(r.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
