'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, X, Milk, Beef, Wheat, Wrench, Stethoscope, Tag } from 'lucide-react'
import SortDropdown from '@/components/product/SortDropdown'
import PriceRangeSlider from '@/components/product/PriceRangeSlider'
import type { Database } from '@/lib/supabase/types'

type Category = Database['public']['Tables']['categories']['Row']
type Brand = Database['public']['Tables']['brands']['Row']

const ICONS: Record<string, typeof Milk> = {
  dairy: Milk,
  cattle: Beef,
  feed: Wheat,
  equipment: Wrench,
  vet_supply: Stethoscope,
}

export default function ProductSidebar({
  categories,
  brands = [],
  counts,
  totalCount,
  locale,
  boundsMin,
  boundsMax,
}: {
  categories: Category[]
  brands?: Brand[]
  counts: Record<string, number>
  totalCount: number
  locale: string
  boundsMin: number
  boundsMax: number
}) {
  const t = useTranslations('shop')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (q !== (searchParams.get('q') ?? '')) updateParams({ q: q || null })
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const activeCategory = searchParams.get('category') ?? ''
  const activeBrand = searchParams.get('brand') ?? ''
  const activeMin = searchParams.get('min')
  const activeMax = searchParams.get('max')
  const hasActiveFilters = activeCategory || activeBrand || activeMin || activeMax || q

  return (
    <aside className="w-full shrink-0 space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-20 lg:w-64">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {locale === 'bn' ? 'বিভাগ' : 'Category'}
        </label>
        <nav className="flex flex-col gap-0.5">
          <button
            onClick={() => updateParams({ category: null })}
            className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
              !activeCategory ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
            }`}
          >
            <span>{t('category_all')}</span>
            <span className="text-xs text-muted-foreground">({totalCount})</span>
          </button>
          {categories.map((c) => {
            const Icon = ICONS[c.slug] ?? Tag
            const name = locale === 'bn' ? c.name_bn : c.name_en
            const isActive = activeCategory === c.id
            return (
              <button
                key={c.id}
                onClick={() => updateParams({ category: isActive ? null : c.id })}
                className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {name}
                </span>
                <span className="text-xs text-muted-foreground">({counts[c.id] ?? 0})</span>
              </button>
            )
          })}
        </nav>
      </div>

      {brands.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {locale === 'bn' ? 'ব্র্যান্ড' : 'Brand'}
          </label>
          <select
            value={activeBrand}
            onChange={(e) => updateParams({ brand: e.target.value || null })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t('category_all')}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      <PriceRangeSlider key={`${activeMin ?? ''}-${activeMax ?? ''}`} boundsMin={boundsMin} boundsMax={boundsMax} />

      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {locale === 'bn' ? 'সাজান' : 'Sort'}
        </label>
        <SortDropdown locale={locale} />
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => {
            setQ('')
            router.push(pathname)
          }}
          className="flex w-full items-center justify-center gap-1 rounded-md border border-border py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          {locale === 'bn' ? 'ফিল্টার সরান' : 'Clear filters'}
        </button>
      )}
    </aside>
  )
}
