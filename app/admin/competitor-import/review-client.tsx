'use client'

import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, Download, Check } from 'lucide-react'

export type AgromukamRow = {
  agro_id: number
  name_en: string
  name_bn: string
  agro_category: string
  guessed_our_type: 'dairy' | 'cattle' | 'feed' | 'equipment' | 'vet_supply' | 'other'
  price_bdt: number | ''
  old_price_bdt: number | ''
  stock_status: string
  vendor: string
  url: string
  image_url: string
  match_slug: string
  match_name_en: string
  match_score: string
}

const TYPE_LABELS: Record<string, string> = {
  dairy: 'Dairy',
  cattle: 'Cattle',
  feed: 'Feed',
  equipment: 'Equipment',
  vet_supply: 'Vet Supply',
  other: 'Other (fish/poultry/etc)',
}

const TYPE_COLORS: Record<string, string> = {
  dairy: 'bg-amber-100 text-amber-800',
  cattle: 'bg-green-100 text-green-800',
  feed: 'bg-lime-100 text-lime-800',
  equipment: 'bg-blue-100 text-blue-800',
  vet_supply: 'bg-teal-100 text-teal-800',
  other: 'bg-gray-100 text-gray-600',
}

const KEEP_STORAGE_KEY = 'agromukam-review-kept-v1'
const PAGE_SIZE = 60

function csvEscape(v: unknown) {
  const s = String(v ?? '')
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
}

export default function CompetitorReviewClient({ rows }: { rows: AgromukamRow[] }) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [matchFilter, setMatchFilter] = useState<'all' | 'unmatched' | 'matched'>('all')
  const [kept, setKept] = useState<Set<number>>(new Set())
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(KEEP_STORAGE_KEY)
    if (raw) {
      try {
        setKept(new Set(JSON.parse(raw)))
      } catch {
        // ignore corrupt storage
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEEP_STORAGE_KEY, JSON.stringify([...kept]))
  }, [kept, hydrated])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of rows) counts[r.guessed_our_type] = (counts[r.guessed_our_type] ?? 0) + 1
    return counts
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (typeFilter !== 'all' && r.guessed_our_type !== typeFilter) return false
      if (matchFilter === 'unmatched' && r.match_slug) return false
      if (matchFilter === 'matched' && !r.match_slug) return false
      if (q && !r.name_en.toLowerCase().includes(q) && !r.name_bn.includes(q) && !r.agro_category.toLowerCase().includes(q))
        return false
      return true
    })
  }, [rows, query, typeFilter, matchFilter])

  const visible = filtered.slice(0, visibleCount)

  function toggleKeep(id: number) {
    setKept((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function exportKept() {
    const keptRows = rows.filter((r) => kept.has(r.agro_id))
    const cols: (keyof AgromukamRow)[] = [
      'agro_id', 'name_en', 'name_bn', 'agro_category', 'guessed_our_type',
      'price_bdt', 'old_price_bdt', 'stock_status', 'url', 'image_url', 'match_slug',
    ]
    const lines = [cols.join(','), ...keptRows.map((r) => cols.map((c) => csvEscape(r[c])).join(','))]
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'agromukam-kept-products.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search name or category…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE) }}
            className="max-w-xs"
          />
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setVisibleCount(PAGE_SIZE) }}
          >
            <option value="all">All types ({rows.length})</option>
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>{label} ({typeCounts[type] ?? 0})</option>
            ))}
          </select>
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={matchFilter}
            onChange={(e) => { setMatchFilter(e.target.value as typeof matchFilter); setVisibleCount(PAGE_SIZE) }}
          >
            <option value="all">Matched + unmatched</option>
            <option value="unmatched">Unmatched only (likely new)</option>
            <option value="matched">Already looks like ours</option>
          </select>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-500">{kept.size} marked to keep</span>
            <Button onClick={exportKept} disabled={kept.size === 0} className="gap-2">
              <Download className="h-4 w-4" /> Export kept CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500">
        Showing {visible.length} of {filtered.length} filtered ({rows.length} total)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map((r) => {
          const isKept = kept.has(r.agro_id)
          return (
            <Card key={r.agro_id} className={isKept ? 'ring-2 ring-green-500' : ''}>
              <CardContent className="p-3 space-y-2">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                  {r.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.image_url} alt={r.name_en} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No image</div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge className={TYPE_COLORS[r.guessed_our_type]}>{TYPE_LABELS[r.guessed_our_type]}</Badge>
                  {r.match_slug && <Badge variant="outline" title={`≈ ${r.match_score} match`}>≈ {r.match_name_en}</Badge>}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 leading-snug">{r.name_en}</p>
                  <p className="text-xs text-gray-500 leading-snug">{r.name_bn}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.agro_category}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900">
                    {r.price_bdt !== '' ? `${r.price_bdt} BDT` : '—'}
                    {r.old_price_bdt !== '' && r.old_price_bdt !== r.price_bdt && (
                      <span className="ml-1 text-xs text-gray-400 line-through">{r.old_price_bdt}</span>
                    )}
                  </span>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <Button
                  size="sm"
                  variant={isKept ? 'default' : 'outline'}
                  className="w-full gap-1.5"
                  onClick={() => toggleKeep(r.agro_id)}
                >
                  <Check className="h-3.5 w-3.5" /> {isKept ? 'Marked to keep' : 'Mark to keep'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
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
