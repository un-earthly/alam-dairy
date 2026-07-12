'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Slider } from '@/components/ui/slider'
import { formatPrice } from '@/lib/format'

// Keyed by the caller on `min`/`max` search params, so this remounts (and
// re-reads its initial value) whenever the URL changes externally — e.g.
// browser back/forward — instead of needing an effect to resync state.
export default function PriceRangeSlider({
  boundsMin,
  boundsMax,
}: {
  boundsMin: number
  boundsMax: number
}) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlMin = searchParams.get('min')
  const urlMax = searchParams.get('max')

  const [value, setValue] = useState<[number, number]>([
    urlMin ? Number(urlMin) : boundsMin,
    urlMax ? Number(urlMax) : boundsMax,
  ])

  function commit(next: [number, number]) {
    const params = new URLSearchParams(searchParams.toString())
    next[0] <= boundsMin ? params.delete('min') : params.set('min', String(next[0]))
    next[1] >= boundsMax ? params.delete('max') : params.set('max', String(next[1]))
    router.push(`${pathname}?${params.toString()}`)
  }

  if (boundsMax <= boundsMin) return null

  return (
    <div className="w-full max-w-xs space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>{locale === 'bn' ? 'মূল্য' : 'Price'}</span>
        <span className="normal-case tabular-nums text-foreground">
          ৳{formatPrice(value[0], locale)} – ৳{formatPrice(value[1], locale)}
        </span>
      </div>
      <Slider
        min={boundsMin}
        max={boundsMax}
        value={value}
        onValueChange={(v) => setValue(v as [number, number])}
        onValueCommitted={(v) => commit(v as [number, number])}
      />
    </div>
  )
}
