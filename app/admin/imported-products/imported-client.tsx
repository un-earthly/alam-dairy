'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, Trash2 } from 'lucide-react'
import { setActive, deleteProducts } from './actions'

type Product = {
  id: string
  slug: string
  name_en: string
  name_bn: string
  description_en: string | null
  type: string
  price: number
  sale_price: number | null
  unit: string
  stock: number
  is_active: boolean
  images: string[]
}

const TYPE_LABELS: Record<string, string> = {
  dairy: 'Dairy',
  cattle: 'Cattle',
  feed: 'Feed',
  equipment: 'Equipment',
  vet_supply: 'Vet Supply',
}

const TYPE_COLORS: Record<string, string> = {
  dairy: 'bg-amber-100 text-amber-800',
  cattle: 'bg-green-100 text-green-800',
  feed: 'bg-lime-100 text-lime-800',
  equipment: 'bg-blue-100 text-blue-800',
  vet_supply: 'bg-teal-100 text-teal-800',
}

const PAGE_SIZE = 60

export default function ImportedProductsClient({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isPending, startTransition] = useTransition()

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of items) counts[p.type] = (counts[p.type] ?? 0) + 1
    return counts
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((p) => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false
      if (activeFilter === 'active' && !p.is_active) return false
      if (activeFilter === 'inactive' && p.is_active) return false
      if (q && !p.name_en.toLowerCase().includes(q) && !p.name_bn.includes(q)) return false
      return true
    })
  }, [items, query, typeFilter, activeFilter])

  const visible = filtered.slice(0, visibleCount)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function applyActive(ids: string[], active: boolean) {
    startTransition(async () => {
      const res = await setActive({ ids, active })
      if (res.ok) {
        setItems((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, is_active: active } : p)))
        setSelected(new Set())
      }
    })
  }

  function applyDelete(ids: string[]) {
    startTransition(async () => {
      const res = await deleteProducts({ ids })
      if (res.ok) {
        setItems((prev) => prev.filter((p) => !ids.includes(p.id)))
        setSelected(new Set())
      }
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search name…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE) }}
            className="max-w-xs"
          />
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setVisibleCount(PAGE_SIZE) }}
          >
            <option value="all">All types ({items.length})</option>
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>{label} ({typeCounts[type] ?? 0})</option>
            ))}
          </select>
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value as typeof activeFilter); setVisibleCount(PAGE_SIZE) }}
          >
            <option value="all">Active + inactive</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-500">{selected.size} selected</span>
            <Button size="sm" disabled={selected.size === 0 || isPending} onClick={() => applyActive([...selected], true)} className="gap-1.5">
              <Check className="h-3.5 w-3.5" /> Activate
            </Button>
            <Button size="sm" variant="outline" disabled={selected.size === 0 || isPending} onClick={() => applyActive([...selected], false)} className="gap-1.5">
              <X className="h-3.5 w-3.5" /> Deactivate
            </Button>
            <Button size="sm" variant="destructive" disabled={selected.size === 0 || isPending} onClick={() => applyDelete([...selected])} className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500">Showing {visible.length} of {filtered.length} filtered ({items.length} total)</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map((p) => (
          <Card key={p.id} className={selected.has(p.id) ? 'ring-2 ring-blue-500' : ''}>
            <CardContent className="p-3 space-y-2">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 relative">
                {p.images[0] ? (
                  <Image src={p.images[0]} alt={p.name_en} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No image</div>
                )}
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="absolute top-2 left-2 h-4 w-4"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge className={TYPE_COLORS[p.type]}>{TYPE_LABELS[p.type]}</Badge>
                <Badge variant={p.is_active ? 'default' : 'outline'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 leading-snug">{p.name_en}</p>
                <p className="text-xs text-gray-500 leading-snug">{p.name_bn}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-900">
                  {p.sale_price ? (
                    <>
                      {p.sale_price} BDT <span className="ml-1 text-xs text-gray-400 line-through">{p.price}</span>
                    </>
                  ) : (
                    `${p.price} BDT`
                  )}
                  <span className="text-xs text-gray-400 font-normal"> / {p.unit}</span>
                </span>
              </div>
              <Button
                size="sm"
                variant={p.is_active ? 'outline' : 'default'}
                className="w-full gap-1.5"
                disabled={isPending}
                onClick={() => applyActive([p.id], !p.is_active)}
              >
                {p.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {visible.length < filtered.length && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
            Load more ({filtered.length - visible.length} remaining)
          </Button>
        </div>
      )}
    </div>
  )
}
