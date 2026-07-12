import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProductRating({
  rating,
  reviewCount,
  className,
}: {
  rating: number
  reviewCount: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-1 text-xs text-muted-foreground', className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-3 w-3',
              i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
            )}
          />
        ))}
      </div>
      <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
      <span>({reviewCount})</span>
    </div>
  )
}
