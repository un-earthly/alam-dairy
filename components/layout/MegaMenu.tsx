'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MegaLink {
  href: string
  label: string
  desc?: string
  icon?: React.ReactNode
}

export interface MegaColumn {
  heading: string
  links: MegaLink[]
}

export interface MegaFeature {
  href: string
  image: string
  title: string
  cta: string
}

export interface MegaSection {
  label: string
  columns: MegaColumn[]
  feature?: MegaFeature
}

// Desktop mega menu: hover- and keyboard-driven full-width panels.
// Opens on pointer enter / focus, closes on leave, Escape, or outside click.
export default function MegaMenu({ sections, plainLinks }: {
  sections: MegaSection[]
  plainLinks: MegaLink[]
}) {
  const [open, setOpen] = useState<string | null>(null)
  const rootRef = useRef<HTMLElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const scheduleClose = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(null), 120)
  }
  const cancelClose = () => clearTimeout(closeTimer.current)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <nav ref={rootRef} className="hidden items-center gap-1 text-sm lg:flex" onMouseLeave={scheduleClose}>
      {sections.map((section) => {
        const isOpen = open === section.label
        return (
          <div key={section.label} onMouseEnter={() => { cancelClose(); setOpen(section.label) }}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : section.label)}
              onFocus={() => { cancelClose(); setOpen(section.label) }}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1.5 font-medium transition-colors duration-200',
                isOpen ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {section.label}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>

            {/* Panel */}
            <div
              onMouseEnter={cancelClose}
              className={cn(
                'absolute inset-x-0 top-full z-50 origin-top border-b bg-popover/95 shadow-xl shadow-forest/10 backdrop-blur-xl transition-all duration-200',
                isOpen
                  ? 'pointer-events-auto translate-y-0 opacity-100'
                  : 'pointer-events-none -translate-y-1 opacity-0'
              )}
            >
              <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] gap-10 px-6 py-8">
                <div className={cn('grid gap-10', section.columns.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
                  {section.columns.map((col) => (
                    <div key={col.heading}>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {col.heading}
                      </p>
                      <ul className="grid gap-1">
                        {col.links.map((link) => (
                          <li key={link.href + link.label}>
                            <Link
                              href={link.href}
                              onClick={() => setOpen(null)}
                              className="group flex items-start gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-primary/8"
                            >
                              {link.icon && (
                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center blob-2 bg-pasture/12 text-pasture transition-colors group-hover:bg-pasture group-hover:text-cream">
                                  {link.icon}
                                </span>
                              )}
                              <span>
                                <span className="block font-medium text-foreground">{link.label}</span>
                                {link.desc && (
                                  <span className="block text-xs leading-relaxed text-muted-foreground">{link.desc}</span>
                                )}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {section.feature && (
                  <Link
                    href={section.feature.href}
                    onClick={() => setOpen(null)}
                    className="group relative hidden w-64 overflow-hidden rounded-[1.5rem] xl:block"
                  >
                    <Image
                      src={section.feature.image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="256px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/20 to-transparent" />
                    <div className="relative flex h-full min-h-48 flex-col justify-end p-5 text-cream">
                      <p className="font-display text-lg font-semibold leading-snug">{section.feature.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-butter">
                        {section.feature.cta}
                        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {plainLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onMouseEnter={scheduleClose}
          className="rounded-full px-3 py-1.5 font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
