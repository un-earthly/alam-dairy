'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowUpDown } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const SORTS = ['newest', 'price_asc', 'price_desc', 'best_selling'] as const

export default function SortDropdown({ locale }: { locale: string }) {
  const t = useTranslations('shop')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = searchParams.get('sort') ?? 'newest'

  function setSort(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === 'newest') params.delete('sort')
    else params.set('sort', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  const labels: Record<(typeof SORTS)[number], string> = {
    newest: t('sort_newest'),
    price_asc: t('sort_price_asc'),
    price_desc: t('sort_price_desc'),
    best_selling: locale === 'bn' ? 'সর্বাধিক বিক্রিত' : 'Best Selling',
  }

  return (
    <Select value={active} onValueChange={setSort}>
      <SelectTrigger className="h-9 min-w-[9rem] rounded-full bg-background">
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORTS.map((s) => (
          <SelectItem key={s} value={s}>
            {labels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
