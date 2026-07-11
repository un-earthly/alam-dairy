import Link from 'next/link'
import { Milk, Beef, Wheat, Wrench, Stethoscope, Tag } from 'lucide-react'
import CornerOrnament from '@/components/site/CornerOrnament'
import type { Database } from '@/lib/supabase/types'

type Category = Database['public']['Tables']['categories']['Row']

const ICONS: Record<string, typeof Milk> = {
  dairy: Milk,
  cattle: Beef,
  feed: Wheat,
  equipment: Wrench,
  vet_supply: Stethoscope,
}

export default function CategoryGrid({
  categories,
  locale,
  activeCategoryId,
}: {
  categories: Category[]
  locale: string
  activeCategoryId?: string
}) {
  if (categories.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((c, i) => {
        const Icon = ICONS[c.slug] ?? Tag
        const name = locale === 'bn' ? c.name_bn : c.name_en
        const isActive = activeCategoryId === c.id
        const showOrnament = i % 4 === 3
        return (
          <Link
            key={c.id}
            href={isActive ? '?' : `?category=${c.id}`}
            className={`group relative overflow-hidden rounded-[2rem] border p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pasture/15 ${
              isActive ? 'border-primary bg-primary/5' : 'border-border bg-card'
            }`}
          >
            {showOrnament && (
              <CornerOrnament corner={i % 8 === 3 ? 'bl' : 'tr'} size={110} rotate={i % 8 === 3 ? 8 : -8} opacity={0.2} />
            )}
            <div className="relative mx-auto mb-2 flex h-11 w-11 items-center justify-center blob-2 bg-pasture text-cream">
              <Icon className="h-5 w-5" />
            </div>
            <span className="relative text-sm font-semibold text-foreground">{name}</span>
          </Link>
        )
      })}
    </div>
  )
}
