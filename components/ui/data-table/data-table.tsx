'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import {
  flexRender,
  Table as TanstackTable,
  VisibilityState,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableProps<TData> {
  table: TanstackTable<TData>
  columns: any[]
  isLoading?: boolean
  isEmpty?: boolean
  emptyState?: React.ReactNode
  maxHeight?: string
  onLoadMore?: () => void
  hasMore?: boolean
  loadingMore?: boolean
}

export function DataTable<TData>({
  table,
  columns,
  isLoading = false,
  isEmpty = false,
  emptyState,
  maxHeight = 'calc(100vh - 300px)',
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}: DataTableProps<TData>) {
  const sentinelRef = useRef<HTMLTableRowElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!sentinelRef.current || !onLoadMore || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinelRef.current)
    observerRef.current = observer

    return () => observer.disconnect()
  }, [onLoadMore, hasMore, loadingMore])

  const rows = table.getRowModel().rows

  return (
    <div
      className="relative rounded-lg border border-border bg-card overflow-hidden"
      style={{ maxHeight }}
    >
      <div className="overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && !rows.length ? (
              // Skeleton loading state
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col, colIdx) => (
                    <TableCell key={`${i}-${colIdx}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isEmpty ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyState || 'No results.'}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Infinite scroll sentinel */}
                {hasMore && (
                  <TableRow ref={sentinelRef} className="h-0">
                    <TableCell colSpan={columns.length} className="p-0 h-0" />
                  </TableRow>
                )}
                {/* Loading indicator for infinite scroll */}
                {loadingMore && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-100" />
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-200" />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
