// =============================================================
// Alam Dairy — automated product & scenic image pipeline
//
//   node --env-file=.env scripts/fetch-images.mjs products [--apply] [--force] [--limit N]
//   node --env-file=.env scripts/fetch-images.mjs scenic  [--force]
//
// Sources:  Pexels API (PEXELS_API_KEY) with Openverse as a keyless
//           fallback. Both provide freely-licensed photography.
// Validate: minimum resolution, real-image decode via sharp, alt-text
//           keyword match against the product, sha256 + photo-id dedupe.
// Optimize: WebP at 1200/800/400 px plus a 200 px thumbnail.
// Cache:    raw downloads and search responses under scripts/.image-cache
//           so re-runs never refetch; processed slugs are skipped.
// Apply:    --apply writes ["/products/<slug>.webp"] into products.images.
// Manifest: public/products/manifest.json records source + attribution.
// =============================================================

import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = new URL('..', import.meta.url).pathname
const CACHE_DIR = path.join(ROOT, 'scripts/.image-cache')
const PRODUCTS_DIR = path.join(ROOT, 'public/products')
const SCENIC_DIR = path.join(ROOT, 'public/photos/scenic')
const PEXELS_KEY = process.env.PEXELS_API_KEY

const args = process.argv.slice(2)
const mode = args[0] ?? 'products'
const APPLY = args.includes('--apply')
const FORCE = args.includes('--force')
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity

// ── hand-picked photos for items stock search matches poorly ──
// Value is a Pexels photo id, or a direct URL + attribution.
const MANUAL_OVERRIDES = {
  'milking-machine-single': { pexels: 11816342 },
  'milking-machine-double': { pexels: 7931829 },
  'fmd-vaccine': { pexels: 5922099 },
  'brucellosis-vaccine': { pexels: 5922104 },
  'oxytet-injection': { pexels: 5921723 },
  'vit-ade-injection': { pexels: 38198207 },
  'cattle-feed-50kg': { pexels: 31111063 },
  'tmr-feed-50kg': { pexels: 31111067 },
  'dairy-concentrate-25kg': { pexels: 6978373 },
  'pure-ghee-500g': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Desi_ghee.JPG',
    id: 'wikimedia-desi-ghee',
    credit: 'Wikimedia Commons',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Desi_ghee.JPG',
    source: 'wikimedia',
  },
  'pure-ghee-250g': {
    url: 'https://live.staticflickr.com/4154/5413981531_6df0c52150_b.jpg',
    id: 'flickr-5413981531',
    credit: 'Flickr (via Openverse, commercial license)',
    creditUrl: 'https://www.flickr.com/photos/tags/ghee',
    source: 'flickr',
  },
}

