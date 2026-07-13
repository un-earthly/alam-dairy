'use client'

import React, { useState } from 'react'
import { DataTable, DataTableToolbar, useDataTable, useInfiniteQuery } from '@/components/ui/data-table'
import { orderColumns } from './columns'
import { fetchOrdersPage } from './actions'
import type { Database } from '@/lib/supabase/types'

type Order = Database['public']['Tables']['orders']['Row']

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Dispatched', value: 'dispatched' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

interface OrdersTableClientProps {
  initialOrders: Order[]
}

export default function OrdersTableClient({ initialOrders }: OrdersTableClientProps) {
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set())

  const queryKey = JSON.stringify({ search, statuses: Array.from(statusFilters) })

  const { data, hasMore, loadingMore, loadMore, reset } = useInfiniteQuery({
    initialData: initialOrders,
    fetchPage: async (params: any) => {
      return fetchOrdersPage({
        cursor: params.cursor,
        pageSize: params.pageSize,
        search: params.search,
        status: statusFilters.size > 0 ? Array.from(statusFilters)[0] : undefined,
      })
    },
    pageSize: 20,
    queryKey,
    params: { search, statuses: Array.from(statusFilters) },
  })

  const { table } = useDataTable({
    data,
    columns: orderColumns,
    pageSize: 20,
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Search orders..."
        searchValue={search}
        onSearchChange={setSearch}
        showExport={true}
        onExport={() => {
          const csv = [
            ['Order', 'Customer', 'Total', 'Status', 'Date'].join(','),
            ...data.map((o) => [
              o.order_number || o.id.slice(0, 8),
              typeof o.address === 'object' ? (o.address as any)?.name || 'Guest' : 'Guest',
              o.total,
              o.status,
              new Date(o.created_at).toLocaleDateString('en-GB'),
            ].join(',')),
          ].join('\n')

          const blob = new Blob([csv], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
          a.click()
          URL.revokeObjectURL(url)
        }}
      />

      <DataTable
        table={table}
        columns={orderColumns}
        emptyState="No orders found."
        onLoadMore={loadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />
    </div>
  )
}
