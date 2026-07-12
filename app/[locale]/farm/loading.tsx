import ProductCardSkeleton from '@/components/product/ProductCardSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function FarmLoading() {
  return (
    <>
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-9 w-64" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  )
}
