// =============================================================
// Pull the ENTIRE agromukam.com "Cattle" catalog (nutrition, medication,
// feed ingredients, equipment, live-animal haat) — not just products that
// already match ours. This is a research dump for deciding which of their
// listings we should add to our own catalog, since their naming/urls
// (often Bangla, non-standard slugs) don't line up with ours at all
// (e.g. their "Mixomin 10kg" is our "Mineral Mixture 10 kg").
//
//   node scripts/scrape-agromukam-catalog.mjs
//
// Reads our own catalog from Supabase (products table) to compute a
// best-guess match per scraped item.
//
// Writes:
//   scripts/.agromukam-cache/catalog.json   — full raw dump
//   public/competitors/agromukam-catalog.csv — flat CSV with image urls
// =============================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = new URL('..', import.meta.url).pathname
const CACHE_DIR = path.join(ROOT, 'scripts/.agromukam-cache')
const CSV_OUT = path.join(ROOT, 'public/competitors/agromukam-catalog.csv')
const JSON_OUT = path.join(CACHE_DIR, 'catalog.json')

const TYPESENSE_HOST = 'agromukam.com:8108'
const TYPESENSE_KEY = 'MrIpoldvsiDdZKmq16stvJ0TluOCDeuC'
const COLLECTION = 'agro_products'
const PER_PAGE = 250

const env = Object.fromEntries(
  readFileSync(path.join(ROOT, '.env'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// agromukam's lvl1 category path -> our own product `type` taxonomy
function guessOurType(categoryPath) {
  if (/Cattle Haat/i.test(categoryPath)) return 'cattle'
  if (/Equipments|Tools|Medical Supplies/i.test(categoryPath)) return 'equipment'
  if (/Cattle Medication|Hygiene|Grooming/i.test(categoryPath)) return 'vet_supply'
  if (/Cattle Nutrition|Feed Ingredients/i.test(categoryPath)) return 'feed'
  return 'other'
}

const STOPWORDS = new Set([
  'fresh', 'pure', 'sweet', 'salty', 'single', 'double', 'plain', 'local', 'young',
  'high', 'yield', 'male', 'female', 'breed', 'breeding', 'dairy', 'cow', 'set', 'mix',
  'mixture', 'block', 'method', 'starter', 'feed', 'cluster', 'cheese', 'quality', 'farm',
  'litre', 'liter', 'kilo', 'months', 'month', 'bag', 'bale', 'bundle', 'drum', 'piece',
])

function words(name) {
  return name.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !/^\d/.test(w) && !STOPWORDS.has(w))
}

function bestMatch(agroName, ourProducts) {
  const target = agroName.toLowerCase()
  let best = null
  for (const p of ourProducts) {
    const ws = words(p.name_en)
    if (ws.length === 0) continue
    const hits = ws.reduce((n, w) => n + (new RegExp(`\\b${w}\\b`).test(target) ? 1 : 0), 0)
    const score = hits / ws.length
    if (score > 0 && (!best || score > best.score)) best = { slug: p.slug, name_en: p.name_en, type: p.type, score }
  }
  return best && best.score >= 0.5 ? best : null
}

async function fetchPage(page) {
  const params = new URLSearchParams({
    q: '*',
    query_by: 'Name',
    filter_by: 'ProductCategories.lvl0:=Cattle',
    sort_by: 'ProductId:asc',
    per_page: String(PER_PAGE),
    page: String(page),
  })
  const url = `https://${TYPESENSE_HOST}/collections/${COLLECTION}/documents/search?${params}`
  const res = await fetch(url, { headers: { 'X-TYPESENSE-API-KEY': TYPESENSE_KEY } })
  if (!res.ok) throw new Error(`typesense ${res.status} on page ${page}`)
  const json = await res.json()
  return json
}

function toCsv(rows) {
  const cols = [
    'agro_id', 'name_en', 'name_bn', 'agro_category', 'guessed_our_type',
    'price_bdt', 'old_price_bdt', 'stock_status', 'vendor', 'url', 'image_url',
    'match_slug', 'match_name_en', 'match_score',
  ]
  const escape = (v) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [cols.join(',')]
  for (const r of rows) lines.push(cols.map((c) => escape(r[c])).join(','))
  return lines.join('\n') + '\n'
}

async function main() {
  console.log('Loading our own product catalog from Supabase…')
  const { data: ourProducts, error } = await supabase.from('products').select('slug,name_en,type')
  if (error) throw error
  console.log(`  ${ourProducts.length} of our products loaded`)

  console.log('Fetching agromukam Cattle catalog (this covers nutrition, medication,')
  console.log('feed ingredients, equipment, and live-animal haat listings)…')

  const first = await fetchPage(1)
  const total = first.found
  const totalPages = Math.ceil(total / PER_PAGE)
  console.log(`  ${total} products across ${totalPages} pages`)

  let allDocs = first.hits.map((h) => h.document)
  for (let page = 2; page <= totalPages; page++) {
    const json = await fetchPage(page)
    allDocs = allDocs.concat(json.hits.map((h) => h.document))
    console.log(`  page ${page}/${totalPages} (${allDocs.length}/${total})`)
  }

  const rows = allDocs.map((doc) => {
    const categoryPath = doc.ProductCategories?.lvl2?.[0] ?? doc.ProductCategories?.lvl1?.[0] ?? doc.ProductCategories?.lvl0?.[0] ?? ''
    const guessedType = guessOurType(categoryPath)
    const match = bestMatch(doc.Name ?? '', ourProducts)
    return {
      agro_id: doc.ProductId,
      name_en: doc.Name?.trim() ?? '',
      name_bn: doc.NameBn?.trim() ?? '',
      agro_category: categoryPath,
      guessed_our_type: guessedType,
      price_bdt: doc.ProductPrice?.Price ?? '',
      old_price_bdt: doc.ProductPrice?.OldPrice ?? '',
      stock_status: doc.StockStatus ?? '',
      vendor: doc.VendorStoreName ?? '',
      url: `https://agromukam.com/${doc.SeName}`,
      image_url: doc.ProductImages?.[0] ?? '',
      match_slug: match?.slug ?? '',
      match_name_en: match?.name_en ?? '',
      match_score: match ? match.score.toFixed(2) : '',
    }
  })

  mkdirSync(CACHE_DIR, { recursive: true })
  mkdirSync(path.dirname(CSV_OUT), { recursive: true })
  writeFileSync(JSON_OUT, JSON.stringify(rows, null, 2))
  writeFileSync(CSV_OUT, toCsv(rows))

  console.log(`\nWrote ${rows.length} rows →`)
  console.log(`  ${path.relative(ROOT, JSON_OUT)}`)
  console.log(`  ${path.relative(ROOT, CSV_OUT)}`)
  const matched = rows.filter((r) => r.match_slug).length
  console.log(`${matched} already look like something we sell; ${rows.length - matched} are new/unmatched.`)
}

main()
