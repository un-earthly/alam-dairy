import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm, { attributesToText } from '@/components/admin/ProductForm'
import type { SubscriptionFrequency } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: product },
    { data: media },
    { data: variants },
    { data: bulkTiers },
    { data: subscriptionPlans },
    { data: categories },
    { data: brands },
  ] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('product_media').select('*').eq('product_id', id).order('sort_order', { ascending: true }),
    supabase.from('product_variants').select('*').eq('product_id', id).order('sort_order', { ascending: true }),
    supabase.from('bulk_pricing_tiers').select('*').eq('product_id', id).is('variant_id', null).order('min_qty', { ascending: true }),
    supabase.from('product_subscription_plans').select('*').eq('product_id', id).is('variant_id', null),
    supabase.from('categories').select('id, name_en').order('sort_order', { ascending: true }),
    supabase.from('brands').select('id, name').order('name', { ascending: true }),
  ])

  if (!product) notFound()

  const subscriptionPlansMap: Partial<Record<SubscriptionFrequency, { id: string; discount_percent: number }>> = {}
  for (const plan of subscriptionPlans ?? []) {
    subscriptionPlansMap[plan.frequency] = { id: plan.id, discount_percent: plan.discount_percent }
  }

  const initialData = {
    ...product,
    media: (media ?? []).map((m) => ({ id: m.id, url: m.url, alt_en: m.alt_en ?? undefined })),
    variants: (variants ?? []).map((v) => ({
      id: v.id,
      name_bn: v.name_bn,
      name_en: v.name_en,
      attributesText: attributesToText(v.attributes as Record<string, string>),
      price: String(v.price),
      sale_price: v.sale_price != null ? String(v.sale_price) : '',
      stock: String(v.stock),
      sku: v.sku ?? '',
    })),
    bulkTiers: (bulkTiers ?? []).map((t) => ({ id: t.id, min_qty: String(t.min_qty), price: String(t.price) })),
    subscriptionPlans: subscriptionPlansMap,
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      <ProductForm categories={categories ?? []} brands={brands ?? []} initialData={initialData} />
    </div>
  )
}
