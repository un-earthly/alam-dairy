'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableToolbar, useDataTable, useInfiniteQuery } from '@/components/ui/data-table'
import { brandColumns } from './columns'
import { fetchBrandsPage } from './actions'
import type { Database } from '@/lib/supabase/types'

type Brand = Database['public']['Tables']['brands']['Row']

interface BrandsTableClientProps {
  initialBrands: Brand[]
}

export default function BrandsTableClient({ initialBrands }: BrandsTableClientProps) {
  const [search, setSearch] = useState('')

  const queryKey = JSON.stringify({ search })

  const { data, hasMore, loadingMore, loadMore } = useInfiniteQuery({
    initialData: initialBrands,
    fetchPage: async (params: any) => {
      return fetchBrandsPage({
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
    columns: brandColumns,
    pageSize: 20,
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Search brands..."
        searchValue={search}
        onSearchChange={setSearch}
        showExport={false}
      >
        <Link href="/admin/brands/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Brand
          </Button>
        </Link>
      </DataTableToolbar>

      <DataTable
        table={table}
        columns={brandColumns}
        emptyState="No brands found."
        onLoadMore={loadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />
    </div>
  )
}
