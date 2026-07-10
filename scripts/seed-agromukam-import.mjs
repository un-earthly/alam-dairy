// =============================================================
// Insert the curated 500-product agromukam selection into our own
// products table, using the Cloudinary-hosted image (not agromukam's
// CDN url) as the stored image.
//
//   node scripts/seed-agromukam-import.mjs
//
// Seeded rows are inserted with is_active:false and tagged
// 'imported:agromukam' so they don't show up in the live public shop
// until reviewed at /admin/imported-products and flipped on deliberately.
// =============================================================

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = new URL('..', import.meta.url).pathname
const IMPORT_PATH = path.join(ROOT, 'scripts/.agromukam-cache/import-500.json')

const env = Object.fromEntries(
  (await readFile(path.join(ROOT, '.env'), 'utf8'))
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

async function main() {
  const rows = JSON.parse(await readFile(IMPORT_PATH, 'utf8'))
  const missingImage = rows.filter((r) => !r.cloudinary_url)
  if (missingImage.length) console.log(`${missingImage.length} rows missing a Cloudinary image — run upload-agromukam-images.mjs first`)

  const payload = rows
    .filter((r) => r.cloudinary_url)
    .map((r) => ({
      slug: r.slug,
      name_bn: r.name_bn || r.name_en,
      name_en: r.name_en,
      description_bn: r.description_bn || null,
      description_en: r.description_en || null,
      type: r.type,
      price: Number(r.price) || 0,
      sale_price: r.sale_price ? Number(r.sale_price) : null,
      unit: r.unit,
      stock: Number(r.stock) || 0,
      is_active: false,
      tags: r.tags ? r.tags.split(',') : [],
      images: [r.cloudinary_url],
    }))

  console.log(`Inserting ${payload.length} products (is_active: false, tagged imported:agromukam)…`)

  const CHUNK = 100
  let inserted = 0
  for (let i = 0; i < payload.length; i += CHUNK) {
    const chunk = payload.slice(i, i + CHUNK)
    const { error, data } = await supabase.from('products').upsert(chunk, { onConflict: 'slug' }).select('id')
    if (error) { console.error(`chunk ${i / CHUNK}: `, error); continue }
    inserted += data.length
    console.log(`  chunk ${i / CHUNK + 1}: ${data.length} rows`)
  }

  console.log(`\nDone. ${inserted}/${payload.length} products upserted.`)
}

main()
