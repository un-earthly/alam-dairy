import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { queryProducts, countProductsByCategory, type ShopSort } from '@/lib/shop/queryProducts'
import ProductSidebar from '@/components/product/ProductSidebar'
import ShopResults from '@/components/product/ShopResults'
import CategoryGrid from '@/components/product/CategoryGrid'
import HeroTopSeller from '@/components/product/HeroTopSeller'
import CornerOrnament from '@/components/site/CornerOrnament'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const SORTS: ShopSort[] = ['newest', 'price_asc', 'price_desc', 'best_selling']

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
  const isBn = locale === 'bn'

  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const [
    { products, hasMore, total },
    { data: brands },
    counts,
    { data: minRow },
    { data: maxRow },
    { products: topSellers },
  ] = await Promise.all([
    queryProducts(supabase, {
      categoryId: category,
      brandId: brand,
      q,
      minPrice: min ? Number(min) : undefined,
      maxPrice: max ? Number(max) : undefined,
      sort: SORTS.includes(sort as ShopSort) ? (sort as ShopSort) : 'newest',
    }),
    supabase.from('brands').select('*').eq('is_active', true).order('name', { ascending: true }),
    countProductsByCategory(supabase, (categories ?? []).map((c) => c.id)),
    supabase.from('products').select('price').eq('is_active', true).order('price', { ascending: true }).limit(1),
    supabase.from('products').select('price').eq('is_active', true).order('price', { ascending: false }).limit(1),
    queryProducts(supabase, { sort: 'best_selling', pageSize: 1 }),
  ])

  const base = `/${locale}/shop`
  const filterKey = JSON.stringify({ category, brand, q, min, max, sort })
  const boundsMin = Math.floor(minRow?.[0]?.price ?? 0)
  const boundsMax = Math.ceil(maxRow?.[0]?.price ?? 0)

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
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${locale}`}>{isBn ? 'হোম' : 'Home'}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('title')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-accent text-lg text-pasture">{t('hero_eyebrow')}</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {t('hero_title')}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">{t('hero_subtitle')}</p>
              {total > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {total} {isBn ? 'পণ্য পাওয়া গেছে' : 'products available'}
                </p>
              )}
            </div>
            {topSellers[0] && <HeroTopSeller product={topSellers[0]} basePath={base} locale={locale} />}
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <CategoryGrid categories={categories} locale={locale} activeCategoryId={category} />
        </div>
      )}

      {/* Content: sticky sidebar + scrolling product grid */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <ProductSidebar
            categories={categories ?? []}
            brands={brands ?? []}
            counts={counts}
            totalCount={total}
            locale={locale}
            boundsMin={boundsMin}
            boundsMax={boundsMax}
          />
          <div className="min-w-0 flex-1">
            <ShopResults key={filterKey} initialProducts={products} initialHasMore={hasMore} basePath={base} />
          </div>
        </div>
      </div>
    </>
  )
}
