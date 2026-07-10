import Logo from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

// Vintage circular "ESTD 2015" stamp. Secondary mark only:
// use near the story section or footer, never as the primary logo.
export default function EstdBadge({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-28 w-28 select-none', className)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-badge-spin">
        <defs>
          <path
            id="estd-badge-circle"
            d="M50,50 m-39,0 a39,39 0 1,1 78,0 a39,39 0 1,1 -78,0"
            fill="none"
          />
        </defs>
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <text fill="currentColor" fontSize="8.2" fontWeight="600" letterSpacing="1.8">
          <textPath href="#estd-badge-circle">ALAM DAIRY • ESTD 2015 •</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Logo height={30} />
      </div>
    </div>
  )
}
