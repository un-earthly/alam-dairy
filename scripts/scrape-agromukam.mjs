// =============================================================
// Competitor research — pull matching products from agromukam.com
//
//   node scripts/scrape-agromukam.mjs [--apply] [--limit N]
//
// For every row in products-price-benchmark.csv, searches agromukam's
// public Typesense product index for the closest-matching listing(s),
// downloads their images, and records name/price/description/url.
//
// Output:
//   scripts/.agromukam-cache/matches.json   — raw match data per slug
//   public/competitors/agromukam/<slug>/*.webp-source (original images)
//   products-price-benchmark.csv            — competitor_price_min/max
//                                              filled in when --apply is passed
// =============================================================

import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const CSV_PATH = path.join(ROOT, 'products-price-benchmark.csv')
const CACHE_DIR = path.join(ROOT, 'scripts/.agromukam-cache')
const IMAGES_DIR = path.join(ROOT, 'public/competitors/agromukam')

const TYPESENSE_HOST = 'agromukam.com:8108'
const TYPESENSE_KEY = 'MrIpoldvsiDdZKmq16stvJ0TluOCDeuC'
const COLLECTION = 'agro_products'

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity

async function exists(p) {
  return access(p).then(() => true, () => false)
}

function parseCsv(text) {
  const [header, ...lines] = text.trim().split('\n')
  const cols = header.split(',')
  return lines.map((line) => {
    // simple CSV split that tolerates quoted commas
    const values = []
    let cur = '', inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') inQuotes = !inQuotes
      else if (c === ',' && !inQuotes) { values.push(cur); cur = '' }
      else cur += c
    }
    values.push(cur)
    const row = {}
    cols.forEach((c, i) => { row[c] = values[i] ?? '' })
    return row
  })
}

function toCsv(rows, cols) {
  const escape = (v) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v)
  const lines = [cols.join(',')]
  for (const row of rows) lines.push(cols.map((c) => escape(String(row[c] ?? ''))).join(','))
  return lines.join('\n') + '\n'
}

async function searchAgromukam(query, filterBy) {
  const params = {
    q: query,
    query_by: 'Name,NameBn,ProductTags',
    per_page: '10',
  }
  if (filterBy) params.filter_by = filterBy
  const url = `https://${TYPESENSE_HOST}/collections/${COLLECTION}/documents/search?` + new URLSearchParams(params)
  const res = await fetch(url, { headers: { 'X-TYPESENSE-API-KEY': TYPESENSE_KEY } })
  if (!res.ok) throw new Error(`typesense ${res.status} for "${query}"`)
  const json = await res.json()
  return (json.hits ?? []).map((h) => h.document)
}

// agromukam is a livestock/farm-supply B2B marketplace, not a consumer
// dairy retailer. Live cattle for sale sit under the "HaatBazar > Cattle
// Haat" facet as dozens of individually tagged animals (mostly "Deshi"
// local breed, some tagged "Shahiwal") — there is no Holstein/Jersey/
// Murrah/Nili-Ravi breeding stock listed. Rather than free-text search
// (which false-positives on unrelated equipment containing breed words
// like "Buffalo" in "Cattle Weight Scale"), pull the whole Haat listing
// once and bucket it by breed keyword.
async function loadHaatBazarCattle() {
  const url = `https://${TYPESENSE_HOST}/collections/${COLLECTION}/documents/search?` +
    new URLSearchParams({
      q: '*',
      query_by: 'Name',
      filter_by: 'ProductCategories.lvl0:=HaatBazar',
      per_page: '250',
    })
  const res = await fetch(url, { headers: { 'X-TYPESENSE-API-KEY': TYPESENSE_KEY } })
  if (!res.ok) throw new Error(`typesense ${res.status} loading HaatBazar`)
  const json = await res.json()
  return (json.hits ?? []).map((h) => h.document)
}

const HAAT_BREED_RULES = [
  [/^sahiwal-cow$/, (doc) => /shahiwal/i.test(doc.Name ?? '')],
  [/^local-breed-cow$/, (doc) => /^deshi:/i.test(doc.Name ?? '') && !/shahiwal/i.test(doc.Name ?? '')],
]

