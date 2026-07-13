'use client'

import { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  sortable?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  sortable = true,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!sortable) return <div>{title}</div>

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => column.toggleSorting()}
        className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {title}
        {!column.getIsSorted() && <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />}
        {column.getIsSorted() === 'desc' && <ArrowDown className="h-3.5 w-3.5" />}
        {column.getIsSorted() === 'asc' && <ArrowUp className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
