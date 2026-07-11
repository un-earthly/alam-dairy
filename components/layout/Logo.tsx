import Image from 'next/image'

const logo = 'https://res.cloudinary.com/oeon1p4w/image/upload/v1783768891/marketing/logo-transparent.png'

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
