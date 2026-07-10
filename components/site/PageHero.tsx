import Image from 'next/image'
import Parallax from '@/components/site/Parallax'
import WaveDivider from '@/components/landing/WaveDivider'
import CornerOrnament from '@/components/site/CornerOrnament'
import { cn } from '@/lib/utils'

// Immersive photographic page header with a parallax backdrop.
// `image` is a public path (e.g. /photos/scenic/crop-field.webp).
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  tall = false,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  image: string
  tall?: boolean
  children?: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'relative flex items-center overflow-hidden bg-forest text-cream',
        tall ? 'min-h-[70vh] sm:min-h-[78vh]' : 'min-h-[46vh] sm:min-h-[54vh]',
        className
      )}
    >
      {/* Parallax backdrop: oversized so the drift never shows edges */}
      <div className="absolute -inset-y-[12%] inset-x-0">
        <Parallax speed={0.35} className="h-full">
          <Image src={image} alt="" fill priority className="object-cover" sizes="100vw" />
        </Parallax>
      </div>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(10,18,8,0.35), rgba(10,18,8,0.7))' }}
      />
      <CornerOrnament corner="tr" size={230} rotate={-6} opacity={0.28} onDark />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:py-32">
        <div className="max-w-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          {eyebrow && <p className="font-accent text-lg text-butter sm:text-xl">{eyebrow}</p>}
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-wide drop-shadow-sm sm:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <WaveDivider fill="var(--background)" />
      </div>
    </section>
  )
}
