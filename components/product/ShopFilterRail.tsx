'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Category = Database['public']['Tables']['categories']['Row']
type Brand = Database['public']['Tables']['brands']['Row']

export default function ShopFilterRail({
  categories,
  brands,
  locale,
}: {
  categories: Category[]
  brands: Brand[]
  locale: string
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
  const activeSort = searchParams.get('sort') ?? 'newest'
  const activeMin = searchParams.get('min') ?? ''
  const activeMax = searchParams.get('max') ?? ''

  const hasActiveFilters = activeCategory || activeBrand || activeMin || activeMax || q

  return (
    <div className="sticky top-20 space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {locale === 'bn' ? 'বিভাগ' : 'Category'}
        </label>
        <select
          value={activeCategory}
          onChange={(e) => updateParams({ category: e.target.value || null })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t('category_all')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{locale === 'bn' ? c.name_bn : c.name_en}</option>
          ))}
        </select>
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

      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {locale === 'bn' ? 'মূল্য' : 'Price'}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            defaultValue={activeMin}
            onBlur={(e) => updateParams({ min: e.target.value || null })}
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            defaultValue={activeMax}
            onBlur={(e) => updateParams({ max: e.target.value || null })}
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {locale === 'bn' ? 'সাজান' : 'Sort'}
        </label>
        <select
          value={activeSort}
          onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? null : e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="newest">{t('sort_newest')}</option>
          <option value="price_asc">{t('sort_price_asc')}</option>
          <option value="price_desc">{t('sort_price_desc')}</option>
        </select>
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
    </div>
  )
}
