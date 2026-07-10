import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TYPE_LABELS: Record<string, string> = {
  dairy: 'Dairy',
  cattle: 'Cattle',
  feed: 'Feed',
  equipment: 'Equipment',
  vet_supply: 'Vet Supply',
}

const TYPE_COLORS: Record<string, string> = {
  dairy: 'bg-amber-100 text-amber-800',
  cattle: 'bg-green-100 text-green-800',
  feed: 'bg-lime-100 text-lime-800',
  equipment: 'bg-blue-100 text-blue-800',
  vet_supply: 'bg-teal-100 text-teal-800',
}

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name_en, type, price, stock, is_active, slug')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link href="/admin/products/new">
          <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(products ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name_en}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[p.type] ?? ''}`}>
                        {TYPE_LABELS[p.type] ?? p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">৳{p.price.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-medium ${p.stock === 0 ? 'text-red-600' : p.stock < 10 ? 'text-orange-600' : 'text-gray-700'}`}>
                      {p.stock}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                        {p.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {(products ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      No products yet. <Link href="/admin/products/new" className="text-green-600 hover:underline">Add the first one.</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
