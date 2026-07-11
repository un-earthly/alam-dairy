import { Star, BadgeCheck } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Review = Database['public']['Tables']['product_reviews']['Row']

export default function ReviewList({
  reviews,
  locale,
  verifiedUserIds,
}: {
  reviews: Review[]
  locale: string
  verifiedUserIds: Set<string>
}) {
  const isBn = locale === 'bn'

  if (reviews.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        {isBn ? 'এখনও কোনো রিভিউ নেই। প্রথম রিভিউ দিন!' : 'No reviews yet. Be the first to review this product!'}
      </p>
    )
  }

  return (
    <div className="divide-y">
      {reviews.map((r) => (
        <div key={r.id} className="py-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            {r.user_id && verifiedUserIds.has(r.user_id) && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-green-700">
                <BadgeCheck className="h-3 w-3" /> {isBn ? 'যাচাইকৃত ক্রয়' : 'Verified Purchase'}
              </span>
            )}
          </div>
          {r.title && <p className="text-sm font-semibold text-foreground">{r.title}</p>}
          {r.body && <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>}
        </div>
      ))}
    </div>
  )
}
