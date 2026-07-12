import { Truck, RotateCcw, Banknote, ShieldCheck } from 'lucide-react'

export default function TrustBar({ locale }: { locale: string }) {
  const items =
    locale === 'bn'
      ? [
          { icon: Truck, label: 'দ্রুত হোম ডেলিভারি' },
          { icon: RotateCcw, label: 'সহজ রিটার্ন পলিসি' },
          { icon: Banknote, label: 'ক্যাশ অন ডেলিভারি' },
          { icon: ShieldCheck, label: 'খামার-যাচাইকৃত উৎস' },
        ]
      : [
          { icon: Truck, label: 'Fast home delivery' },
          { icon: RotateCcw, label: 'Easy return policy' },
          { icon: Banknote, label: 'Cash on delivery' },
          { icon: ShieldCheck, label: 'Farm-verified sourcing' },
        ]

  return (
    <div className="border-b bg-pasture/5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-2.5 text-xs font-medium text-muted-foreground sm:justify-between">
        {items.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-pasture" />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
