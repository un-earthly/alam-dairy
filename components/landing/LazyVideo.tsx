'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// Background video that never blocks first paint:
// - renders only the poster on the server and at first paint
// - attaches the video src after the page is idle AND the element is near the viewport
// - skips the video entirely on Save-Data connections and for reduced-motion users
export default function LazyVideo({
  src,
  poster,
  className,
}: {
  src: string
  poster: string
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [load, setLoad] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const conn = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') return

    const el = ref.current
    if (!el) return

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }

    let idle: number
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect()
          const start = () => setLoad(true)
          idle = w.requestIdleCallback
            ? w.requestIdleCallback(start, { timeout: 2500 })
            : window.setTimeout(start, 300)
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      if (idle) {
        if (w.cancelIdleCallback) w.cancelIdleCallback(idle)
        else clearTimeout(idle)
      }
    }
  }, [])

  useEffect(() => {
    if (load) ref.current?.play().catch(() => {})
  }, [load])

  return (
    <video
      ref={ref}
      src={load ? src : undefined}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
