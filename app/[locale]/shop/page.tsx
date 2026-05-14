import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/product/ProductCard'
import ShopFilters from '@/components/product/ShopFilters'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ type?: string; q?: string }>
}

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { type, q } = await searchParams
  const t = await getTranslations('shop')

  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (type && type !== 'all') {
    query = query.contains('tags', [type])
  }
  if (q) {
    query = query.or(`name_bn.ilike.%${q}%,name_en.ilike.%${q}%`)
  }

  const { data: products } = await query
  const base = `/${locale}/shop`

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
              {products.length} {locale === 'bn' ? 'পণ্য পাওয়া গেছে' : 'products available'}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <ShopFilters locale={locale} activeType={type} />
        {products && products.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} basePath={base} />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <span className="text-3xl">🥛</span>
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
