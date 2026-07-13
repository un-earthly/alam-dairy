'use client'

import React, { useState } from 'react'
import { DataTable, DataTableToolbar, useDataTable, useInfiniteQuery } from '@/components/ui/data-table'
import { subscriptionColumns } from './columns'
import { fetchSubscriptionsPage } from './actions'

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

interface SubscriptionsTableClientProps {
  initialSubscriptions: SubscriptionRow[]
}

export default function SubscriptionsTableClient({
  initialSubscriptions,
}: SubscriptionsTableClientProps) {
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set())

  const queryKey = JSON.stringify({ statuses: Array.from(statusFilters) })

  const { data, hasMore, loadingMore, loadMore } = useInfiniteQuery({
    initialData: initialSubscriptions,
    fetchPage: async (params: any) => {
      return fetchSubscriptionsPage({
        cursor: params.cursor,
        pageSize: params.pageSize,
        status: statusFilters.size > 0 ? Array.from(statusFilters)[0] : undefined,
      })
    },
    pageSize: 20,
    queryKey,
    params: { statuses: Array.from(statusFilters) },
  })

  const { table } = useDataTable({
    data,
    columns: subscriptionColumns,
    pageSize: 20,
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        showSearch={false}
        showExport={true}
        onExport={() => {
          const csv = [
            ['Customer', 'Product', 'Frequency', 'Next Billing', 'Status'].join(','),
            ...data.map((s) => [
              s.profiles?.full_name || s.profiles?.phone || '',
              `${s.products?.name_en || ''} x${s.quantity}`,
              s.frequency,
              s.next_billing_date,
              s.status,
            ].join(',')),
          ].join('\n')

          const blob = new Blob([csv], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`
          a.click()
          URL.revokeObjectURL(url)
        }}
      />

      <DataTable
        table={table}
        columns={subscriptionColumns}
        emptyState="No subscriptions found."
        onLoadMore={loadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />
    </div>
  )
}
