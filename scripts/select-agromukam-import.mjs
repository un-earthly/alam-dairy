// =============================================================
// Select a curated ~500-product subset of the agromukam Cattle catalog
// to actually import into our own products table.
//
//   node scripts/select-agromukam-import.mjs
//
// Ranking is contextual first, text-based second:
//   1. bucket by guessed our-taxonomy type (dairy/cattle/feed/equipment/
//      vet_supply) — drops anything that doesn't fit our shop at all
//      ("other": fish/poultry/gardening/pets that leaked into the Cattle
//      facet)
//   2. within each bucket, rank by name+description similarity to what
//      we already stock, so the selection skews toward products that
//      are recognizably close to our existing catalog rather than
//      obscure one-offs
//   3. take a per-bucket quota proportional to that bucket's share of
//      the whole catalog, so the ~500 total roughly mirrors agromukam's
//      real distribution instead of e.g. being 90% vet_supply
//
// Writes:
//   scripts/.agromukam-cache/import-500.json
//   public/competitors/agromukam-import-500.csv  (seed-ready columns)
// =============================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = new URL('..', import.meta.url).pathname
const CACHE_DIR = path.join(ROOT, 'scripts/.agromukam-cache')
const JSON_OUT = path.join(CACHE_DIR, 'import-500.json')
const CSV_OUT = path.join(ROOT, 'public/competitors/agromukam-import-500.csv')

const TYPESENSE_HOST = 'agromukam.com:8108'
const TYPESENSE_KEY = 'MrIpoldvsiDdZKmq16stvJ0TluOCDeuC'
const COLLECTION = 'agro_products'
const PER_PAGE = 250
const TARGET_TOTAL = 500

