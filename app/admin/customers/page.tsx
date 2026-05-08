import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminCustomersPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, phone, email, role, is_farmer, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(profiles ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.full_name ?? 'N/A'}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{p.phone ?? '-'}</p>
                      <p className="text-xs text-gray-400">{p.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={p.is_farmer ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {p.is_farmer ? 'Farmer' : 'Consumer'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(p.created_at).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
                {(profiles ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-400">No customers yet.</td>
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
