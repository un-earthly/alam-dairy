'use client'

import React, { useState } from 'react'
import { DataTable, DataTableToolbar, useDataTable, useInfiniteQuery } from '@/components/ui/data-table'
import { customerColumns } from './columns'
import { fetchCustomersPage, type Profile } from './actions'

interface CustomersTableClientProps {
  initialCustomers: Profile[]
}

export default function CustomersTableClient({ initialCustomers }: CustomersTableClientProps) {
  const [search, setSearch] = useState('')

  const queryKey = JSON.stringify({ search })

  const { data, hasMore, loadingMore, loadMore, reset } = useInfiniteQuery({
    initialData: initialCustomers,
    fetchPage: async (params: any) => {
      return fetchCustomersPage({
        cursor: params.cursor,
        pageSize: params.pageSize,
        search: params.search,
      })
    },
    pageSize: 20,
    queryKey,
    params: { search },
  })

  const { table } = useDataTable({
    data,
    columns: customerColumns,
    pageSize: 20,
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Search customers..."
        searchValue={search}
        onSearchChange={setSearch}
        showExport={true}
        onExport={() => {
          const csv = [
            ['Name', 'Phone', 'Email', 'Type', 'Joined'].join(','),
            ...data.map((c) => [
              c.full_name || '',
              c.phone || '',
              c.email || '',
              c.is_farmer ? 'Farmer' : 'Consumer',
              new Date(c.created_at).toLocaleDateString('en-GB'),
            ].join(',')),
          ].join('\n')

          const blob = new Blob([csv], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
          a.click()
          URL.revokeObjectURL(url)
        }}
      />

      <DataTable
        table={table}
        columns={customerColumns}
        emptyState="No customers found."
        onLoadMore={loadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />
    </div>
  )
}
