// =============================================================
// Upload the marketing/decorative media (doodles, corner motif, logo,
// hero video, and the photographic assets used across the marketing
// pages) to Cloudinary, so public/ can drop them — same pattern as
// scripts/migrate-our-images-cloudinary.mjs did for product images.
//
//   node --env-file=.env.local scripts/migrate-marketing-media-cloudinary.mjs
//
// Writes: scripts/.media-cache/marketing-manifest.json (local path -> secure_url)
// Does NOT touch any source files — this script only uploads and reports
// URLs; code references are updated separately.
// =============================================================

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

const ROOT = new URL('..', import.meta.url).pathname
const MANIFEST_PATH = path.join(ROOT, 'scripts/.media-cache/marketing-manifest.json')

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET — run with --env-file=.env.local')
  process.exit(1)
}

// [local public/ path, cloudinary public_id]
const ASSETS = [
  ['doodle.png', 'marketing/doodle'],
  ['doodle-2.png', 'marketing/doodle-2'],
  ['corner-1.png', 'marketing/corner-1'],
  ['logo-transparent.png', 'marketing/logo-transparent'],
  ['logo-solid.png', 'marketing/logo-solid'],
  ['hero-720.mp4', 'marketing/hero-720'],
  ['hero-poster.jpg', 'marketing/hero-poster'],
  ['photos/calf.jpg', 'marketing/photos/calf'],
  ['photos/cow-portrait.jpg', 'marketing/photos/cow-portrait'],
  ['photos/field.jpg', 'marketing/photos/field'],
  ['photos/milking.jpg', 'marketing/photos/milking'],
  ['photos/milk-pour.jpg', 'marketing/photos/milk-pour'],
  ['photos/pasture-panorama.jpg', 'marketing/photos/pasture-panorama'],
  ['photos/scenic/barn.webp', 'marketing/photos/scenic/barn'],
  ['photos/scenic/calves-field.webp', 'marketing/photos/scenic/calves-field'],
  ['photos/scenic/cow-herd.webp', 'marketing/photos/scenic/cow-herd'],
  ['photos/scenic/crop-field.webp', 'marketing/photos/scenic/crop-field'],
  ['photos/scenic/dairy-farm.webp', 'marketing/photos/scenic/dairy-farm'],
  ['photos/scenic/farmer-hands.webp', 'marketing/photos/scenic/farmer-hands'],
  ['photos/scenic/farm-landscape.webp', 'marketing/photos/scenic/farm-landscape'],
  ['photos/scenic/golden-field.webp', 'marketing/photos/scenic/golden-field'],
  ['photos/scenic/haystack.webp', 'marketing/photos/scenic/haystack'],
  ['photos/scenic/milk-splash.webp', 'marketing/photos/scenic/milk-splash'],
  ['photos/scenic/pasture-mist.webp', 'marketing/photos/scenic/pasture-mist'],
  ['photos/scenic/rice-paddy.webp', 'marketing/photos/scenic/rice-paddy'],
  ['photos/scenic/rural-road.webp', 'marketing/photos/scenic/rural-road'],
  ['photos/scenic/tractor.webp', 'marketing/photos/scenic/tractor'],
]

function signParams(params) {
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&')
  return createHash('sha1').update(toSign + CLOUDINARY_API_SECRET).digest('hex')
}

async function uploadFile(filePath, publicId) {
  const timestamp = Math.floor(Date.now() / 1000)
  const params = { public_id: publicId, timestamp }
  const signature = signParams(params)

  const buf = await readFile(filePath)
  const form = new FormData()
  form.append('file', new Blob([buf]), path.basename(filePath))
  form.append('api_key', CLOUDINARY_API_KEY)
  form.append('timestamp', String(timestamp))
  form.append('public_id', publicId)
  form.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, { method: 'POST', body: form })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message ?? `upload failed (${res.status})`)
  return json
}

async function main() {
  await mkdir(path.dirname(MANIFEST_PATH), { recursive: true })

  const manifest = {}
  let ok = 0
  for (const [localRel, publicId] of ASSETS) {
    const filePath = path.join(ROOT, 'public', localRel)
    try {
      const result = await uploadFile(filePath, publicId)
      manifest[`/${localRel}`] = result.secure_url
      ok++
      console.log(`  ✓ ${localRel} -> ${result.secure_url}`)
    } catch (err) {
      console.error(`  ✗ ${localRel}: ${err.message}`)
    }
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log(`\nDone. ${ok}/${ASSETS.length} uploaded. Manifest written to ${MANIFEST_PATH}`)
}

main()
