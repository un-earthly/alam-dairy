import Image from 'next/image'
import { cn } from '@/lib/utils'

// The kantha corner motif (Cloudinary-hosted), reused across sections with a
// different transform each time so it never reads as a repeat.
// Base art hugs the top-left; `corner` mirrors it into place. `onDark`
// switches the blend for photo/forest backgrounds.
const CORNERS = {
  tl: '-top-6 -left-6',
  tr: '-top-6 -right-6 -scale-x-100',
  bl: '-bottom-6 -left-6 -scale-y-100',
  br: '-bottom-6 -right-6 -scale-100',
} as const

export default function CornerOrnament({
  corner = 'tl',
  size = 200,
  rotate = 0,
  opacity = 0.5,
  onDark = false,
  className,
}: {
  corner?: keyof typeof CORNERS
  size?: number
  rotate?: number
  opacity?: number
  onDark?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute select-none', CORNERS[corner], className)}
      style={{ width: size, height: size, opacity, rotate: rotate ? `${rotate}deg` : undefined }}
    >
      <Image
        src="https://res.cloudinary.com/oeon1p4w/image/upload/v1783768890/marketing/corner-1.png"
        alt=""
        width={size}
        height={size}
        className={cn(
          'h-full w-full object-contain',
          onDark
            ? 'invert saturate-0'
            : 'mix-blend-multiply dark:invert dark:saturate-0 dark:mix-blend-screen'
        )}
      />
    </div>
  )
}
