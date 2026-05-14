import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/product/ProductCard'
import ShopFilters from '@/components/product/ShopFilters'
import type { ProductType } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ type?: string; q?: string }>
}

const FARM_TYPES: ProductType[] = ['cattle', 'feed', 'equipment', 'vet_supply']

export default async function FarmPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { type, q } = await searchParams
  const t = await getTranslations('farm')

  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .in('type', FARM_TYPES)
    .order('created_at', { ascending: false })

  if (type && type !== 'all') {
    const typeMap: Record<string, ProductType> = {
      cattle: 'cattle',
      feed: 'feed',
      vet: 'vet_supply',
      equipment: 'equipment',
    }
    const mappedType = typeMap[type]
    if (mappedType) query = query.eq('type', mappedType)
  }

  if (q) {
    query = query.or(`name_bn.ilike.%${q}%,name_en.ilike.%${q}%`)
  }

  const { data: products } = await query
  const base = `/${locale}/farm`

  return (
    <>
      {/* Page header */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h1>
          {products && products.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {products.length} {locale === 'bn' ? 'পণ্য পাওয়া গেছে' : 'items available'}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <ShopFilters locale={locale} activeType={type} mode="farm" />
        {products && products.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} basePath={base} />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <span className="text-3xl">🐄</span>
            </div>
            <p className="font-semibold text-foreground">
              {locale === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
            </p>
            <p className="text-sm text-muted-foreground">
              {locale === 'bn' ? 'অন্য ফিল্টার চেষ্টা করুন' : 'Try a different filter'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
