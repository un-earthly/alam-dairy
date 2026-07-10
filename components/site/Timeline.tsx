'use client'

import Image from 'next/image'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

export interface Milestone {
  year: string
  title: string
  text: string
  image?: string
}

function MilestoneCard({ item, index }: { item: Milestone; index: number }) {
  const { ref, inView } = useInView<HTMLLIElement>()
  const left = index % 2 === 0

  return (
    <li ref={ref} className="relative sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-10">
      {/* year dot on the spine */}
      <div className="absolute left-4 top-1 -translate-x-1/2 sm:static sm:order-2 sm:translate-x-0">
        <div
          className={cn(
            'relative z-10 flex h-14 w-14 items-center justify-center blob-2 bg-pasture font-display text-sm font-bold text-cream shadow-lg shadow-pasture/30 transition-all duration-500',
            inView ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          )}
        >
          {item.year}
        </div>
      </div>

      <div
        className={cn(
          'ml-14 sm:ml-0 sm:pb-4',
          left ? 'sm:order-1 sm:text-right' : 'sm:order-3',
          !inView && 'opacity-0',
          inView && (left ? 'sm:animate-fade-in-left animate-fade-in-up' : 'animate-fade-in-up')
        )}
      >
        <div className="group overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pasture/15">
          {item.image && (
            <div className="relative h-40 overflow-hidden sm:h-48">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 640px) 40vw, 90vw"
              />
            </div>
          )}
          <div className={cn('p-5', left && 'sm:text-right')}>
            <h3 className="font-display text-lg font-semibold text-forest dark:text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
          </div>
        </div>
      </div>

      {/* empty column keeps the alternating layout */}
      <div className={left ? 'hidden sm:block sm:order-3' : 'hidden sm:block sm:order-1'} />
    </li>
  )
}

export default function Timeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="relative">
      {/* spine */}
      <div
        aria-hidden
        className="absolute bottom-4 left-4 top-4 w-px bg-gradient-to-b from-pasture/0 via-pasture/50 to-pasture/0 sm:left-1/2 sm:-translate-x-1/2"
      />
      <ol className="space-y-10 sm:space-y-14">
        {milestones.map((m, i) => (
          <MilestoneCard key={m.year + m.title} item={m} index={i} />
        ))}
      </ol>
    </div>
  )
}
