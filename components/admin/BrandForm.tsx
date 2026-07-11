'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface BrandFormProps {
  initialData?: {
    id: string
    name: string
    logo_url: string | null
    is_active: boolean
  }
}

function makeSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
}

export default function BrandForm({ initialData }: BrandFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    logo_url: initialData?.logo_url ?? '',
    is_active: initialData?.is_active ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      set('logo_url', json.secure_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const payload = {
        name: form.name,
        logo_url: form.logo_url || null,
        is_active: form.is_active,
      }

      if (isEdit && initialData) {
        const { error: err } = await supabase.from('brands').update(payload).eq('id', initialData.id)
        if (err) throw err
      } else {
        const slug = makeSlug(form.name) + '-' + Date.now().toString(36)
        const { error: err } = await supabase.from('brands').insert({ ...payload, slug })
        if (err) throw err
      }

      router.push('/admin/brands')
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
            <Label htmlFor="name">Brand Name *</Label>
            <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logo">Logo</Label>
            <div className="flex items-center gap-3">
              {form.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logo_url} alt="" className="h-12 w-12 rounded-md object-contain border" />
              )}
              <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
            </div>
            {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="rounded border-gray-300" />
            <span className="text-sm font-medium">Active</span>
          </label>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading || uploading} className="bg-green-600 hover:bg-green-700 text-white">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : isEdit ? 'Update Brand' : 'Add Brand'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
