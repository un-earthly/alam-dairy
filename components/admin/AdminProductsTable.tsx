'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Pencil,
  Trash2,
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Search,
} from 'lucide-react'
import type { Database, ProductType } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

const TYPE_LABELS: Record<ProductType, string> = {
  dairy: 'Dairy',
  cattle: 'Cattle',
  feed: 'Feed',
  equipment: 'Equipment',
  vet_supply: 'Vet Supply',
}

const TYPE_COLORS: Record<ProductType, string> = {
  dairy: 'bg-amber-100 text-amber-800',
  cattle: 'bg-green-100 text-green-800',
  feed: 'bg-lime-100 text-lime-800',
  equipment: 'bg-blue-100 text-blue-800',
  vet_supply: 'bg-teal-100 text-teal-800',
}

type SortKey = 'name_en' | 'type' | 'price' | 'stock'
type StatusFilter = 'all' | 'active' | 'hidden' | 'featured' | 'out_of_stock' | 'low_stock'

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: 'asc' | 'desc' }) {
  if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
  return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
}

export default function AdminProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name_en')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    let rows = products
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      rows = rows.filter((p) => p.name_en.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term))
    }
    if (typeFilter !== 'all') rows = rows.filter((p) => p.type === typeFilter)
    switch (statusFilter) {
      case 'active':
        rows = rows.filter((p) => p.is_active)
        break
      case 'hidden':
        rows = rows.filter((p) => !p.is_active)
        break
      case 'featured':
        rows = rows.filter((p) => p.is_featured)
        break
      case 'out_of_stock':
        rows = rows.filter((p) => p.stock === 0)
        break
      case 'low_stock':
        rows = rows.filter((p) => p.stock > 0 && p.stock <= 10)
        break
    }
    const sorted = [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [products, search, typeFilter, statusFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map((p) => p.id)))
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function bulkSetFeatured(featured: boolean) {
    if (selected.size === 0) return
    setBusy(true)
    const supabase = createClient()
    const ids = Array.from(selected)
    const { error } = await supabase.from('products').update({ is_featured: featured }).in('id', ids)
    if (!error) {
      setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, is_featured: featured } : p)))
      setSelected(new Set())
    }
    setBusy(false)
  }

  async function bulkSetActive(active: boolean) {
    if (selected.size === 0) return
    setBusy(true)
    const supabase = createClient()
    const ids = Array.from(selected)
    const { error } = await supabase.from('products').update({ is_active: active }).in('id', ids)
    if (!error) {
      setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, is_active: active } : p)))
      setSelected(new Set())
    }
    setBusy(false)
  }

  async function bulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} product${selected.size > 1 ? 's' : ''}? This cannot be undone.`)) return
    setBusy(true)
    const supabase = createClient()
    const ids = Array.from(selected)
    const { error } = await supabase.from('products').delete().in('id', ids)
    if (!error) {
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)))
      setSelected(new Set())
    }
    setBusy(false)
    router.refresh()
  }

  const allSelected = filtered.length > 0 && selected.size === filtered.length

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or slug..."
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter((v ?? 'all') as ProductType | 'all')}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter((v ?? 'all') as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
            <SelectItem value="featured">Featured in shop</SelectItem>
            <SelectItem value="low_stock">Low stock (&le;10)</SelectItem>
            <SelectItem value="out_of_stock">Out of stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => bulkSetFeatured(true)} className="gap-1.5">
            <Star className="h-3.5 w-3.5" /> Promote to Shop
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => bulkSetFeatured(false)}>
            Remove from Featured
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => bulkSetActive(true)}>
            Activate
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => bulkSetActive(false)}>
            Deactivate
          </Button>
          <Button size="sm" variant="destructive" disabled={busy} onClick={bulkDelete} className="gap-1.5">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 rounded border-input" />
                </th>
                <th className="px-2 py-3 text-left">
                  <button onClick={() => toggleSort('name_en')} className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
                    Name <SortIcon column="name_en" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-2 py-3 text-left">
                  <button onClick={() => toggleSort('type')} className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
                    Type <SortIcon column="type" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-2 py-3 text-right">
                  <button onClick={() => toggleSort('price')} className="ml-auto flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
                    Price <SortIcon column="price" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-2 py-3 text-right">
                  <button onClick={() => toggleSort('stock')} className="ml-auto flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
                    Stock <SortIcon column="stock" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-2 py-3 text-center font-medium text-muted-foreground">Featured</th>
                <th className="px-2 py-3 text-center font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => (
                <tr key={p.id} className={`transition-colors hover:bg-muted/30 ${selected.has(p.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="h-4 w-4 rounded border-input"
                    />
                  </td>
                  <td className="px-2 py-3 font-medium text-foreground">{p.name_en}</td>
                  <td className="px-2 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[p.type]}`}>
                      {TYPE_LABELS[p.type]}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right text-foreground">৳{p.price.toLocaleString()}</td>
                  <td className={`px-2 py-3 text-right font-medium ${p.stock === 0 ? 'text-destructive' : p.stock <= 10 ? 'text-amber-600' : 'text-foreground'}`}>
                    {p.stock}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button
                      onClick={() => {
                        setSelected(new Set([p.id]))
                        bulkSetFeatured(!p.is_featured)
                      }}
                      aria-label={p.is_featured ? 'Remove from featured' : 'Promote to shop'}
                    >
                      <Star className={`h-4 w-4 ${p.is_featured ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`} />
                    </button>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <Badge className={p.is_active ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
