'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

export const customerColumns: ColumnDef<Profile>[] = [
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
    accessorKey: 'full_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('full_name') || 'N/A'}</div>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Contact',
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string | null
      const email = row.original.email as string | null
      return (
        <div>
          <p className="font-medium">{phone || '—'}</p>
          <p className="text-xs text-muted-foreground">{email || ''}</p>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'is_farmer',
    header: 'Type',
    cell: ({ row }) => {
      const isFarmer = row.getValue('is_farmer') as boolean
      return (
        <Badge className={isFarmer ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}>
          {isFarmer ? 'Farmer' : 'Consumer'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at') as string)
      return <span className="text-xs text-muted-foreground">{date.toLocaleDateString('en-GB')}</span>
    },
  },
]