// products found by walking real category facets (e.g. "Cattle >
// Equipments, Tools & Medical Supplies > Test Kits") rather than by
// free-text score — the generic search misses these because the listing
// names use different words than ours (e.g. "Lactometer Set -
// Bangladeshi" vs our "Milk Testing Lactometer").
const MANUAL_PRODUCT_IDS = {
  lactometer: [7120], // Lactometer Set - Bangladeshi
  'ear-tag-set-100': [8094, 8576], // Ear Tag Durable Laser Engraved / Goat Medium Ear Tag — priced per piece, we sell per 100
}

const STOPWORDS = new Set([
  'fresh', 'pure', 'sweet', 'salty', 'single', 'double', 'plain', 'local', 'young',
  'high', 'yield', 'male', 'female', 'breed', 'breeding', 'dairy', 'cow', 'set', 'mix',
  'mixture', 'block', 'method', 'starter', 'feed', 'cluster', 'cheese', 'quality', 'farm',
  'litre', 'liter', 'kilo', 'months', 'month', 'bag', 'bale', 'bundle', 'drum', 'piece',
])

// crude relevance score so we don't grab an unrelated product
function scoreMatch(product, doc) {
  const nameWords = product.name_en
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !/^\d/.test(w) && !STOPWORDS.has(w))
  if (nameWords.length === 0) return 0
  const docName = (doc.Name ?? '').toLowerCase()
  const hits = nameWords.reduce((n, w) => n + (new RegExp(`\\b${w}\\b`).test(docName) ? 1 : 0), 0)
  const ratio = hits / nameWords.length // 0..1 ratio of distinctive words matched
  const category = (doc.ProductCategories?.lvl0?.[0] ?? '').toLowerCase()
  const categoryOk =
    (product.category === 'feed' && /feed/.test(category)) ||
    (product.category === 'equipment' && /cattle|equip/.test(category))

  // more than half the distinctive words must appear — a single generic
  // word (e.g. "milk") matching by itself is not enough of a signal
  if (nameWords.length === 1) return hits === 1 && categoryOk ? 1 : 0
  if (ratio <= 0.5) return 0
  return ratio + (categoryOk ? 0.25 : 0)
}

async function downloadImage(url, dest) {
  if (await exists(dest)) return
  const res = await fetch(url, { headers: { 'User-Agent': 'alam-dairy-research/1.0' } })
  if (!res.ok) throw new Error(`image download ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await mkdir(path.dirname(dest), { recursive: true })
  await writeFile(dest, buf)
}

async function buildFoundEntry(product, doc, score) {
  const images = []
  for (const [i, imgUrl] of (doc.ProductImages ?? []).slice(0, 3).entries()) {
    const ext = path.extname(new URL(imgUrl).pathname) || '.webp'
    const dest = path.join(IMAGES_DIR, product.slug, `${doc.ProductId}-${i}${ext}`)
    try {
      await downloadImage(imgUrl, dest)
      images.push(`/${path.relative(path.join(ROOT, 'public'), dest)}`)
    } catch {
      // skip broken image
    }
  }
  return {
    score,
    productId: doc.ProductId,
    name: doc.Name?.trim(),
    nameBn: doc.NameBn?.trim(),
    price: doc.ProductPrice?.Price,
    oldPrice: doc.ProductPrice?.OldPrice,
    stockStatus: doc.StockStatus,
    category: doc.ProductCategories?.lvl1?.[0] ?? doc.ProductCategories?.lvl0?.[0],
    shortDescription: doc.ShortDescription,
    vendor: doc.VendorStoreName,
    url: `https://agromukam.com/${doc.SeName}`,
    images,
  }
}