// ── search query + validation keywords per product ───────────
// Matched top-down against the slug; first hit wins.
const PRODUCT_QUERIES = [
  // slug-specific overrides (checked first — keep above the generic rules)
  [/^milking-machine/, 'cow milking parlor equipment', ['milking', 'parlor', 'cow', 'dairy', 'farm', 'equipment']],
  [/^butter-churn/, 'traditional butter churn wooden', ['churn', 'butter', 'wooden', 'traditional', 'pot']],
  [/^(cattle-feed|tmr-feed|dairy-concentrate|calf-starter)/, 'animal feed grain pellets', ['feed', 'pellet', 'grain', 'corn', 'seed', 'animal']],
  [/^bypass-fat/, 'grain sack burlap farm', ['grain', 'sack', 'burlap', 'seed', 'flour', 'powder']],
  [/^(fmd|brucellosis)-vaccine|oxytet|vit-ade/, 'vaccine vial syringe medicine', ['vaccine', 'vial', 'syringe', 'ampoule', 'injection', 'medicine']],
  [/^teat-dip-5l/, 'plastic canister chemical container', ['canister', 'container', 'plastic', 'jerry', 'bottle', 'chemical']],
  [/^(lactometer|fat-tester)/, 'milk laboratory testing tubes', ['milk', 'laboratory', 'lab', 'test', 'tube', 'glass', 'science']],
  [/^pure-ghee/, 'ghee clarified butter bowl', ['ghee', 'butter', 'clarified', 'oil', 'bowl']],
  [/^lassi-salty/, 'buttermilk chaas glass drink', ['buttermilk', 'lassi', 'chaas', 'milk', 'drink', 'glass', 'smoothie']],
  // dairy
  [/mishti-doi|plain-yogurt/, 'yogurt curd bowl', ['yogurt', 'curd', 'dahi', 'doi', 'dairy']],
  [/ghee/, 'ghee jar clarified butter', ['ghee', 'butter', 'jar', 'oil']],
  [/butter-milk/, 'buttermilk glass drink', ['buttermilk', 'milk', 'drink', 'glass', 'lassi']],
  [/butter-\d/, 'butter block wooden board', ['butter', 'dairy', 'margarine']],
  [/paneer|chhana/, 'paneer cottage cheese cubes', ['paneer', 'cheese', 'tofu', 'cottage']],
  [/mozzarella/, 'mozzarella cheese fresh', ['mozzarella', 'cheese']],
  [/sour-cream/, 'sour cream bowl', ['cream', 'yogurt', 'bowl', 'dairy']],
  [/cream/, 'fresh cream milk jug', ['cream', 'milk', 'dairy', 'jug']],
  [/lassi/, 'lassi yogurt drink glass', ['lassi', 'yogurt', 'smoothie', 'drink', 'milkshake']],
  [/kefir/, 'kefir milk drink bottle', ['kefir', 'milk', 'yogurt', 'drink', 'bottle']],
  [/milk-powder/, 'milk powder spoon', ['powder', 'milk', 'flour', 'spoon']],
  [/condensed-milk/, 'condensed milk can spoon', ['condensed', 'milk', 'cream', 'caramel']],
  [/whey-protein/, 'protein powder scoop fitness', ['protein', 'powder', 'scoop', 'supplement']],
  [/khoya/, 'milk fudge dessert traditional', ['khoya', 'mawa', 'dessert', 'sweet', 'fudge', 'milk']],
  [/colostrum/, 'fresh milk glass bottle farm', ['milk', 'bottle', 'glass', 'dairy']],
  [/buffalo-milk/, 'milk glass bottle rustic', ['milk', 'dairy', 'bottle', 'glass']],
  [/milk/, 'fresh milk bottle glass', ['milk', 'dairy', 'bottle', 'glass', 'pour']],
  // cattle
  [/holstein/, 'holstein friesian cow', ['holstein', 'cow', 'cattle', 'dairy']],
  [/sahiwal|local-breed/, 'brown cow portrait farm', ['cow', 'cattle', 'bull', 'livestock']],
  [/jersey-cow/, 'jersey cow pasture', ['cow', 'cattle', 'jersey', 'livestock']],
  [/buffalo/, 'water buffalo farm', ['buffalo', 'cattle', 'livestock']],
  [/calf/, 'calf young cow farm', ['calf', 'cow', 'cattle', 'baby']],
  [/heifer/, 'young cow heifer pasture', ['cow', 'heifer', 'cattle', 'calf', 'livestock']],
  [/bull/, 'bull cattle farm', ['bull', 'cattle', 'cow', 'ox', 'livestock']],
  // feed
  [/straw/, 'rice straw bale field', ['straw', 'hay', 'bale', 'harvest']],
  [/hay-bale/, 'hay bales field', ['hay', 'bale', 'straw', 'field']],
  [/silage/, 'corn maize harvest silage', ['silage', 'corn', 'maize', 'harvest', 'fodder']],
  [/bran/, 'wheat bran grain bowl', ['bran', 'wheat', 'grain', 'cereal', 'flour']],
  [/soybean/, 'soybeans sack grain', ['soybean', 'soy', 'bean', 'grain', 'legume']],
  [/molasses/, 'molasses dark syrup jar', ['molasses', 'syrup', 'honey', 'jar']],
  [/grass/, 'fresh green fodder grass', ['grass', 'fodder', 'green', 'field']],
  [/salt-block|urea-block|mineral-mix/, 'salt block mineral lick', ['salt', 'mineral', 'block', 'stone']],
  [/fish-meal/, 'fish meal dried', ['fish', 'dried', 'meal', 'powder']],
  [/sunflower/, 'sunflower seeds meal', ['sunflower', 'seed', 'meal', 'grain']],
  [/palm-kernel/, 'palm kernel seeds', ['palm', 'kernel', 'seed', 'nut']],
  [/bagasse/, 'sugarcane harvest stalks', ['sugarcane', 'sugar', 'cane', 'bagasse', 'stalk']],
  [/cotton-cake/, 'cottonseed cotton harvest', ['cotton', 'seed', 'cake']],
  [/feed|tmr/, 'cattle feed grain pellets sack', ['feed', 'grain', 'pellet', 'seed', 'sack', 'corn']],
  // equipment
  [/milking-machine/, 'milking machine dairy parlor', ['milking', 'machine', 'dairy', 'parlor', 'equipment']],
  [/milk-tank/, 'stainless steel milk tank dairy', ['tank', 'stainless', 'steel', 'dairy', 'industrial']],
  [/milk-can/, 'milk churn can metal', ['churn', 'can', 'milk', 'metal', 'container']],
  [/lactometer|fat-tester/, 'laboratory glassware measuring', ['laboratory', 'lab', 'glass', 'test', 'measuring', 'science']],
  [/pasteurizer|separator|churn|incubator/, 'dairy processing equipment stainless steel', ['dairy', 'equipment', 'machine', 'stainless', 'industrial', 'factory']],
  [/trough/, 'cattle feeding trough farm', ['trough', 'feeding', 'cattle', 'farm', 'cow']],
  [/ear-tag/, 'cow ear tag livestock', ['ear', 'tag', 'cow', 'cattle', 'livestock']],
  [/scale/, 'industrial weighing scale', ['scale', 'weighing', 'weight', 'industrial']],
  [/drenching|teat-dip-cup/, 'veterinary farm tool', ['veterinary', 'vet', 'tool', 'farm', 'equipment']],
  [/bucket/, 'stainless steel bucket milk', ['bucket', 'pail', 'steel', 'milk', 'metal']],
  [/barn-cleaner/, 'barn cleaning farm tools', ['barn', 'clean', 'broom', 'farm', 'tool']],
  // vet supplies
  [/vaccine|injection/, 'veterinary vaccine vial syringe', ['vaccine', 'syringe', 'vial', 'injection', 'medical', 'medicine']],
  [/test-kit/, 'medical test kit laboratory', ['test', 'kit', 'medical', 'laboratory', 'diagnostic']],
  [/spray/, 'spray bottle', ['spray', 'bottle']],
  [/dewormer|bolus|ors/, 'medicine tablets pills', ['medicine', 'pill', 'tablet', 'capsule', 'pharmaceutical']],
  [/tonic|calcium-liquid/, 'medicine bottle liquid', ['medicine', 'bottle', 'liquid', 'syrup', 'pharmaceutical']],
  [/udder-cream/, 'ointment cream tube', ['cream', 'ointment', 'tube', 'lotion']],
  [/mineral-block/, 'salt mineral block', ['salt', 'mineral', 'block', 'stone']],
]

