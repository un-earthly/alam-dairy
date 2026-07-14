'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { getStatusColor } from '@/lib/admin/status-colors'

interface SubscriptionRow {
  id: string
  frequency: string
  quantity: number
  unit_price: number
  status: string
  next_billing_date: string
  last_renewal_status: string | null
  last_renewal_error: string | null
  last_renewal_at: string | null
  products: { name_en: string } | null
  profiles: { full_name: string | null; phone: string | null } | null
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-success/10 text-success',
  paused: 'bg-accent/10 text-accent',
  cancelled: 'bg-muted text-muted-foreground',
}

export const subscriptionColumns: ColumnDef<SubscriptionRow>[] = [
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
    accessorKey: 'profiles',
    header: 'Customer',
    cell: ({ row }) => {
      const profile = row.getValue('profiles') as SubscriptionRow['profiles']
      return (
        <div className="text-sm">
          {profile?.full_name || profile?.phone || '—'}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'products',
    header: 'Product',
    cell: ({ row }) => {
      const product = row.getValue('products') as SubscriptionRow['products']
      const qty = row.original.quantity
      return (
        <div className="text-sm">
          {product?.name_en} × {qty}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'frequency',
    header: 'Frequency',
    cell: ({ row }) => (
      <span className="text-sm capitalize">{row.getValue('frequency')}</span>
    ),
  },
  {
    accessorKey: 'next_billing_date',
    header: 'Next Billing',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue('next_billing_date')}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const colorClass = STATUS_COLORS[status] || 'bg-muted text-muted-foreground'
      return (
        <Badge className={colorClass}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'last_renewal_status',
    header: 'Last Renewal',
    cell: ({ row }) => {
      const status = row.getValue('last_renewal_status') as string | null
      if (status === 'failed') {
        return (
          <span className="text-xs text-destructive">
            Failed
          </span>
        )
      }
      if (status === 'success') {
        return (
          <span className="text-xs text-success">OK</span>
        )
      }
      return <span className="text-xs text-muted-foreground">—</span>
    },
    enableSorting: false,
  },
]
