'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Star, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { productTypeColorMap, getStockLevelColor } from '@/lib/admin/status-colors'
import type { Database, ProductType } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

const TYPE_LABELS: Record<ProductType, string> = {
  dairy: 'Dairy',
  cattle: 'Cattle',
  feed: 'Feed',
  equipment: 'Equipment',
  vet_supply: 'Vet Supply',
}

export const productColumns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(Boolean(checked))}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
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
    cell: ({ row }) => <div className="font-medium">{row.getValue('name_en')}</div>,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as ProductType
      return (
        <Badge className={productTypeColorMap[type]}>
          {TYPE_LABELS[type]}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        ৳{(row.getValue('price') as number).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number
      const statusColor = getStockLevelColor(stock)
      return (
        <div className="text-right">
          <Badge className={statusColor}>
            {stock === 0 ? 'Out of Stock' : stock <= 10 ? 'Low' : stock}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'is_featured',
    header: 'Featured',
    cell: ({ row }) => {
      const isFeatured = row.getValue('is_featured') as boolean
      return (
        <div className="text-center">
          <Star
            className={`h-4 w-4 mx-auto ${
              isFeatured ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
            }`}
          />
        </div>
      )
    },
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
      <Link href={`/admin/products/${row.original.id}/edit`}>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </Link>
    ),
    enableSorting: false,
  },
]
