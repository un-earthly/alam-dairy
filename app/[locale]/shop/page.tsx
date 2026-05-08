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
    .in('type', ['dairy'])
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h1>
      <ShopFilters locale={locale} activeType={type} />
      {products && products.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} basePath={base} />
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center text-gray-500 py-16">
          <p className="text-4xl mb-4">🥛</p>
          <p className="font-medium">{locale === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}</p>
        </div>
      )}
    </div>
  )
}
