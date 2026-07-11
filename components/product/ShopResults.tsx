'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import CornerOrnament from '@/components/site/CornerOrnament'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

export default function ShopResults({
  initialProducts,
  initialHasMore,
  basePath,
}: {
  initialProducts: Product[]
  initialHasMore: boolean
  basePath: string
}) {
  const t = useTranslations('shop')
  const searchParams = useSearchParams()
  const [products, setProducts] = useState(initialProducts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  // Refs (not state) guard re-entrancy: IntersectionObserver can fire its
  // callback multiple times before a state update commits, so a `loading`
  // *state* check alone lets duplicate fetches race through and append the
  // same products twice. Refs read/write synchronously, closing that race.
  const loadingRef = useRef(false)
  const hasMoreRef = useRef(initialHasMore)
  const pageRef = useRef(0)

  async function loadMore() {
    if (loadingRef.current || !hasMoreRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const nextPage = pageRef.current + 1
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(nextPage))
      const res = await fetch(`/api/shop/products?${params.toString()}`)
      const json = await res.json()
      setProducts((prev) => [...prev, ...json.products])
      hasMoreRef.current = json.hasMore
      setHasMore(json.hasMore)
      pageRef.current = nextPage
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (products.length === 0) {
    return (
      <div className="relative mt-12 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl py-20 text-center">
        <CornerOrnament corner="tl" size={100} opacity={0.2} />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <span className="text-3xl">🥛</span>
        </div>
        <p className="font-semibold text-foreground">{t('no_more_results')}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} basePath={basePath} />
        ))}
      </div>

      <div ref={sentinelRef} className="flex justify-center py-8">
        {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        {!loading && !hasMore && (
          <p className="text-xs text-muted-foreground">{t('no_more_results')}</p>
        )}
        {!loading && hasMore && (
          <button
            onClick={loadMore}
            className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {t('load_more')}
          </button>
        )}
      </div>
    </div>
  )
}
