'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableToolbar, useDataTable, useInfiniteQuery } from '@/components/ui/data-table'
import { categoryColumns } from './columns'
import { fetchCategoriesPage, type Category } from './actions'

interface CategoriesTableClientProps {
  initialCategories: Category[]
}

export default function CategoriesTableClient({
  initialCategories,
}: CategoriesTableClientProps) {
  const [search, setSearch] = useState('')

  const queryKey = JSON.stringify({ search })

  const { data, hasMore, loadingMore, loadMore } = useInfiniteQuery({
    initialData: initialCategories,
    fetchPage: async (params: any) => {
      return fetchCategoriesPage({
        cursor: params.cursor,
        pageSize: params.pageSize,
        search: params.search,
      })
    },
    pageSize: 20,
    queryKey,
    params: { search },
  })

  const enrichedData = useMemo(() => {
    const nameById = new Map(data.map((c) => [c.id, c.name_en]))
    return data.map((c) => ({
      ...c,
      parentName: c.parent_id ? nameById.get(c.parent_id) : undefined,
    }))
  }, [data])

  const { table } = useDataTable({
    data: enrichedData,
    columns: categoryColumns,
    pageSize: 20,
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Search categories..."
        searchValue={search}
        onSearchChange={setSearch}
        showExport={false}
      >
        <Link href="/admin/categories/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Category
          </Button>
        </Link>
      </DataTableToolbar>

      <DataTable
        table={table}
        columns={categoryColumns}
        emptyState="No categories found."
        onLoadMore={loadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />
    </div>
  )
}