// ── scenic backdrops for heroes / parallax sections ──────────
const SCENIC_SHOTS = [
  ['crop-field', 'green wheat crop field wide landscape', 'landscape'],
  ['cow-herd', 'cow herd grazing pasture wide', 'landscape'],
  ['barn', 'red barn farm countryside', 'landscape'],
  ['farm-landscape', 'farm landscape rolling hills sunrise', 'landscape'],
  ['tractor', 'tractor working green field', 'landscape'],
  ['rural-road', 'rural countryside road trees', 'landscape'],
  ['dairy-farm', 'dairy farm cows barn interior', 'landscape'],
  ['golden-field', 'golden wheat field sunset', 'landscape'],
  ['pasture-mist', 'misty morning pasture cows', 'landscape'],
  ['farmer-hands', 'farmer hands soil plant', 'landscape'],
  ['milk-splash', 'milk splash pour white', 'landscape'],
  ['calves-field', 'calves cows green meadow', 'landscape'],
  ['rice-paddy', 'rice paddy field green bangladesh', 'landscape'],
  ['haystack', 'haystack field golden hour', 'landscape'],
]

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')
const slugHash = (s) => createHash('md5').update(s).digest('hex').slice(0, 12)

async function exists(p) {
  return access(p).then(() => true, () => false)
}

