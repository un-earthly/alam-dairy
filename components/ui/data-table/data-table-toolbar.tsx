'use client'

import React from 'react'
import { Table as TanstackTable } from '@tanstack/react-table'
import { Search, RotateCcw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DataTableToolbarProps<TData> {
  table: TanstackTable<TData>
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onReset?: () => void
  onExport?: () => void
  showSearch?: boolean
  showReset?: boolean
  showExport?: boolean
  isFiltered?: boolean
  children?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  onReset,
  onExport,
  showSearch = true,
  showReset = true,
  showExport = true,
  isFiltered = false,
  children,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
      <div className="flex flex-1 items-center gap-2">
        {showSearch && (
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Filters and actions go here via children */}
        {children}

        {showExport && onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}

        {showReset && isFiltered && onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>
    </div>
  )
}
