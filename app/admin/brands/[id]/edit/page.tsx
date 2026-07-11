import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BrandForm from '@/components/admin/BrandForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBrandPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: brand } = await supabase.from('brands').select('*').eq('id', id).single()

  if (!brand) notFound()

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Edit Brand</h1>
      <BrandForm initialData={brand} />
    </div>
  )
}
