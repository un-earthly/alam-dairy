'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const toggle = () => {
    const next = currentLocale === 'bn' ? 'en' : 'bn'
    const newPath = pathname.replace(`/${currentLocale}`, `/${next}`)
    router.push(newPath)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="text-xs font-medium text-gray-600 hover:text-green-700 px-2"
    >
      {currentLocale === 'bn' ? 'EN' : 'বাং'}
    </Button>
  )
}
