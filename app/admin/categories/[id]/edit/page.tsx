import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CategoryForm from '@/components/admin/CategoryForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: category }, { data: categories }] = await Promise.all([
    supabase.from('categories').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, name_en').order('sort_order', { ascending: true }),
  ])

  if (!category) notFound()

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
      <CategoryForm categories={categories ?? []} initialData={category} />
    </div>
  )
}
