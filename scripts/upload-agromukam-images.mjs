// =============================================================
// Upload the 500 selected agromukam product images to Cloudinary using
// remote-fetch upload (Cloudinary downloads directly from the agromukam
// CDN url server-side) — no local download/re-upload round trip, which
// is what made the earlier per-file download+upload pipeline slow.
//
//   node --env-file=.env scripts/upload-agromukam-images.mjs
//
// Reads:  scripts/.agromukam-cache/import-500.json
// Writes: scripts/.agromukam-cache/cloudinary-manifest-500.json
//         scripts/.agromukam-cache/import-500.json (adds cloudinary_url)
// =============================================================

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

const ROOT = new URL('..', import.meta.url).pathname
const IMPORT_PATH = path.join(ROOT, 'scripts/.agromukam-cache/import-500.json')
const MANIFEST_PATH = path.join(ROOT, 'scripts/.agromukam-cache/cloudinary-manifest-500.json')

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET — run with --env-file=.env')
  process.exit(1)
}

const CONCURRENCY = 10

function signParams(params) {
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&')
  return createHash('sha1').update(toSign + CLOUDINARY_API_SECRET).digest('hex')
}

async function uploadFromUrl(remoteUrl, publicId) {
  const timestamp = Math.floor(Date.now() / 1000)
  const params = { public_id: publicId, timestamp }
  const signature = signParams(params)

  const form = new FormData()
  form.append('file', remoteUrl) // Cloudinary fetches this URL server-side
  form.append('api_key', CLOUDINARY_API_KEY)
  form.append('timestamp', String(timestamp))
  form.append('public_id', publicId)
  form.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message ?? `upload failed (${res.status})`)
  return json
}

async function worker(queue, manifest, stats) {
  while (queue.length) {
    const row = queue.shift()
    if (!row) continue
    if (manifest[row.slug]) { stats.skipped++; continue }
    if (!row.image_url) { stats.failed++; continue }
    try {
      const result = await uploadFromUrl(row.image_url, `products/${row.slug}`)
      manifest[row.slug] = { secureUrl: result.secure_url, width: result.width, height: result.height }
      stats.uploaded++
      console.log(`✓ ${row.slug} → ${result.secure_url}`)
    } catch (err) {
      stats.failed++
      console.log(`✗ ${row.slug}: ${err.message}`)
    }
  }
}

async function main() {
  const rows = JSON.parse(await readFile(IMPORT_PATH, 'utf8'))
  let manifest = {}
  try {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  } catch {
    // no manifest yet
  }

  const queue = [...rows]
  const stats = { uploaded: 0, skipped: 0, failed: 0 }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue, manifest, stats)))

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2))

  for (const row of rows) {
    if (manifest[row.slug]) row.cloudinary_url = manifest[row.slug].secureUrl
  }
  await writeFile(IMPORT_PATH, JSON.stringify(rows, null, 2))

  console.log(`\nUploaded ${stats.uploaded}, skipped ${stats.skipped} (cached), failed ${stats.failed}`)
}

main()
