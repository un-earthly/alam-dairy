'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export interface PageData<T> {
  rows: T[]
  nextCursor: number | null
  total: number
}

interface CacheEntry<T> {
  data: T[]
  nextCursor: number | null
  total: number
}

interface UseInfiniteQueryProps<T, TParams> {
  initialData: T[]
  fetchPage: (params: TParams) => Promise<PageData<T>>
  pageSize?: number
  queryKey: string
  params: TParams
}

interface UseInfiniteQueryReturn<T> {
  data: T[]
  isLoading: boolean
  loadingMore: boolean
  hasMore: boolean
  loadMore: () => void
  reset: () => void
  total: number
}

export function useInfiniteQuery<T, TParams>({
  initialData,
  fetchPage,
  pageSize = 20,
  queryKey,
  params,
}: UseInfiniteQueryProps<T, TParams>): UseInfiniteQueryReturn<T> {
  const [data, setData] = useState<T[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialData.length >= pageSize)
  const [total, setTotal] = useState(initialData.length)

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())
  const abortControllerRef = useRef<AbortController | null>(null)
  const nextCursorRef = useRef<number | null>(initialData.length)

  // Reset when params change
  useEffect(() => {
    abortControllerRef.current?.abort()
    cacheRef.current.clear()
    setData(initialData)
    setHasMore(initialData.length >= pageSize)
    setTotal(initialData.length)
    nextCursorRef.current = initialData.length
  }, [queryKey])

  const loadMore = useCallback(async () => {
    if (loadingMore || isLoading || !hasMore) return
    if (nextCursorRef.current === null) return

    setLoadingMore(true)
    abortControllerRef.current = new AbortController()

    try {
      const result = await fetchPage({
        ...params,
        cursor: nextCursorRef.current,
        pageSize,
      } as TParams)

      setData((prev) => [...prev, ...result.rows])
      setTotal(result.total)
      nextCursorRef.current = result.nextCursor
      setHasMore(result.nextCursor !== null)
    } catch (error) {
      if ((error as any)?.name !== 'AbortError') {
        console.error('Failed to load more data:', error)
      }
    } finally {
      setLoadingMore(false)
    }
  }, [fetchPage, params, pageSize, hasMore, loadingMore, isLoading])

  const reset = useCallback(() => {
    setData(initialData)
    setHasMore(initialData.length >= pageSize)
    setTotal(initialData.length)
    nextCursorRef.current = initialData.length
    cacheRef.current.clear()
  }, [initialData, pageSize])

  return {
    data,
    isLoading,
    loadingMore,
    hasMore,
    loadMore,
    reset,
    total,
  }
}
