import { readFile } from 'node:fs/promises'
import path from 'node:path'
import CompetitorReviewClient, { type AgromukamRow } from './review-client'

async function loadCatalog(): Promise<AgromukamRow[]> {
  const filePath = path.join(process.cwd(), 'scripts/.agromukam-cache/catalog.json')
  try {
    const raw = await readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export default async function CompetitorImportPage() {
  const rows = await loadCatalog()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agromukam Catalog Review</h1>
        <p className="text-sm text-gray-500 mt-1">
          {rows.length} products pulled from agromukam.com&apos;s Cattle category (nutrition, medication, feed
          ingredients, equipment, live-animal haat). Their names/urls don&apos;t follow our naming — review each and
          mark the ones worth adding to our own catalog.
        </p>
      </div>
      <CompetitorReviewClient rows={rows} />
    </div>
  )
}
