'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Plus, X } from 'lucide-react'

const PRODUCT_TYPES = [
  { value: 'dairy', label: 'Dairy Product' },
  { value: 'cattle', label: 'Cattle' },
  { value: 'feed', label: 'Animal Feed' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'vet_supply', label: 'Veterinary Supply' },
]

interface ProductFormProps {
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
  }
}

export default function ProductForm({ initialData }: ProductFormProps) {
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
    tags: initialData?.tags ?? [] as string[],
    tagInput: '',
    slug: '',
  })

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

  function makeSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const slug = isEdit
        ? undefined
        : makeSlug(form.name_en) + '-' + Date.now().toString(36)

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
        images: [],
        meta: {},
        ...(slug ? { slug } : {}),
      }

      if (isEdit && initialData) {
        const { error: err } = await supabase.from('products').update(payload).eq('id', initialData.id)
        if (err) throw err
      } else {
        // slug is always defined in insert path
        const { error: err } = await supabase.from('products').insert({
          ...payload,
          slug: slug!,
        })
        if (err) throw err
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
          <h2 className="font-semibold text-gray-700">Type & Pricing</h2>
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
