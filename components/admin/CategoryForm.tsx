'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface CategoryOption {
  id: string
  name_en: string
}

interface CategoryFormProps {
  categories: CategoryOption[]
  initialData?: {
    id: string
    name_bn: string
    name_en: string
    description_bn: string | null
    description_en: string | null
    parent_id: string | null
    is_active: boolean
  }
}

function makeSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
}

export default function CategoryForm({ categories, initialData }: CategoryFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const [form, setForm] = useState({
    name_bn: initialData?.name_bn ?? '',
    name_en: initialData?.name_en ?? '',
    description_bn: initialData?.description_bn ?? '',
    description_en: initialData?.description_en ?? '',
    parent_id: initialData?.parent_id ?? '',
    is_active: initialData?.is_active ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const payload = {
        name_bn: form.name_bn,
        name_en: form.name_en,
        description_bn: form.description_bn || null,
        description_en: form.description_en || null,
        parent_id: form.parent_id || null,
        is_active: form.is_active,
        image_url: null,
        sort_order: 0,
      }

      if (isEdit && initialData) {
        const { error: err } = await supabase.from('categories').update(payload).eq('id', initialData.id)
        if (err) throw err
      } else {
        const slug = makeSlug(form.name_en) + '-' + Date.now().toString(36)
        const { error: err } = await supabase.from('categories').insert({ ...payload, slug })
        if (err) throw err
      }

      router.push('/admin/categories')
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
          <div className="space-y-1.5">
            <Label htmlFor="name_bn">Bengali Name *</Label>
            <Input id="name_bn" value={form.name_bn} onChange={(e) => set('name_bn', e.target.value)} required placeholder="বাংলা নাম" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name_en">English Name *</Label>
            <Input id="name_en" value={form.name_en} onChange={(e) => set('name_en', e.target.value)} required placeholder="English name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="parent">Parent Category</Label>
            <select
              id="parent"
              value={form.parent_id}
              onChange={(e) => set('parent_id', e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">None (root category)</option>
              {categories.filter((c) => c.id !== initialData?.id).map((c) => (
                <option key={c.id} value={c.id}>{c.name_en}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc_bn">Bengali Description</Label>
            <textarea
              id="desc_bn"
              value={form.description_bn}
              onChange={(e) => set('description_bn', e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc_en">English Description</Label>
            <textarea
              id="desc_en"
              value={form.description_en}
              onChange={(e) => set('description_en', e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="rounded border-gray-300" />
            <span className="text-sm font-medium">Active (visible in store)</span>
          </label>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : isEdit ? 'Update Category' : 'Add Category'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
