import Image from 'next/image'
import Parallax from '@/components/site/Parallax'
import { cn } from '@/lib/utils'

// Full-bleed photographic interlude between content sections. The image
// drifts on scroll behind a dark wash; children sit centred on top.
export default function ParallaxBand({
  image,
  children,
  className,
  speed = 0.4,
}: {
  image: string
  children?: React.ReactNode
  className?: string
  speed?: number
}) {
  return (
    <section className={cn('relative flex min-h-[42vh] items-center overflow-hidden py-20 sm:min-h-[54vh]', className)}>
      <div className="absolute -inset-y-[15%] inset-x-0">
        <Parallax speed={speed} className="h-full">
          <Image src={image} alt="" fill className="object-cover" sizes="100vw" />
        </Parallax>
      </div>
      <div className="absolute inset-0 bg-forest/55" />
      <div className="relative mx-auto w-full max-w-4xl px-4 text-center text-cream">{children}</div>
    </section>
  )
}