async function cachedJson(key, fetcher) {
  const file = path.join(CACHE_DIR, 'search', `${slugHash(key)}.json`)
  if (!FORCE && (await exists(file))) return JSON.parse(await readFile(file, 'utf8'))
  const data = await fetcher()
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(data))
  return data
}

async function searchPexels(query, orientation = 'square') {
  return cachedJson(`pexels:${query}:${orientation}`, async () => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=${orientation}`
    const res = await fetch(url, { headers: { Authorization: PEXELS_KEY } })
    if (!res.ok) throw new Error(`Pexels ${res.status} for "${query}"`)
    const json = await res.json()
    return (json.photos ?? []).map((p) => ({
      id: `pexels-${p.id}`,
      url: p.src.large2x ?? p.src.original,
      width: p.width,
      height: p.height,
      alt: p.alt ?? '',
      credit: p.photographer,
      creditUrl: p.url,
      source: 'pexels',
    }))
  })
}

async function searchOpenverse(query) {
  return cachedJson(`openverse:${query}`, async () => {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&page_size=15`
    const res = await fetch(url, { headers: { 'User-Agent': 'alam-dairy-image-pipeline/1.0' } })
    if (!res.ok) return []
    const json = await res.json()
    return (json.results ?? []).map((p) => ({
      id: `openverse-${p.id}`,
      url: p.url,
      width: p.width ?? 0,
      height: p.height ?? 0,
      alt: p.title ?? '',
      credit: p.creator ?? 'Unknown',
      creditUrl: p.foreign_landing_url ?? p.url,
      source: 'openverse',
    }))
  })
}

