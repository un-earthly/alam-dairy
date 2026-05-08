'use client'

import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const DAIRY_FILTERS = [
  { key: 'all', labelKey: 'filter_all' },
  { key: 'milk', labelKey: 'filter_milk' },
  { key: 'yogurt', labelKey: 'filter_yogurt' },
  { key: 'ghee', labelKey: 'filter_ghee' },
  { key: 'sweets', labelKey: 'filter_sweets' },
] as const

const FARM_FILTERS = [
  { key: 'all', labelKey: 'filter_all' },
  { key: 'cattle', labelKey: 'filter_cattle' },
  { key: 'feed', labelKey: 'filter_feed' },
  { key: 'vet', labelKey: 'filter_vet' },
  { key: 'equipment', labelKey: 'filter_equipment' },
] as const

export default function ShopFilters({
  locale,
  activeType,
  mode = 'shop',
}: {
  locale: string
  activeType?: string
  mode?: 'shop' | 'farm'
}) {
  const tShop = useTranslations('shop')
  const tFarm = useTranslations('farm')
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters = mode === 'shop' ? DAIRY_FILTERS : FARM_FILTERS
  const active = activeType ?? 'all'

  function setFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'all') {
      params.delete('type')
    } else {
      params.set('type', key)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key)}
          className={cn(
            'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors',
            active === f.key
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
          )}
        >
          {mode === 'shop'
          ? tShop(f.labelKey as Parameters<typeof tShop>[0])
          : tFarm(f.labelKey as Parameters<typeof tFarm>[0])}
        </button>
      ))}
    </div>
  )
}
