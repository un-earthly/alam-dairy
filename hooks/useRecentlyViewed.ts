'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'alam-recently-viewed'
const MAX_ITEMS = 12

function readIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function trackRecentlyViewed(productId: string) {
  if (typeof window === 'undefined') return
  const existing = readIds().filter((id) => id !== productId)
  const next = [productId, ...existing].slice(0, MAX_ITEMS)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function useRecentlyViewedIds() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    // Deliberately deferred to an effect: localStorage isn't available
    // during SSR, so reading it on first render would mismatch the
    // server-rendered (empty) markup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIds(readIds())
  }, [])

  return ids
}

export function useTrackRecentlyViewed() {
  return useCallback((productId: string) => trackRecentlyViewed(productId), [])
}
