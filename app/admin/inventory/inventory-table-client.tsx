'use client'

import React from 'react'
import { DataTable, useDataTable, useInfiniteQuery } from '@/components/ui/data-table'
import { inventoryColumns } from './columns'
import { fetchInventoryPage, type Product } from './actions'

interface InventoryTableClientProps {
  initialProducts: Product[]
}

export default function InventoryTableClient({ initialProducts }: InventoryTableClientProps) {
  const queryKey = JSON.stringify({})

  const { data, hasMore, loadingMore, loadMore } = useInfiniteQuery({
    initialData: initialProducts,
    fetchPage: async (params: any) => {
      return fetchInventoryPage({
        cursor: params.cursor,
        pageSize: params.pageSize,
      })
    },
    pageSize: 20,
    queryKey,
    params: {},
  })

  const { table } = useDataTable({
    data,
    columns: inventoryColumns,
    pageSize: 20,
  })

  return (
    <DataTable
      table={table}
      columns={inventoryColumns}
      emptyState="No products in inventory."
      onLoadMore={loadMore}
      hasMore={hasMore}
      loadingMore={loadingMore}
    />
  )
}
