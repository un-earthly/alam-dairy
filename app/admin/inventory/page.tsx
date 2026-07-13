import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Package } from 'lucide-react'
import { fetchInventoryPage } from './actions'
import InventoryTableClient from './inventory-table-client'

export default async function AdminInventoryPage() {
  const initialData = await fetchInventoryPage({
    cursor: 0,
    pageSize: 100, // Fetch all for alerts
  })

  const low = initialData.rows.filter((p) => p.stock < 10 && p.stock > 0)
  const outOfStock = initialData.rows.filter((p) => p.stock === 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Inventory</h1>

      {/* Alerts */}
      {(low.length > 0 || outOfStock.length > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {outOfStock.length > 0 && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Out of Stock ({outOfStock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {outOfStock.map((p) => (
                    <li key={p.id} className="text-sm text-destructive">{p.name_en}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {low.length > 0 && (
            <Card className="border-accent/20 bg-accent/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-accent flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Low Stock ({low.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {low.map((p) => (
                    <li key={p.id} className="text-sm text-accent">{p.name_en} — {p.stock} {p.unit}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            All Products
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <InventoryTableClient initialProducts={initialData.rows.slice(0, 20)} />
        </CardContent>
      </Card>
    </div>
  )
}