async function download(candidate) {
  const file = path.join(CACHE_DIR, 'raw', candidate.id.replace(/[^a-z0-9-]/gi, '_'))
  if (await exists(file)) return readFile(file)
  const res = await fetch(candidate.url, { headers: { 'User-Agent': 'alam-dairy-image-pipeline/1.0' } })
  if (!res.ok) throw new Error(`download ${res.status}`)
  const type = res.headers.get('content-type') ?? ''
  if (!type.startsWith('image/')) throw new Error(`not an image: ${type}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, buf)
  return buf
}

const usedIds = new Set()
const usedHashes = new Set()

// Pick the best not-yet-used candidate: decodes as a real image, is big
// enough, and (ideally) matches the product's keywords in its alt text.
async function pickCandidate(candidates, keywords, minW = 700) {
  const scored = candidates
    .filter((c) => !usedIds.has(c.id) && c.width >= minW)
    .map((c) => {
      const alt = c.alt.toLowerCase()
      const score = keywords.reduce((n, k) => n + (alt.includes(k) ? 1 : 0), 0)
      return { c, score }
    })
    .sort((a, b) => b.score - a.score)

  for (const { c, score } of scored) {
    try {
      const buf = await download(c)
      const hash = sha256(buf)
      if (usedHashes.has(hash)) continue
      const meta = await sharp(buf).metadata()
      if (!meta.width || meta.width < minW || meta.height < 500) continue
      usedIds.add(c.id)
      usedHashes.add(hash)
      return { candidate: c, buf, verified: score > 0 }
    } catch {
      continue
    }
  }
  return null
}

async function writeVariants(buf, dir, base, sizes, aspect) {
  const files = {}
  for (const [suffix, width, quality] of sizes) {
    const name = suffix ? `${base}-${suffix}.webp` : `${base}.webp`
    const out = path.join(dir, name)
    let img = sharp(buf).rotate()
    if (aspect === 'square') {
      img = img.resize(width, width, { fit: 'cover', position: 'attention' })
    } else {
      img = img.resize({ width, withoutEnlargement: true })
    }
    await img.webp({ quality }).toFile(out)
    files[suffix || 'main'] = `/${path.relative(path.join(ROOT, 'public'), out)}`
  }
  return files
}

async function runProducts() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data: products, error } = await supabase
    .from('products')
    .select('id,slug,name_en,type,tags,images')
    .order('type')
  if (error) throw error

  await mkdir(PRODUCTS_DIR, { recursive: true })
  const manifestPath = path.join(PRODUCTS_DIR, 'manifest.json')
  const manifest = (await exists(manifestPath)) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {}
  for (const entry of Object.values(manifest)) usedIds.add(entry.sourceId)

  let done = 0, skipped = 0, failed = []
  for (const product of products) {
    if (done >= LIMIT) break
    if (!FORCE && manifest[product.slug]) { skipped++; continue }

    const rule = PRODUCT_QUERIES.find(([re]) => re.test(product.slug))
    const [, query, keywords] = rule ?? [null, `${product.type} ${product.name_en}`, product.tags]

    let picked = null
    const override = MANUAL_OVERRIDES[product.slug]
    if (override) {
      const candidate = override.pexels
        ? await cachedJson(`pexels-photo:${override.pexels}`, async () => {
            const res = await fetch(`https://api.pexels.com/v1/photos/${override.pexels}`, {
              headers: { Authorization: PEXELS_KEY },
            })
            if (!res.ok) throw new Error(`Pexels photo ${override.pexels}: ${res.status}`)
            const p = await res.json()
            return {
              id: `pexels-${p.id}`,
              url: p.src.large2x ?? p.src.original,
              width: p.width,
              height: p.height,
              alt: p.alt ?? '',
              credit: p.photographer,
              creditUrl: p.url,
              source: 'pexels',
            }
          })
        : { width: 9999, height: 9999, alt: '', ...override }
      picked = await pickCandidate([candidate], keywords, 600)
      picked = picked && { ...picked, verified: true }
    }

    if (!picked) {
      let candidates = await searchPexels(query)
      picked = await pickCandidate(candidates, keywords)
      if (!picked) {
        candidates = await searchOpenverse(query)
        picked = await pickCandidate(candidates, keywords, 600)
      }
    }
    if (!picked) { failed.push(product.slug); continue }

    const files = await writeVariants(picked.buf, PRODUCTS_DIR, product.slug, [
      ['', 1200, 78],
      ['800', 800, 78],
      ['400', 400, 75],
      ['thumb', 200, 70],
    ], 'square')

    manifest[product.slug] = {
      files,
      sourceId: picked.candidate.id,
      source: picked.candidate.source,
      credit: picked.candidate.credit,
      creditUrl: picked.candidate.creditUrl,
      verified: picked.verified,
      query,
    }
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    done++
    console.log(`✓ ${product.slug}  (${picked.candidate.id}${picked.verified ? '' : ', unverified'})`)
  }

  if (APPLY) {
    let applied = 0
    for (const product of products) {
      const entry = manifest[product.slug]
      if (!entry) continue
      const images = [entry.files.main]
      const { error: upErr } = await supabase.from('products').update({ images }).eq('id', product.id)
      if (upErr) console.error(`✗ db update ${product.slug}: ${upErr.message}`)
      else applied++
    }
    console.log(`\nDB: set images for ${applied} products`)
  }

  console.log(`\nProcessed ${done}, cached ${skipped}, failed: ${failed.length ? failed.join(', ') : 'none'}`)
}

async function runScenic() {
  await mkdir(SCENIC_DIR, { recursive: true })
  const manifestPath = path.join(SCENIC_DIR, 'manifest.json')
  const manifest = (await exists(manifestPath)) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {}
  for (const entry of Object.values(manifest)) usedIds.add(entry.sourceId)

  for (const [name, query] of SCENIC_SHOTS) {
    if (!FORCE && manifest[name]) continue
    const candidates = await searchPexels(query, 'landscape')
    const picked = await pickCandidate(candidates, query.split(' '), 1600)
    if (!picked) { console.log(`✗ ${name}: no candidate`); continue }
    const files = await writeVariants(picked.buf, SCENIC_DIR, name, [
      ['', 1920, 72],
      ['960', 960, 72],
    ], 'landscape')
    manifest[name] = {
      files,
      sourceId: picked.candidate.id,
      source: picked.candidate.source,
      credit: picked.candidate.credit,
      creditUrl: picked.candidate.creditUrl,
      query,
    }
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    console.log(`✓ ${name}  (${picked.candidate.id})`)
  }
}

if (!PEXELS_KEY) {
  console.error('PEXELS_API_KEY missing from environment')
  process.exit(1)
}
if (mode === 'products') await runProducts()
else if (mode === 'scenic') await runScenic()
else {
  console.error(`unknown mode "${mode}" — use "products" or "scenic"`)
  process.exit(1)
}
