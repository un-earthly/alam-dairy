'use client'

import { useTranslations } from 'next-intl'
import ProductStrip from '@/components/product/ProductStrip'
import { useRecentlyViewedIds } from '@/hooks/useRecentlyViewed'
import type { Database } from '@/lib/supabase/types'
import type { ProductWithBrand } from '@/lib/shop/queryProducts'

type Product = Database['public']['Tables']['products']['Row'] | ProductWithBrand

export default function RecentlyViewedStrip({
  pool,
  basePath,
}: {
  pool: Product[]
  basePath: string
}) {
  const t = useTranslations('farm')
  const ids = useRecentlyViewedIds()
  const byId = new Map(pool.map((p) => [p.id, p]))
  const products = ids.map((id) => byId.get(id)).filter((p): p is Product => !!p)

  return <ProductStrip title={t('recently_viewed')} products={products} basePath={basePath} />
}
