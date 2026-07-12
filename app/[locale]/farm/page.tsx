import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import ProductSidebar from '@/components/product/ProductSidebar'
import CategoryGrid from '@/components/product/CategoryGrid'
import HeroTopSeller from '@/components/product/HeroTopSeller'
import FarmResults from '@/components/product/FarmResults'
import TrustBar from '@/components/site/TrustBar'
import ProductStrip from '@/components/product/ProductStrip'
import RecentlyViewedStrip from '@/components/product/RecentlyViewedStrip'
import CornerOrnament from '@/components/site/CornerOrnament'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { queryProducts, countProductsByCategory, type ShopSort } from '@/lib/shop/queryProducts'
import type { ProductType } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; q?: string; min?: string; max?: string; sort?: string }>
}

const FARM_TYPES: ProductType[] = ['cattle', 'feed', 'equipment']
const FARM_CATEGORY_SLUGS = ['cattle', 'feed', 'equipment']
const SORTS: ShopSort[] = ['newest', 'price_asc', 'price_desc', 'best_selling']

export default async function FarmPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { category, q, min, max, sort } = await searchParams
  const t = await getTranslations('farm')
  const isBn = locale === 'bn'

  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .in('slug', FARM_CATEGORY_SLUGS)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const [
    { products, hasMore, total },
    counts,
    { data: minRow },
    { data: maxRow },
    { data: pool },
    { products: topSellers },
  ] = await Promise.all([
    queryProducts(supabase, {
      types: FARM_TYPES,
      categoryId: category,
      q,
      minPrice: min ? Number(min) : undefined,
      maxPrice: max ? Number(max) : undefined,
      sort: SORTS.includes(sort as ShopSort) ? (sort as ShopSort) : 'newest',
    }),
    countProductsByCategory(supabase, (categories ?? []).map((c) => c.id), { types: FARM_TYPES }),
    supabase.from('products').select('price').eq('is_active', true).in('type', FARM_TYPES).order('price', { ascending: true }).limit(1),
    supabase.from('products').select('price').eq('is_active', true).in('type', FARM_TYPES).order('price', { ascending: false }).limit(1),
    supabase.from('products').select('*').eq('is_active', true).in('type', FARM_TYPES).limit(100),
    queryProducts(supabase, { types: FARM_TYPES, sort: 'best_selling', pageSize: 1 }),
  ])

  const base = `/${locale}/farm`
  const filterKey = JSON.stringify({ category, q, min, max, sort })
  const boundsMin = Math.floor(minRow?.[0]?.price ?? 0)
  const boundsMax = Math.ceil(maxRow?.[0]?.price ?? 0)

  const alsoBoughtPool = (pool ?? []).filter((p) => !products.some((x) => x.id === p.id)).slice(0, 8)

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
                <BreadcrumbLink href={`/${locale}/shop`}>{isBn ? 'পণ্য' : 'Products'}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('title')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {t('title')}
              </h1>
              {total > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {total} {isBn ? 'পণ্য পাওয়া গেছে' : 'items available'}
                </p>
              )}
            </div>
            {topSellers[0] && <HeroTopSeller product={topSellers[0]} basePath={base} locale={locale} />}
          </div>
        </div>
      </div>

      <TrustBar locale={locale} />

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
            counts={counts}
            totalCount={total}
            locale={locale}
            boundsMin={boundsMin}
            boundsMax={boundsMax}
          />
          <div className="min-w-0 flex-1">
            <FarmResults key={filterKey} initialProducts={products} initialHasMore={hasMore} basePath={base} />
          </div>
        </div>

        <ProductStrip
          title={isBn ? 'গ্রাহকরা আরও কিনেছেন' : 'Customers also bought'}
          products={alsoBoughtPool}
          basePath={base}
        />
        <RecentlyViewedStrip pool={pool ?? []} basePath={base} />
      </div>
    </>
  )
}
