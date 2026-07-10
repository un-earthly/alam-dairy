import Image from 'next/image'
import logo from '@/public/logo-transparent.png'

// Intrinsic ratio of logo-transparent.png is 1024x559
const RATIO = 1024 / 559

export default function Logo({
  height = 36,
  className,
  priority = false,
}: {
  height?: number
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src={logo}
      alt="Alam Dairy"
      width={Math.round(height * RATIO)}
      height={height}
      className={className}
      priority={priority}
    />
  )
}
