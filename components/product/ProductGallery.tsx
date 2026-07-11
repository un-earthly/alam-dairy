'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Expand } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface MediaItem {
  url: string
  alt_bn?: string | null
  alt_en?: string | null
}

export default function ProductGallery({
  media,
  fallbackEmoji,
  name,
}: {
  media: MediaItem[]
  fallbackEmoji: string
  name: string
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)

  if (media.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100 flex items-center justify-center text-8xl">
        {fallbackEmoji}
      </div>
    )
  }

  const active = media[activeIdx] ?? media[0]

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 touch-pan-y"
      >
        <Image
          src={active.url}
          alt={active.alt_en ?? name}
          width={800}
          height={800}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
        <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <Expand className="h-4 w-4" />
        </span>
      </button>

      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((m, i) => (
            <button
              key={m.url}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={cn(
                'h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 border-2 transition-colors',
                i === activeIdx ? 'border-primary' : 'border-transparent'
              )}
            >
              <Image src={m.url} alt="" width={64} height={64} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-3xl sm:max-w-3xl bg-black/95 border-none p-2">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <div className="relative aspect-square w-full">
            <Image src={active.url} alt={active.alt_en ?? name} fill className="object-contain" />
          </div>
          {media.length > 1 && (
            <div className="flex justify-center gap-2 pb-2">
              {media.map((m, i) => (
                <button
                  key={m.url}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={cn('h-2 w-2 rounded-full', i === activeIdx ? 'bg-white' : 'bg-white/30')}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