const env = Object.fromEntries(
  readFileSync(path.join(ROOT, '.env'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

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
  'for', 'and', 'the', 'with', 'from',
])

function words(text) {
  return (text ?? '').toLowerCase().split(/\W+/).filter((w) => w.length > 2 && !/^\d/.test(w) && !STOPWORDS.has(w))
}

const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g

function stripHtml(html) {
  const text = (html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
  // slicing UTF-16 strings can split a surrogate pair in half, which
  // Postgres/PostgREST rejects outright ("invalid input syntax for type json")
  return text.replace(LONE_SURROGATE, '')
}

// text-based similarity to our existing catalog: name carries most of the
// signal, description is a lighter secondary signal ("name desc based")
function textScore(agroName, agroDesc, ourProducts) {
  const nameWords = words(agroName)
  const descWords = words(agroDesc)
  let best = 0
  for (const p of ourProducts) {
    const ourNameWords = words(p.name_en)
    const ourDescWords = words(p.description_en)
    if (ourNameWords.length === 0) continue
    const nameHits = ourNameWords.reduce((n, w) => n + (nameWords.includes(w) ? 1 : 0), 0)
    const nameSim = nameHits / ourNameWords.length
    const descHits = ourDescWords.reduce((n, w) => n + (descWords.includes(w) ? 1 : 0), 0)
    const descSim = ourDescWords.length ? descHits / ourDescWords.length : 0
    const score = nameSim + descSim * 0.25
    if (score > best) best = score
  }
  return best
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
  return res.json()
}

const UNIT_RE = /(\d+(?:\.\d+)?)\s*(kg|gm|g|ml|l|litre|liter|pcs|pc|pack|packs|set|box|vial|bottle|drum|bag|bale)\b/i
function extractUnit(name) {
  const m = name.match(UNIT_RE)
  if (!m) return 'piece'
  const num = m[1]
  let unit = m[2].toLowerCase()
  if (unit === 'g') unit = 'gm'
  if (unit === 'l') unit = 'litre'
  if (unit === 'pc') unit = 'pcs'
  return `${num}${unit}`
}

function slugify(name, agroId) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return base ? `${base}-${agroId}` : `agromukam-${agroId}`
}

async function main() {
  console.log('Loading our own product catalog…')
  const { data: ourProducts, error } = await supabase.from('products').select('slug,name_en,type,description_en')
  if (error) throw error
  const existingSlugs = new Set((await supabase.from('products').select('slug')).data.map((p) => p.slug))

  console.log('Re-fetching agromukam catalog with descriptions…')
  const first = await fetchPage(1)
  const totalPages = Math.ceil(first.found / PER_PAGE)
  let allDocs = first.hits.map((h) => h.document)
  for (let page = 2; page <= totalPages; page++) {
    allDocs = allDocs.concat((await fetchPage(page)).hits.map((h) => h.document))
    console.log(`  page ${page}/${totalPages}`)
  }
  console.log(`  ${allDocs.length} raw docs`)

  // dedupe by normalized name, keep first
  const seenNames = new Set()
  const deduped = []
  for (const doc of allDocs) {
    const key = (doc.Name ?? '').trim().toLowerCase()
    if (seenNames.has(key)) continue
    seenNames.add(key)
    deduped.push(doc)
  }
  console.log(`  ${deduped.length} after dedupe`)

  const candidates = deduped
    .map((doc) => {
      const categoryPath = doc.ProductCategories?.lvl2?.[0] ?? doc.ProductCategories?.lvl1?.[0] ?? doc.ProductCategories?.lvl0?.[0] ?? ''
      const guessedType = guessOurType(categoryPath)
      const descriptionEn = stripHtml(doc.FullDescription).slice(0, 500)
      const descriptionBn = stripHtml(doc.FullDescriptionBn).slice(0, 500)
      const score = textScore(doc.Name ?? '', descriptionEn, ourProducts)
      const inStock = /in stock/i.test(doc.StockStatus ?? '')
      return { doc, categoryPath, guessedType, descriptionEn, descriptionBn, score, inStock }
    })
    .filter((c) => c.guessedType !== 'other')

  const buckets = {}
  for (const c of candidates) (buckets[c.guessedType] ??= []).push(c)

  const bucketTotal = candidates.length
  const selected = []
  for (const [type, items] of Object.entries(buckets)) {
    const quota = Math.round((items.length / bucketTotal) * TARGET_TOTAL)
    items.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (a.inStock !== b.inStock) return a.inStock ? -1 : 1
      return (a.doc.ProductPrice?.Price ?? 0) - (b.doc.ProductPrice?.Price ?? 0)
    })
    selected.push(...items.slice(0, quota))
    console.log(`  ${type}: ${items.length} candidates → quota ${quota}`)
  }

  console.log(`\nSelected ${selected.length} products total`)

  const usedSlugs = new Set(existingSlugs)
  const rows = selected.map(({ doc, categoryPath, guessedType, descriptionEn, descriptionBn, score, inStock }) => {
    let slug = slugify(doc.Name ?? `product-${doc.ProductId}`, doc.ProductId)
    while (usedSlugs.has(slug)) slug += '-x'
    usedSlugs.add(slug)

    const priceNow = doc.ProductPrice?.Price ?? 0
    const priceOld = doc.ProductPrice?.OldPrice ?? 0
    const hasDiscount = priceOld > priceNow
    const price = hasDiscount ? priceOld : priceNow
    const salePrice = hasDiscount ? priceNow : ''

    return {
      slug,
      name_en: doc.Name?.trim() ?? '',
      name_bn: doc.NameBn?.trim() ?? '',
      description_en: descriptionEn,
      description_bn: descriptionBn,
      type: guessedType,
      price,
      sale_price: salePrice,
      unit: extractUnit(doc.Name ?? ''),
      stock: inStock ? 40 : 0,
      is_active: false,
      tags: 'imported:agromukam',
      image_url: doc.ProductImages?.[0] ?? '',
      agro_id: doc.ProductId,
      agro_url: `https://agromukam.com/${doc.SeName}`,
      agro_category: categoryPath,
      match_score: score.toFixed(2),
    }
  })

  mkdirSync(CACHE_DIR, { recursive: true })
  mkdirSync(path.dirname(CSV_OUT), { recursive: true })
  writeFileSync(JSON_OUT, JSON.stringify(rows, null, 2))

  const cols = Object.keys(rows[0])
  const escape = (v) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csvLines = [cols.join(','), ...rows.map((r) => cols.map((c) => escape(r[c])).join(','))]
  writeFileSync(CSV_OUT, csvLines.join('\n') + '\n')

  console.log(`\nWrote ${rows.length} rows →`)
  console.log(`  ${path.relative(ROOT, JSON_OUT)}`)
  console.log(`  ${path.relative(ROOT, CSV_OUT)}`)
}

main()
