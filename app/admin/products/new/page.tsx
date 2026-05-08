import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
      <ProductForm />
    </div>
  )
}
