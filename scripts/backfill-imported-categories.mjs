// =============================================================
// Backfill category_id / brand_id for the 500 imported agromukam products
// (scripts/seed-agromukam-import.mjs) using the scrape's own agro_category
// path (Cattle > <Sub> > <Leaf>) and vendor field, joined back in via
// agro_id against the full catalog.json scrape.
//
//   node scripts/backfill-imported-categories.mjs
//
// Does NOT touch `tags` or `is_active` — activating imported products stays
// a deliberate admin decision via /admin/imported-products.
// =============================================================

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = new URL('..', import.meta.url).pathname
const IMPORT_PATH = path.join(ROOT, 'scripts/.agromukam-cache/import-500.json')
const CATALOG_PATH = path.join(ROOT, 'scripts/.agromukam-cache/catalog.json')

async function loadEnv() {
  for (const file of ['.env', '.env.local']) {
    try {
      const text = await readFile(path.join(ROOT, file), 'utf8')
      return Object.fromEntries(
        text
          .split('\n')
          .filter((l) => l.includes('=') && !l.startsWith('#'))
          .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
      )
    } catch {
      continue
    }
  }
  throw new Error('No .env or .env.local file found')
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  const env = await loadEnv()
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  const importRows = JSON.parse(await readFile(IMPORT_PATH, 'utf8'))
  const catalogRows = JSON.parse(await readFile(CATALOG_PATH, 'utf8'))
  const vendorByAgroId = new Map(catalogRows.map((r) => [r.agro_id, r.vendor]))

  // --- 1. Root categories already exist (seeded 1:1 with `type` in migration
  // 003) — fetch them so we can wire parent_id for the new subcategories.
  const { data: rootCategories, error: rootErr } = await supabase
    .from('categories')
    .select('id, slug')
    .is('parent_id', null)
  if (rootErr) throw rootErr
  const rootIdBySlug = new Map(rootCategories.map((c) => [c.slug, c.id]))

  // --- 2. Derive (root, sub, leaf) triples + vendor per row.
  const rowsWithMeta = importRows.map((r) => {
    const [, sub, leaf] = (r.agro_category ?? '').split(' > ').map((s) => s?.trim())
    const vendor = vendorByAgroId.get(r.agro_id) ?? null
    return { ...r, sub, leaf, vendor }
  })

  // --- 3. Upsert subcategories, then leaf categories.
  const subKey = (r) => `${r.type}::${r.sub}`
  const distinctSubs = [...new Map(rowsWithMeta.filter((r) => r.sub).map((r) => [subKey(r), r])).values()]

  const subPayload = distinctSubs
    .filter((r) => rootIdBySlug.has(r.type))
    .map((r) => ({
      slug: slugify(`${r.type}-${r.sub}`),
      parent_id: rootIdBySlug.get(r.type),
      name_bn: r.sub,
      name_en: r.sub,
      is_active: true,
    }))

  console.log(`Upserting ${subPayload.length} subcategories...`)
  for (const batch of chunk(subPayload, 100)) {
    const { error } = await supabase.from('categories').upsert(batch, { onConflict: 'slug' })
    if (error) console.error('subcategory upsert error:', error.message)
  }

  const { data: subCategories, error: subFetchErr } = await supabase
    .from('categories')
    .select('id, slug')
    .in('slug', subPayload.map((s) => s.slug))
  if (subFetchErr) throw subFetchErr
  const subIdBySlug = new Map(subCategories.map((c) => [c.slug, c.id]))

  const leafKey = (r) => `${r.type}::${r.sub}::${r.leaf}`
  const distinctLeaves = [...new Map(rowsWithMeta.filter((r) => r.sub && r.leaf).map((r) => [leafKey(r), r])).values()]

  const leafPayload = distinctLeaves
    .map((r) => ({
      slug: slugify(`${r.type}-${r.sub}-${r.leaf}`),
      parentSlug: slugify(`${r.type}-${r.sub}`),
      name_bn: r.leaf,
      name_en: r.leaf,
      is_active: true,
    }))
    .filter((r) => subIdBySlug.has(r.parentSlug))
    .map(({ parentSlug, ...rest }) => ({ ...rest, parent_id: subIdBySlug.get(parentSlug) }))

  console.log(`Upserting ${leafPayload.length} leaf categories...`)
  for (const batch of chunk(leafPayload, 100)) {
    const { error } = await supabase.from('categories').upsert(batch, { onConflict: 'slug' })
    if (error) console.error('leaf category upsert error:', error.message)
  }

  const { data: leafCategories, error: leafFetchErr } = await supabase
    .from('categories')
    .select('id, slug')
    .in('slug', leafPayload.map((l) => l.slug))
  if (leafFetchErr) throw leafFetchErr
  const leafIdBySlug = new Map(leafCategories.map((c) => [c.slug, c.id]))

  // --- 4. Upsert brands from distinct vendors.
  const distinctVendors = [...new Set(rowsWithMeta.map((r) => r.vendor).filter(Boolean))]
  const brandPayload = distinctVendors.map((name) => ({ slug: slugify(name), name, is_active: true }))

  console.log(`Upserting ${brandPayload.length} brands...`)
  for (const batch of chunk(brandPayload, 100)) {
    const { error } = await supabase.from('brands').upsert(batch, { onConflict: 'slug' })
    if (error) console.error('brand upsert error:', error.message)
  }

  const { data: brands, error: brandFetchErr } = await supabase
    .from('brands')
    .select('id, slug')
    .in('slug', brandPayload.map((b) => b.slug))
  if (brandFetchErr) throw brandFetchErr
  const brandIdBySlug = new Map(brands.map((b) => [b.slug, b.id]))

  // --- 5. Fetch product ids by slug (chunked — 500 slugs is too many for one IN()).
  const allSlugs = rowsWithMeta.map((r) => r.slug)
  const productIdBySlug = new Map()
  for (const batch of chunk(allSlugs, 100)) {
    const { data, error } = await supabase.from('products').select('id, slug').in('slug', batch)
    if (error) throw error
    for (const p of data) productIdBySlug.set(p.slug, p.id)
  }

  // --- 6. Update each product's category_id / brand_id, and close the
  // product_media gap defensively (migration 004 already backfilled these
  // from images[] at apply time, so this is normally a no-op).
  console.log(`Updating category/brand for ${rowsWithMeta.length} products...`)
  let updated = 0
  let mediaInserted = 0
  const CONCURRENCY = 20
  for (const batch of chunk(rowsWithMeta, CONCURRENCY)) {
    await Promise.all(
      batch.map(async (r) => {
        const productId = productIdBySlug.get(r.slug)
        if (!productId) return

        const categoryId = r.leaf ? leafIdBySlug.get(slugify(`${r.type}-${r.sub}-${r.leaf}`)) : null
        const brandId = r.vendor ? brandIdBySlug.get(slugify(r.vendor)) : null

        const { error } = await supabase
          .from('products')
          .update({ category_id: categoryId ?? null, brand_id: brandId ?? null })
          .eq('id', productId)
        if (error) {
          console.error(`update failed for ${r.slug}:`, error.message)
          return
        }
        updated++

        if (r.cloudinary_url) {
          const { error: mediaErr } = await supabase
            .from('product_media')
            .insert({ product_id: productId, url: r.cloudinary_url, sort_order: 0 })
          // 23505 = unique_violation — row already exists from migration 004's
          // one-time images[] backfill; that's the expected common case.
          if (!mediaErr) mediaInserted++
          else if (mediaErr.code !== '23505') console.error(`media insert failed for ${r.slug}:`, mediaErr.message)
        }
      })
    )
  }

  console.log(
    `\nDone. Categories: ${subPayload.length + leafPayload.length} upserted. Brands: ${brandPayload.length} upserted. ` +
    `Products updated: ${updated}/${rowsWithMeta.length}. Media rows inserted: ${mediaInserted}.`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
