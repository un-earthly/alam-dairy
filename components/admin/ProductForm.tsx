'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Plus, X, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import type { SubscriptionFrequency } from '@/lib/supabase/types'

const PRODUCT_TYPES = [
  { value: 'dairy', label: 'Dairy Product' },
  { value: 'cattle', label: 'Cattle' },
  { value: 'feed', label: 'Animal Feed' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'vet_supply', label: 'Veterinary Supply' },
]

const FREQUENCIES: { value: SubscriptionFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
]

interface MediaItem {
  id?: string
  url: string
  alt_en?: string
}

interface VariantItem {
  id?: string
  name_bn: string
  name_en: string
  attributesText: string
  price: string
  sale_price: string
  stock: string
  sku: string
}

interface TierItem {
  id?: string
  min_qty: string
  price: string
}

interface SubPlanState {
  enabled: boolean
  id?: string
  discount_percent: string
}

interface CategoryOption {
  id: string
  name_en: string
}
interface BrandOption {
  id: string
  name: string
}

interface ProductFormProps {
  categories: CategoryOption[]
  brands: BrandOption[]
  initialData?: {
    id: string
    name_bn: string
    name_en: string
    description_bn: string | null
    description_en: string | null
    type: string
    price: number
    sale_price: number | null
    unit: string
    stock: number
    is_active: boolean
    tags: string[]
    category_id: string | null
    brand_id: string | null
    subscription_eligible: boolean
    seo_title_bn: string | null
    seo_title_en: string | null
    seo_description_bn: string | null
    seo_description_en: string | null
    og_image_url: string | null
    is_featured: boolean
    featured_sort_order: number
    media: MediaItem[]
    variants: VariantItem[]
    bulkTiers: TierItem[]
    subscriptionPlans: Partial<Record<SubscriptionFrequency, { id: string; discount_percent: number }>>
  }
}

function makeSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
}

function parseAttributes(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  text.split(',').forEach((pair) => {
    const [k, v] = pair.split(':').map((s) => s.trim())
    if (k && v) out[k] = v
  })
  return out
}

export function attributesToText(attrs: Record<string, string> | null | undefined) {
  if (!attrs) return ''
  return Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ')
}

