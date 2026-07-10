// =============================================================
// Competitor research — pull dairy/egg listings from onaturalbd.com
//
//   node scripts/scrape-onaturalbd.mjs [--limit N]
//
// onaturalbd.com is a WooCommerce storefront with a real consumer dairy
// range (unlike agromukam.com, which is a B2B farm-supply marketplace).
// Each product page embeds full JSON-LD (name, price, sale price, image,
// sku, description) — no API key needed, just parse the <script
// type="application/ld+json"> block.
//
// Output:
//   scripts/.competitor-cache/onaturalbd.json   — raw scraped listings
//   public/competitors/onaturalbd/<slug>/*      — downloaded images
// =============================================================

import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const CACHE_DIR = path.join(ROOT, 'scripts/.competitor-cache')
const IMAGES_DIR = path.join(ROOT, 'public/competitors/onaturalbd')
const OUT_PATH = path.join(CACHE_DIR, 'onaturalbd.json')

const CATEGORY_URL = 'https://onaturalbd.com/product-category/dairy-eggs/'
const UA = 'Mozilla/5.0 (compatible; alam-dairy-research/1.0)'

const args = process.argv.slice(2)
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity

async function exists(p) {
  return access(p).then(() => true, () => false)
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} for ${url}`)
  return res.text()
}

function extractProductJsonLd(html) {
  const scriptRe = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  let match
  while ((match = scriptRe.exec(html))) {
    try {
      const json = JSON.parse(match[1])
      const graph = Array.isArray(json['@graph']) ? json['@graph'] : [json]
      const product = graph.find((n) => n['@type'] === 'Product')
      if (product) return product
    } catch {
      // not valid JSON / not the block we want
    }
  }
  return null
}

function extractGalleryImages(html) {
  const urls = new Set()
  const re = /https:\/\/onaturalbd\.com\/wp-content\/uploads\/[^"'\s)]+\.(?:webp|jpg|jpeg|png)/gi
  let m
  while ((m = re.exec(html))) {
    if (!/-\d+x\d+\./.test(m[0])) urls.add(m[0]) // skip thumbnail-sized variants
  }
  return [...urls].slice(0, 5)
}

async function downloadImage(url, dest) {
  if (await exists(dest)) return true
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return false
  const buf = Buffer.from(await res.arrayBuffer())
  await mkdir(path.dirname(dest), { recursive: true })
  await writeFile(dest, buf)
  return true
}

function slugify(url) {
  return decodeURIComponent(url.replace(/^https?:\/\/onaturalbd\.com\/product\//, '').replace(/\/$/, ''))
}

async function main() {
  await mkdir(CACHE_DIR, { recursive: true })
  const listing = await fetchHtml(CATEGORY_URL)
  const productUrls = [...new Set(
    [...listing.matchAll(/href="(https:\/\/onaturalbd\.com\/product\/[^"]+)"/g)].map((m) => m[1])
  )]

  const data = (await exists(OUT_PATH)) ? JSON.parse(await readFile(OUT_PATH, 'utf8')) : {}

  let done = 0
  for (const url of productUrls) {
    if (done >= LIMIT) break
    const slug = slugify(url)
    if (data[slug]) { done++; continue }

    let html
    try {
      html = await fetchHtml(url)
    } catch (err) {
      console.log(`✗ ${slug}: ${err.message}`)
      continue
    }

    const product = extractProductJsonLd(html)
    if (!product) { console.log(`✗ ${slug}: no JSON-LD product block`); continue }

    const offers = Array.isArray(product.offers) ? product.offers : [product.offers].filter(Boolean)
    const price = offers[0]?.price ? Number(offers[0].price) : null
    const listPrice = offers[0]?.priceSpecification?.find((p) => p.priceType?.includes('ListPrice'))?.price
    const galleryUrls = extractGalleryImages(html)
    const imageUrls = [product.image, ...galleryUrls].filter(Boolean)
    const uniqueImageUrls = [...new Set(imageUrls)].slice(0, 4)

    const images = []
    for (const [i, imgUrl] of uniqueImageUrls.entries()) {
      const ext = path.extname(new URL(imgUrl).pathname) || '.webp'
      const dest = path.join(IMAGES_DIR, slug, `${i}${ext}`)
      const ok = await downloadImage(imgUrl, dest)
      if (ok) images.push(`/${path.relative(path.join(ROOT, 'public'), dest)}`)
    }

    data[slug] = {
      url,
      name: product.name,
      sku: product.sku,
      description: product.description,
      price,
      listPrice: listPrice ? Number(listPrice) : null,
      images,
    }
    await writeFile(OUT_PATH, JSON.stringify(data, null, 2))
    console.log(`✓ ${slug}: ${product.name} — ${price} BDT${listPrice ? ` (list ${listPrice})` : ''}`)
    done++
  }

  console.log(`\nDone. ${Object.keys(data).length} onaturalbd listings cached.`)
}

main()
