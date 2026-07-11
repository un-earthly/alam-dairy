'use client'

import { cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/types'

type Variant = Database['public']['Tables']['product_variants']['Row']

export default function VariantPicker({
  variants,
  locale,
  selectedId,
  onSelect,
}: {
  variants: Variant[]
  locale: string
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((v) => {
        const name = locale === 'bn' ? v.name_bn : v.name_en
        const isOut = v.stock === 0
        return (
          <button
            key={v.id}
            type="button"
            disabled={isOut}
            onClick={() => onSelect(v.id)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40',
              selectedId === v.id
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border hover:border-primary/50'
            )}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