export default function ProductForm({ categories, brands, initialData }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const [form, setForm] = useState({
    name_bn: initialData?.name_bn ?? '',
    name_en: initialData?.name_en ?? '',
    description_bn: initialData?.description_bn ?? '',
    description_en: initialData?.description_en ?? '',
    type: initialData?.type ?? 'dairy',
    price: initialData?.price.toString() ?? '',
    sale_price: initialData?.sale_price?.toString() ?? '',
    unit: initialData?.unit ?? 'kg',
    stock: initialData?.stock.toString() ?? '0',
    is_active: initialData?.is_active ?? true,
    is_featured: initialData?.is_featured ?? false,
    tags: initialData?.tags ?? [] as string[],
    tagInput: '',
    category_id: initialData?.category_id ?? '',
    brand_id: initialData?.brand_id ?? '',
    subscription_eligible: initialData?.subscription_eligible ?? false,
    seo_title_bn: initialData?.seo_title_bn ?? '',
    seo_title_en: initialData?.seo_title_en ?? '',
    seo_description_bn: initialData?.seo_description_bn ?? '',
    seo_description_en: initialData?.seo_description_en ?? '',
  })

  const [media, setMedia] = useState<MediaItem[]>(initialData?.media ?? [])
  const [ogImageUrl, setOgImageUrl] = useState(initialData?.og_image_url ?? '')
  const [variants, setVariants] = useState<VariantItem[]>(initialData?.variants ?? [])
  const [bulkTiers, setBulkTiers] = useState<TierItem[]>(initialData?.bulkTiers ?? [])
  const [subPlans, setSubPlans] = useState<Record<SubscriptionFrequency, SubPlanState>>(() => {
    const base: Record<SubscriptionFrequency, SubPlanState> = {
      daily: { enabled: false, discount_percent: '0' },
      weekly: { enabled: false, discount_percent: '0' },
      biweekly: { enabled: false, discount_percent: '0' },
      monthly: { enabled: false, discount_percent: '0' },
    }
    const existing = initialData?.subscriptionPlans
    if (existing) {
      for (const freq of Object.keys(existing) as SubscriptionFrequency[]) {
        const plan = existing[freq]
        if (plan) base[freq] = { enabled: true, id: plan.id, discount_percent: String(plan.discount_percent) }
      }
    }
    return base
  })

  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [uploadingOg, setUploadingOg] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function addTag() {
    const tag = form.tagInput.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) {
      set('tags', [...form.tags, tag])
    }
    set('tagInput', '')
  }

  function removeTag(tag: string) {
    set('tags', form.tags.filter((t) => t !== tag))
  }

  async function uploadFile(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Upload failed')
    return json.secure_url as string
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploadingMedia(true)
    setError('')
    try {
      for (const file of files) {
        const url = await uploadFile(file)
        setMedia((m) => [...m, { url }])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingMedia(false)
      e.target.value = ''
    }
  }

  async function handleOgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingOg(true)
    try {
      setOgImageUrl(await uploadFile(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingOg(false)
      e.target.value = ''
    }
  }

  function removeMedia(idx: number) {
    setMedia((m) => m.filter((_, i) => i !== idx))
  }

  function moveMedia(idx: number, dir: -1 | 1) {
    setMedia((m) => {
      const next = [...m]
      const target = idx + dir
      if (target < 0 || target >= next.length) return m
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  function addVariant() {
    setVariants((v) => [...v, { name_bn: '', name_en: '', attributesText: '', price: form.price, sale_price: '', stock: '0', sku: '' }])
  }
  function updateVariant(idx: number, field: keyof VariantItem, value: string) {
    setVariants((v) => v.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))
  }
  function removeVariant(idx: number) {
    setVariants((v) => v.filter((_, i) => i !== idx))
  }

  function addTier() {
    setBulkTiers((t) => [...t, { min_qty: '', price: '' }])
  }
  function updateTier(idx: number, field: keyof TierItem, value: string) {
    setBulkTiers((t) => t.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))
  }
  function removeTier(idx: number) {
    setBulkTiers((t) => t.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const slug = isEdit ? undefined : makeSlug(form.name_en) + '-' + Date.now().toString(36)

      const payload = {
        name_bn: form.name_bn,
        name_en: form.name_en,
        description_bn: form.description_bn || null,
        description_en: form.description_en || null,
        type: form.type as 'dairy' | 'cattle' | 'feed' | 'equipment' | 'vet_supply',
        price: parseFloat(form.price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        unit: form.unit,
        stock: parseInt(form.stock, 10),
        is_active: form.is_active,
        tags: form.tags,
        images: [] as string[],
        meta: {},
        category_id: form.category_id || null,
        brand_id: form.brand_id || null,
        has_variants: variants.length > 0,
        subscription_eligible: form.subscription_eligible,
        allow_backorder: false,
        preorder_release_date: null,
        seo_title_bn: form.seo_title_bn || null,
        seo_title_en: form.seo_title_en || null,
        seo_description_bn: form.seo_description_bn || null,
        seo_description_en: form.seo_description_en || null,
        og_image_url: ogImageUrl || null,
        is_featured: form.is_featured,
        featured_sort_order: initialData?.featured_sort_order ?? 0,
        ...(slug ? { slug } : {}),
      }

      let productId: string
      if (isEdit && initialData) {
        productId = initialData.id
        const { error: err } = await supabase.from('products').update(payload).eq('id', productId)
        if (err) throw err
      } else {
        const { data, error: err } = await supabase.from('products').insert({ ...payload, slug: slug!, vendor_id: null }).select('id').single()
        if (err) throw err
        productId = data.id
      }

      // --- product_media diff ---
      const existingMediaIds = new Set((initialData?.media ?? []).map((m) => m.id).filter(Boolean))
      const keptMediaIds = new Set(media.map((m) => m.id).filter(Boolean))
      const removedMediaIds = [...existingMediaIds].filter((id) => !keptMediaIds.has(id))
      if (removedMediaIds.length > 0) {
        await supabase.from('product_media').delete().in('id', removedMediaIds as string[])
      }
      for (let i = 0; i < media.length; i++) {
        const m = media[i]
        if (m.id) {
          await supabase.from('product_media').update({ sort_order: i, alt_en: m.alt_en ?? null }).eq('id', m.id)
        } else {
          await supabase.from('product_media').insert({ product_id: productId, url: m.url, sort_order: i, alt_en: m.alt_en ?? null, alt_bn: null })
        }
      }

      // --- variants diff ---
      const existingVariantIds = new Set((initialData?.variants ?? []).map((v) => v.id).filter(Boolean))
      const keptVariantIds = new Set(variants.map((v) => v.id).filter(Boolean))
      const removedVariantIds = [...existingVariantIds].filter((id) => !keptVariantIds.has(id))
      if (removedVariantIds.length > 0) {
        await supabase.from('product_variants').delete().in('id', removedVariantIds as string[])
      }
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i]
        const row = {
          product_id: productId,
          name_bn: v.name_bn,
          name_en: v.name_en,
          attributes: parseAttributes(v.attributesText),
          price: parseFloat(v.price) || 0,
          sale_price: v.sale_price ? parseFloat(v.sale_price) : null,
          stock: parseInt(v.stock, 10) || 0,
          sku: v.sku || null,
          sort_order: i,
          is_active: true,
        }
        if (v.id) {
          await supabase.from('product_variants').update(row).eq('id', v.id)
        } else {
          await supabase.from('product_variants').insert(row)
        }
      }

      // --- bulk pricing tiers diff ---
      const existingTierIds = new Set((initialData?.bulkTiers ?? []).map((t) => t.id).filter(Boolean))
      const keptTierIds = new Set(bulkTiers.map((t) => t.id).filter(Boolean))
      const removedTierIds = [...existingTierIds].filter((id) => !keptTierIds.has(id))
      if (removedTierIds.length > 0) {
        await supabase.from('bulk_pricing_tiers').delete().in('id', removedTierIds as string[])
      }
      for (const t of bulkTiers) {
        if (!t.min_qty || !t.price) continue
        const row = { product_id: productId, variant_id: null, min_qty: parseInt(t.min_qty, 10), price: parseFloat(t.price) }
        if (t.id) {
          await supabase.from('bulk_pricing_tiers').update(row).eq('id', t.id)
        } else {
          await supabase.from('bulk_pricing_tiers').insert(row)
        }
      }

      // --- subscription plans diff ---
      for (const freq of Object.keys(subPlans) as SubscriptionFrequency[]) {
        const plan = subPlans[freq]
        if (plan.enabled) {
          const row = {
            product_id: productId,
            variant_id: null,
            frequency: freq,
            discount_percent: parseFloat(plan.discount_percent) || 0,
            is_active: true,
          }
          if (plan.id) {
            await supabase.from('product_subscription_plans').update(row).eq('id', plan.id)
          } else {
            await supabase.from('product_subscription_plans').insert(row)
          }
        } else if (plan.id) {
          await supabase.from('product_subscription_plans').delete().eq('id', plan.id)
        }
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Product Names</h2>
          <div className="space-y-1.5">
            <Label htmlFor="name_bn">Bengali Name *</Label>
            <Input id="name_bn" value={form.name_bn} onChange={(e) => set('name_bn', e.target.value)} required placeholder="বাংলা নাম" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name_en">English Name *</Label>
            <Input id="name_en" value={form.name_en} onChange={(e) => set('name_en', e.target.value)} required placeholder="English name" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Description</h2>
          <div className="space-y-1.5">
            <Label htmlFor="desc_bn">Bengali Description</Label>
            <textarea
              id="desc_bn"
              value={form.description_bn}
              onChange={(e) => set('description_bn', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="পণ্যের বিবরণ..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc_en">English Description</Label>
            <textarea
              id="desc_en"
              value={form.description_en}
              onChange={(e) => set('description_en', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Product description..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Images</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {media.map((m, i) => (
              <div key={m.id ?? m.url} className="relative rounded-lg border overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt="" className="h-24 w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => moveMedia(i, -1)} className="rounded bg-white/90 p-1"><ArrowUp className="h-3 w-3" /></button>
                  <button type="button" onClick={() => moveMedia(i, 1)} className="rounded bg-white/90 p-1"><ArrowDown className="h-3 w-3" /></button>
                  <button type="button" onClick={() => removeMedia(i)} className="rounded bg-white/90 p-1 text-red-600"><X className="h-3 w-3" /></button>
                </div>
                {i === 0 && <span className="absolute top-1 left-1 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-medium text-white">Featured</span>}
              </div>
            ))}
            <label className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-green-400 hover:text-green-600 cursor-pointer text-xs">
              {uploadingMedia ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-5 w-5" />Add</>}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleMediaUpload} disabled={uploadingMedia} />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">First image is the featured/thumbnail image. Drag order with the arrows.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Type, Category & Pricing</h2>
          <div className="space-y-1.5">
            <Label>Product Type *</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRODUCT_TYPES.map((pt) => (
                <button
                  type="button"
                  key={pt.value}
                  onClick={() => set('type', pt.value)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${form.type === pt.value ? 'border-green-600 bg-green-50 text-green-700 font-medium' : 'border-gray-200 hover:border-green-400'}`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={form.category_id}
                onChange={(e) => set('category_id', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <select
                id="brand"
                value={form.brand_id}
                onChange={(e) => set('brand_id', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">None</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (৳) *</Label>
              <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} required placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sale_price">Sale Price (৳)</Label>
              <Input id="sale_price" type="number" min="0" step="0.01" value={form.sale_price} onChange={(e) => set('sale_price', e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit *</Label>
              <Input id="unit" value={form.unit} onChange={(e) => set('unit', e.target.value)} required placeholder="kg / litre / piece" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock *</Label>
              <Input id="stock" type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} required />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Variants</h2>
            <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Variant</Button>
          </div>
          {variants.length === 0 && <p className="text-xs text-muted-foreground">No variants — product sells as a single item using the price/stock above.</p>}
          {variants.map((v, i) => (
            <div key={v.id ?? i} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-medium text-gray-500"><GripVertical className="h-3 w-3" /> Variant {i + 1}</span>
                <button type="button" onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Bengali name" value={v.name_bn} onChange={(e) => updateVariant(i, 'name_bn', e.target.value)} />
                <Input placeholder="English name" value={v.name_en} onChange={(e) => updateVariant(i, 'name_en', e.target.value)} />
              </div>
              <Input placeholder="Attributes e.g. size: 500ml, flavor: plain" value={v.attributesText} onChange={(e) => updateVariant(i, 'attributesText', e.target.value)} />
              <div className="grid grid-cols-4 gap-2">
                <Input placeholder="Price" type="number" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} />
                <Input placeholder="Sale price" type="number" value={v.sale_price} onChange={(e) => updateVariant(i, 'sale_price', e.target.value)} />
                <Input placeholder="Stock" type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} />
                <Input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Bulk Pricing Tiers</h2>
            <Button type="button" variant="outline" size="sm" onClick={addTier} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Tier</Button>
          </div>
          <p className="text-xs text-muted-foreground">Applies to whole-product quantity. E.g. min qty 6 at ৳75 for &quot;buy 6+, save&quot; pricing.</p>
          {bulkTiers.map((t, i) => (
            <div key={t.id ?? i} className="flex items-center gap-2">
              <Input placeholder="Min qty" type="number" min="2" value={t.min_qty} onChange={(e) => updateTier(i, 'min_qty', e.target.value)} />
              <Input placeholder="Price per unit" type="number" min="0" value={t.price} onChange={(e) => updateTier(i, 'price', e.target.value)} />
              <button type="button" onClick={() => removeTier(i)} className="text-red-500 hover:text-red-700 shrink-0"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.subscription_eligible} onChange={(e) => set('subscription_eligible', e.target.checked)} className="rounded border-gray-300" />
            <span className="font-semibold text-gray-700">Available for Subscription (Subscribe & Save)</span>
          </label>
          {form.subscription_eligible && (
            <div className="space-y-2 pl-6">
              {FREQUENCIES.map((f) => (
                <div key={f.value} className="flex items-center gap-3">
                  <label className="flex w-40 items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subPlans[f.value].enabled}
                      onChange={(e) => setSubPlans((s) => ({ ...s, [f.value]: { ...s[f.value], enabled: e.target.checked } }))}
                      className="rounded border-gray-300"
                    />
                    {f.label}
                  </label>
                  {subPlans[f.value].enabled && (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        className="w-20"
                        value={subPlans[f.value].discount_percent}
                        onChange={(e) => setSubPlans((s) => ({ ...s, [f.value]: { ...s[f.value], discount_percent: e.target.value } }))}
                      />
                      <span className="text-xs text-muted-foreground">% off</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Tags</h2>
          <div className="flex gap-2">
            <Input
              value={form.tagInput}
              onChange={(e) => set('tagInput', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="milk, yogurt, halal..."
            />
            <Button type="button" variant="outline" onClick={addTag} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold text-gray-700">SEO</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="seo_title_bn">SEO Title (Bengali)</Label>
              <Input id="seo_title_bn" value={form.seo_title_bn} onChange={(e) => set('seo_title_bn', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seo_title_en">SEO Title (English)</Label>
              <Input id="seo_title_en" value={form.seo_title_en} onChange={(e) => set('seo_title_en', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="seo_desc_bn">SEO Description (Bengali)</Label>
              <textarea id="seo_desc_bn" value={form.seo_description_bn} onChange={(e) => set('seo_description_bn', e.target.value)} rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seo_desc_en">SEO Description (English)</Label>
              <textarea id="seo_desc_en" value={form.seo_description_en} onChange={(e) => set('seo_description_en', e.target.value)} rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Social Share Image (og:image)</Label>
            <div className="flex items-center gap-3">
              {ogImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ogImageUrl} alt="" className="h-12 w-12 rounded-md object-cover border" />
              )}
              <Input type="file" accept="image/*" onChange={handleOgUpload} disabled={uploadingOg} />
            </div>
            <p className="text-xs text-muted-foreground">Defaults to the featured product image if left empty.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set('is_active', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium">Active (visible in store)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => set('is_featured', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium">Featured (promoted in shop)</span>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : isEdit ? 'Update Product' : 'Add Product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
