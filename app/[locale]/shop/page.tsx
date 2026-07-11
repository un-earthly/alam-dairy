import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { queryProducts, type ShopSort } from '@/lib/shop/queryProducts'
import ShopFilterRail from '@/components/product/ShopFilterRail'
import ShopResults from '@/components/product/ShopResults'
import CategoryGrid from '@/components/product/CategoryGrid'
import CornerOrnament from '@/components/site/CornerOrnament'

const SORTS: ShopSort[] = ['newest', 'price_asc', 'price_desc']

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    category?: string
    brand?: string
    q?: string
    min?: string
    max?: string
    sort?: string
  }>
}

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { category, brand, q, min, max, sort } = await searchParams
  const t = await getTranslations('shop')

  const supabase = await createClient()

  const [{ products, hasMore, total }, { data: categories }, { data: brands }] = await Promise.all([
    queryProducts(supabase, {
      categoryId: category,
      brandId: brand,
      q,
      minPrice: min ? Number(min) : undefined,
      maxPrice: max ? Number(max) : undefined,
      sort: SORTS.includes(sort as ShopSort) ? (sort as ShopSort) : 'newest',
    }),
    supabase.from('categories').select('*').is('parent_id', null).eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('brands').select('*').eq('is_active', true).order('name', { ascending: true }),
  ])

  const base = `/${locale}/shop`
  const filterKey = JSON.stringify({ category, brand, q, min, max, sort })

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden border-b bg-secondary/40">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/oeon1p4w/image/upload/v1783768887/marketing/doodle.png)', backgroundSize: '420px' }}
        />
        <CornerOrnament corner="tr" size={200} rotate={-6} opacity={0.3} />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <p className="font-accent text-lg text-pasture">{t('hero_eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t('hero_title')}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">{t('hero_subtitle')}</p>
          {total > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              {total} {locale === 'bn' ? 'পণ্য পাওয়া গেছে' : 'products available'}
            </p>
          )}
        </div>
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <CategoryGrid categories={categories} locale={locale} activeCategoryId={category} />
        </div>
      )}

      {/* Content: sticky filter rail + scrolling product grid */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          <ShopFilterRail categories={categories ?? []} brands={brands ?? []} locale={locale} />
          <ShopResults key={filterKey} initialProducts={products} initialHasMore={hasMore} basePath={base} />
        </div>
      </div>
    </>
  )
}
