'use client'

import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

// Fade-and-rise on first scroll into view. Shared by every page section.
export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className={cn(!inView && 'opacity-0', inView && 'animate-fade-in-up', className)}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
