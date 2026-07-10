// =============================================================
// Merge scraped competitor listings (agromukam.com + onaturalbd.com)
// into one file keyed by our own product slugs.
//
//   node scripts/build-competitor-data.mjs [--apply]
//
// Reads:
//   scripts/.agromukam-cache/matches.json
//   scripts/.competitor-cache/onaturalbd.json
// Writes:
//   scripts/.competitor-cache/consolidated.json
//   products-price-benchmark.csv (competitor_price_min/max, --apply only)
// =============================================================

import { readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const CSV_PATH = path.join(ROOT, 'products-price-benchmark.csv')
const AGRO_PATH = path.join(ROOT, 'scripts/.agromukam-cache/matches.json')
const ONATURAL_PATH = path.join(ROOT, 'scripts/.competitor-cache/onaturalbd.json')
const OUT_PATH = path.join(ROOT, 'scripts/.competitor-cache/consolidated.json')

const APPLY = process.argv.includes('--apply')

async function exists(p) {
  return access(p).then(() => true, () => false)
}

function parseCsv(text) {
  const [header, ...lines] = text.trim().split('\n')
  const cols = header.split(',')
  return lines.map((line) => {
    const values = []
    let cur = '', inQuotes = false
    for (const c of line) {
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

const STOPWORDS = new Set(['fresh', 'pure', 'sweet', 'salty', 'plain', 'onatural', "o'natural", 'dairy', 'cup'])

function matchScore(product, name) {
  const words = product.name_en.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !/^\d/.test(w) && !STOPWORDS.has(w))
  if (words.length === 0) return 0
  const target = name.toLowerCase()
  const hits = words.reduce((n, w) => n + (new RegExp(`\\b${w}\\b`).test(target) ? 1 : 0), 0)
  return hits / words.length
}

async function main() {
  const products = parseCsv(await readFile(CSV_PATH, 'utf8'))
  const agromukam = (await exists(AGRO_PATH)) ? JSON.parse(await readFile(AGRO_PATH, 'utf8')) : {}
  const onaturalRaw = (await exists(ONATURAL_PATH)) ? JSON.parse(await readFile(ONATURAL_PATH, 'utf8')) : {}
  const onaturalListings = Object.values(onaturalRaw)

  const consolidated = {}
  for (const product of products) {
    const agro = agromukam[product.slug]?.found ?? []

    const onatural = onaturalListings
      .map((listing) => ({ listing, score: matchScore(product, listing.name) }))
      .filter((s) => s.score > 0.5)
      .sort((a, b) => b.score - a.score)

    if (agro.length === 0 && onatural.length === 0) continue

    consolidated[product.slug] = {
      name_en: product.name_en,
      our_price_bdt: Number(product.our_price_bdt) || null,
      agromukam: agro,
      onaturalbd: onatural.map((s) => s.listing),
    }
  }

  await writeFile(OUT_PATH, JSON.stringify(consolidated, null, 2))
  console.log(`Consolidated ${Object.keys(consolidated).length} products with competitor data → ${path.relative(ROOT, OUT_PATH)}`)

  if (APPLY) {
    const cols = ['slug', 'name_en', 'name_bn', 'category', 'unit', 'our_price_bdt', 'our_sale_price_bdt', 'stock', 'competitor_price_min_bdt', 'competitor_price_max_bdt', 'target_price_bdt', 'notes']
    for (const product of products) {
      const entry = consolidated[product.slug]
      if (!entry) {
        // no longer matched (e.g. a stale/false-positive match was
        // dropped upstream) — clear any previously written competitor data
        product.competitor_price_min_bdt = ''
        product.competitor_price_max_bdt = ''
        product.notes = ''
        continue
      }
      const prices = [
        ...entry.agromukam.map((f) => f.price),
        ...entry.onaturalbd.map((f) => f.price),
      ].filter((p) => typeof p === 'number' && p > 0)
      if (prices.length === 0) continue
      product.competitor_price_min_bdt = String(Math.min(...prices))
      product.competitor_price_max_bdt = String(Math.max(...prices))
      const sources = [
        entry.agromukam[0] && `agromukam: ${entry.agromukam[0].name}`,
        entry.onaturalbd[0] && `onaturalbd: ${entry.onaturalbd[0].name}`,
      ].filter(Boolean)
      product.notes = sources.join(' | ')
    }
    await writeFile(CSV_PATH, toCsv(products, cols))
    console.log('CSV updated with combined competitor prices')
  }
}

main()