async function main() {
  const products = parseCsv(await readFile(CSV_PATH, 'utf8'))
  await mkdir(CACHE_DIR, { recursive: true })
  const matchesPath = path.join(CACHE_DIR, 'matches.json')
  const matches = (await exists(matchesPath)) ? JSON.parse(await readFile(matchesPath, 'utf8')) : {}

  const cattleProducts = products.filter((p) => p.category === 'cattle')
  let haatCattle = []
  if (cattleProducts.some((p) => !matches[p.slug])) {
    console.log('Loading HaatBazar live-cattle listings…')
    haatCattle = await loadHaatBazarCattle()
    console.log(`  ${haatCattle.length} tagged animals found`)
  }

  let done = 0
  for (const product of products) {
    if (done >= LIMIT) break
    if (matches[product.slug]) { done++; continue }

    if (product.category === 'cattle') {
      const rule = HAAT_BREED_RULES.find(([re]) => re.test(product.slug))
      const breedDocs = rule ? haatCattle.filter(rule[1]) : []
      if (breedDocs.length === 0) {
        matches[product.slug] = { query: 'HaatBazar (no matching breed listed)', found: [] }
        console.log(`— ${product.slug}: not sold on agromukam (no matching live-cattle listing)`)
        await writeFile(matchesPath, JSON.stringify(matches, null, 2))
        done++
        continue
      }
      // dozens of individually tagged animals of the same breed — take a
      // representative spread (cheapest, median, priciest) instead of all
      const sorted = [...breedDocs].sort((a, b) => a.ProductPrice.Price - b.ProductPrice.Price)
      const sample = [sorted[0], sorted[Math.floor(sorted.length / 2)], sorted[sorted.length - 1]]
      const found = []
      for (const doc of sample) found.push(await buildFoundEntry(product, doc, 1))
      matches[product.slug] = { query: `HaatBazar breed match (${breedDocs.length} listed)`, found }
      await writeFile(matchesPath, JSON.stringify(matches, null, 2))
      console.log(`✓ ${product.slug} → ${breedDocs.length} listings, ${sorted[0].ProductPrice.Price}-${sorted[sorted.length - 1].ProductPrice.Price} BDT`)
      done++
      continue
    }

    if (MANUAL_PRODUCT_IDS[product.slug]) {
      const filterBy = `ProductId:[${MANUAL_PRODUCT_IDS[product.slug].join(',')}]`
      const docs = await searchAgromukam('*', filterBy)
      const found = []
      for (const doc of docs) found.push(await buildFoundEntry(product, doc, 1))
      matches[product.slug] = { query: 'manual category-facet match', found }
      await writeFile(matchesPath, JSON.stringify(matches, null, 2))
      console.log(`✓ ${product.slug} (manual) → ${found.map((f) => `${f.name} (${f.price} BDT)`).join(' | ')}`)
      done++
      continue
    }

    const query = product.name_en.replace(/\s*\d+\s*(kg|g|l|ml|litre|bale|bag|piece|set|head)\b/gi, '').trim()
    let hits = []
    try {
      hits = await searchAgromukam(query || product.name_en)
    } catch (err) {
      console.log(`✗ ${product.slug}: ${err.message}`)
      continue
    }

    const scored = hits
      .map((doc) => ({ doc, score: scoreMatch(product, doc) }))
      .filter((s) => s.score >= 0.6)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    if (scored.length === 0) {
      matches[product.slug] = { query, found: [] }
      console.log(`— ${product.slug}: no confident match`)
      await writeFile(matchesPath, JSON.stringify(matches, null, 2))
      done++
      continue
    }

    const found = []
    for (const { doc, score } of scored) found.push(await buildFoundEntry(product, doc, score))

    matches[product.slug] = { query, found }
    await writeFile(matchesPath, JSON.stringify(matches, null, 2))
    console.log(`✓ ${product.slug} → ${found.map((f) => `${f.name} (${f.price} BDT)`).join(' | ')}`)
    done++
  }

  if (APPLY) {
    const cols = ['slug', 'name_en', 'name_bn', 'category', 'unit', 'our_price_bdt', 'our_sale_price_bdt', 'stock', 'competitor_price_min_bdt', 'competitor_price_max_bdt', 'target_price_bdt', 'notes']
    for (const product of products) {
      const m = matches[product.slug]
      if (!m || m.found.length === 0) continue
      const prices = m.found.map((f) => f.price).filter((p) => typeof p === 'number' && p > 0)
      if (prices.length === 0) continue
      product.competitor_price_min_bdt = String(Math.min(...prices))
      product.competitor_price_max_bdt = String(Math.max(...prices))
      product.notes = `agromukam: ${m.found[0].name}`
    }
    await writeFile(CSV_PATH, toCsv(products, cols))
    console.log(`\nCSV updated with competitor prices for matched products`)
  }

  console.log(`\nDone. ${Object.values(matches).filter((m) => m.found.length).length}/${products.length} matched.`)
}

main()
