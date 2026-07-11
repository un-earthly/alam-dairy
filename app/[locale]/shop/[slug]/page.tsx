import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck } from 'lucide-react'
import ProductGallery from '@/components/product/ProductGallery'
import ProductTabs from '@/components/product/ProductTabs'
import PurchaseOptions from '@/components/product/PurchaseOptions'
import RelatedProducts from '@/components/product/RelatedProducts'
import CornerOrnament from '@/components/site/CornerOrnament'
import type { ProductWithBrand } from '@/lib/shop/queryProducts'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select('*, brand:brands(name)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const [
    { data: media },
    { data: variants },
    { data: bulkTiers },
    { data: subscriptionPlans },
    { data: reviews },
    { data: relatedLinks },
  ] = await Promise.all([
    supabase.from('product_media').select('*').eq('product_id', product.id).order('sort_order', { ascending: true }),
    supabase.from('product_variants').select('*').eq('product_id', product.id).eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('bulk_pricing_tiers').select('*').eq('product_id', product.id).is('variant_id', null).order('min_qty', { ascending: true }),
    product.subscription_eligible
      ? supabase.from('product_subscription_plans').select('*').eq('product_id', product.id).is('variant_id', null).eq('is_active', true)
      : Promise.resolve({ data: [] as never[] }),
    supabase.from('product_reviews').select('*').eq('product_id', product.id).eq('is_approved', true).order('created_at', { ascending: false }).limit(20),
    supabase.from('related_products').select('related_product_id').eq('product_id', product.id).order('sort_order', { ascending: true }),
  ])

  // Verified-purchase badges need to see across all customers' orders, which
  // RLS rightly hides from a regular shopper's own session — use the admin
  // client for this narrow, read-only lookup (exposes nothing beyond "did
  // user X buy this product").
  const admin = createAdminClient()
  const { data: purchaseRows } = await admin
    .from('order_items')
    .select('orders(user_id)')
    .eq('product_id', product.id)
  const verifiedUserIds = new Set(
    ((purchaseRows ?? []) as unknown as { orders: { user_id: string | null } | null }[])
      .map((r) => r.orders?.user_id)
      .filter((id): id is string => !!id)
  )

  let related: ProductWithBrand[] = []
  const relatedIds = (relatedLinks ?? []).map((r) => r.related_product_id)
  if (relatedIds.length > 0) {
    const { data } = await supabase.from('products').select('*, brand:brands(name)').in('id', relatedIds).eq('is_active', true)
    related = (data ?? []) as unknown as ProductWithBrand[]
  }
  if (related.length === 0 && product.category_id) {
    const { data } = await supabase
      .from('products')
      .select('*, brand:brands(name)')
      .eq('category_id', product.category_id)
      .eq('is_active', true)
      .neq('id', product.id)
      .limit(4)
    related = (data ?? []) as unknown as ProductWithBrand[]
  }

  const isBn = locale === 'bn'
  const name = isBn ? product.name_bn : product.name_en
  const description = isBn ? product.description_bn : product.description_en

  const reviewList = reviews ?? []
  const reviewCount = reviewList.length
  const averageRating = reviewCount > 0 ? reviewList.reduce((s, r) => s + r.rating, 0) / reviewCount : 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl">
        <CornerOrnament corner="tl" size={180} rotate={-5} opacity={0.22} />
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2">
          <ProductGallery
            media={media ?? []}
            fallbackEmoji={product.type === 'cattle' ? '🐄' : product.type === 'dairy' ? '🥛' : '🌾'}
            name={name}
          />

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs capitalize">{product.type}</Badge>
                {product.brand?.name && <Badge variant="outline" className="text-xs">{product.brand.name}</Badge>}
                {product.tags.includes('halal') && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs gap-1">
                    <ShieldCheck className="h-3 w-3" /> Halal
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              {reviewCount > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  ★ {averageRating.toFixed(1)} · {reviewCount} {isBn ? 'রিভিউ' : 'reviews'}
                </p>
              )}
            </div>

            {description && <p className="text-gray-600 text-sm leading-relaxed">{description}</p>}

            <PurchaseOptions
              product={product}
              variants={variants ?? []}
              bulkTiers={bulkTiers ?? []}
              subscriptionPlans={subscriptionPlans ?? []}
              locale={locale}
            />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/oeon1p4w/image/upload/v1783768889/marketing/doodle-2.png)', backgroundSize: '340px' }}
        />
        <div className="relative">
          <ProductTabs
            description={description}
            meta={product.meta}
            reviews={reviewList}
            reviewCount={reviewCount}
            averageRating={averageRating}
            verifiedUserIds={verifiedUserIds}
            productId={product.id}
            locale={locale}
            isLoggedIn={!!user}
            loginHref={`/${locale}/auth`}
          />
        </div>
      </div>

      <RelatedProducts products={related} basePath={`/${locale}/shop`} title={isBn ? 'সম্পর্কিত পণ্য' : 'Related Products'} />
    </div>
  )
}
