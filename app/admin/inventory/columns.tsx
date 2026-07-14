'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { getStockLevelColor } from '@/lib/admin/status-colors'
import type { ProductType } from '@/lib/supabase/types'
import type { Product } from './actions'

const TYPE_LABELS: Record<ProductType, string> = {
  dairy: 'Dairy',
  cattle: 'Cattle',
  feed: 'Feed',
  equipment: 'Equipment',
  vet_supply: 'Vet Supply',
}

export const inventoryColumns: ColumnDef<Product>[] = [
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
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('name_en')}</div>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as ProductType
      return <span className="text-xs text-muted-foreground capitalize">{TYPE_LABELS[type]}</span>
    },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number
      const unit = row.original.unit as string
      return (
        <div className="text-right font-medium">
          {stock} {unit}
        </div>
      )
    },
  },
  {
    accessorKey: 'stock',
    id: 'level',
    header: 'Level',
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number
      const statusColor = getStockLevelColor(stock)
      return (
        <Badge className={statusColor}>
          {stock === 0 ? 'Out of Stock' : stock < 10 ? 'Low' : 'OK'}
        </Badge>
      )
    },
  },
]
