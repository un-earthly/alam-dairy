'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { getStatusColor } from '@/lib/admin/status-colors'
import type { Database } from '@/lib/supabase/types'

type Order = Database['public']['Tables']['orders']['Row'] & {
  address?: { name?: string; phone?: string; area?: string } | null
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-accent/10 text-accent',
  paid: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
  refunded: 'bg-muted text-muted-foreground',
}

export const orderColumns: ColumnDef<Order>[] = [
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
    accessorKey: 'order_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order" />
    ),
    cell: ({ row }) => {
      const order = row.original
      const orderNum = row.getValue('order_number') as string | null
      const createdAt = new Date(order.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
      return (
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            {orderNum || order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-muted-foreground">{createdAt}</p>
        </div>
      )
    },
  },
  {
    accessorKey: 'address',
    header: 'Customer',
    cell: ({ row }) => {
      const address = row.original.address as Record<string, string> | null
      const name = address?.name || 'Guest'
      const phone = row.original.contact_phone || address?.phone || '—'
      const area = address?.area || '—'
      return (
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{phone}</p>
          <p className="text-xs text-muted-foreground">{area}</p>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'payment_method',
    header: 'Payment',
    cell: ({ row }) => {
      const method = (row.getValue('payment_method') as string || '').toUpperCase()
      const status = row.original.payment_status || 'pending'
      const colorClass = PAYMENT_STATUS_COLORS[status] || 'bg-muted text-muted-foreground'
      return (
        <div>
          <p className="text-xs font-medium text-muted-foreground">{method}</p>
          <Badge className={colorClass + ' mt-1'}>{status}</Badge>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'total',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" sortable={false} />
    ),
    cell: ({ row }) => (
      <div className="text-right font-bold text-success">
        ৳{(row.getValue('total') as number).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" sortable={false} />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const colorClass = getStatusColor(status)
      return (
        <Badge className={colorClass}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
]
