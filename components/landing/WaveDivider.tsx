import { cn } from '@/lib/utils'

// Organic river/wave section divider. The strip is twice the viewport
// width and drifts horizontally for a liquid-pour feel.
export default function WaveDivider({
  className,
  fill = 'var(--background)',
  flip = false,
}: {
  className?: string
  fill?: string
  flip?: boolean
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none relative h-14 w-full overflow-hidden sm:h-20',
        flip && 'rotate-180',
        className
      )}
    >
      <svg
        className="absolute bottom-0 left-0 h-full w-[200%] animate-wave-drift"
        viewBox="0 0 2880 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,72 C120,40 240,96 360,80 C480,64 600,24 720,40 C840,56 960,104 1080,96 C1200,88 1320,40 1440,56 C1560,72 1680,40 1800,48 C1920,56 2040,96 2160,88 C2280,80 2400,32 2520,40 C2640,48 2760,88 2880,72 L2880,120 L0,120 Z"
          fill={fill}
        />
      </svg>
    </div>
  )
}
