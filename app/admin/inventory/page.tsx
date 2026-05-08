import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Package } from 'lucide-react'

export default async function AdminInventoryPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name_en, type, stock, unit, is_active')
    .order('stock', { ascending: true })

  const low = (products ?? []).filter((p) => p.stock < 10 && p.stock > 0)
  const outOfStock = (products ?? []).filter((p) => p.stock === 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

      {/* Alerts */}
      {(low.length > 0 || outOfStock.length > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {outOfStock.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Out of Stock ({outOfStock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {outOfStock.map((p) => (
                    <li key={p.id} className="text-sm text-red-800">{p.name_en}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {low.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Low Stock ({low.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {low.map((p) => (
                    <li key={p.id} className="text-sm text-orange-800">{p.name_en} — {p.stock} {p.unit}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Full table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            All Products
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(products ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name_en}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize text-xs">{p.type.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {p.stock} {p.unit}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={
                        p.stock === 0 ? 'bg-red-100 text-red-800' :
                        p.stock < 10 ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low' : 'OK'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
