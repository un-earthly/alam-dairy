'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Pencil } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import type { Database } from '@/lib/supabase/types'

type Category = Database['public']['Tables']['categories']['Row']

export const categoryColumns: ColumnDef<(Category & { parentName?: string })>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(Boolean(e.currentTarget.checked))}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(Boolean(e.currentTarget.checked))}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name_en',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name_en')}</div>
    ),
  },
  {
    accessorKey: 'parentName',
    header: 'Parent',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.getValue('parentName') || '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean
      return (
        <Badge className={isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
          {isActive ? 'Active' : 'Hidden'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/admin/categories/${row.original.id}/edit`}>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </Link>
    ),
    enableSorting: false,
  },
]
