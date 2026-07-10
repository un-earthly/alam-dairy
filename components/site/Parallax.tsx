'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// Scroll-linked parallax. Translates its children vertically based on how
// far the parent sits from the viewport centre. `speed` > 0 moves slower
// than the page (classic background drift), < 0 moves against it.
// No-ops entirely for reduced-motion users.
export default function Parallax({
  children,
  speed = 0.2,
  className,
}: {
  children: React.ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    if (!el) return
    const anchor = el.parentElement ?? el

    let frame = 0
    const update = () => {
      frame = 0
      const rect = anchor.getBoundingClientRect()
      // -0.5..0.5-ish while the section crosses the viewport
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight
      el.style.transform = `translate3d(0, ${(-progress * speed * 100).toFixed(2)}px, 0)`
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [speed])

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  )
}
