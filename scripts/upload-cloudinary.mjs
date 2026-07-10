// =============================================================
// Upload scraped competitor images to Cloudinary.
//
//   node --env-file=.env scripts/upload-cloudinary.mjs [--force]
//
// Walks public/competitors/**, signed-uploads each file into
//   competitors/<site>/<slug>/<file>
// using type=authenticated (not publicly listable/guessable — the app
// must request a signed delivery URL) and stores the resulting URLs in
// scripts/.competitor-cache/cloudinary-manifest.json, then patches
// consolidated.json's image arrays to point at Cloudinary instead of
// the local /public paths.
//
// Requires CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY /
// CLOUDINARY_API_SECRET in the environment (see .env).
// =============================================================

import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const COMPETITORS_DIR = path.join(ROOT, 'public/competitors')
const MANIFEST_PATH = path.join(ROOT, 'scripts/.competitor-cache/cloudinary-manifest.json')
const CONSOLIDATED_PATH = path.join(ROOT, 'scripts/.competitor-cache/consolidated.json')

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
const FORCE = process.argv.includes('--force')

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET — run with --env-file=.env')
  process.exit(1)
}

async function exists(p) {
  return access(p).then(() => true, () => false)
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(full)))
    else files.push(full)
  }
  return files
}

function signParams(params) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return createHash('sha1').update(toSign + CLOUDINARY_API_SECRET).digest('hex')
}

async function uploadOne(filePath, publicId) {
  const timestamp = Math.floor(Date.now() / 1000)
  const params = { public_id: publicId, timestamp, type: 'authenticated' }
  const signature = signParams(params)

  const buf = await readFile(filePath)
  const form = new FormData()
  form.append('file', new Blob([buf]), path.basename(filePath))
  form.append('api_key', CLOUDINARY_API_KEY)
  form.append('timestamp', String(timestamp))
  form.append('public_id', publicId)
  form.append('type', 'authenticated')
  form.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message ?? `upload failed (${res.status})`)
  return json
}

async function main() {
  const files = (await exists(COMPETITORS_DIR)) ? await walk(COMPETITORS_DIR) : []
  const manifest = (await exists(MANIFEST_PATH)) ? JSON.parse(await readFile(MANIFEST_PATH, 'utf8')) : {}

  let uploaded = 0, skipped = 0, failed = 0
  for (const file of files) {
    const rel = path.relative(COMPETITORS_DIR, file) // onaturalbd/<slug>/0.webp
    if (!FORCE && manifest[rel]) { skipped++; continue }

    const publicId = `competitors/${rel.replace(/\.[^.]+$/, '')}`
    try {
      const result = await uploadOne(file, publicId)
      manifest[rel] = {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        type: result.type,
      }
      uploaded++
      console.log(`✓ ${rel} → ${result.public_id}`)
    } catch (err) {
      failed++
      console.log(`✗ ${rel}: ${err.message}`)
    }
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  }

  console.log(`\nUploaded ${uploaded}, skipped ${skipped} (cached), failed ${failed}`)

  // patch consolidated.json: swap local /public/competitors/... paths for
  // signed Cloudinary public IDs the app can request delivery URLs for
  if (await exists(CONSOLIDATED_PATH)) {
    const consolidated = JSON.parse(await readFile(CONSOLIDATED_PATH, 'utf8'))
    const localToCloud = new Map(
      Object.entries(manifest).map(([rel, v]) => [`/competitors/${rel}`, v])
    )
    for (const entry of Object.values(consolidated)) {
      for (const list of [entry.agromukam, entry.onaturalbd]) {
        const items = Array.isArray(list) ? list : [list].filter(Boolean)
        for (const item of items) {
          if (!item.images) continue
          item.cloudinaryImages = item.images
            .map((p) => localToCloud.get(p))
            .filter(Boolean)
            .map((v) => ({ publicId: v.publicId, width: v.width, height: v.height }))
        }
      }
    }
    await writeFile(CONSOLIDATED_PATH, JSON.stringify(consolidated, null, 2))
    console.log('Patched consolidated.json with Cloudinary public IDs')
  }
}

main()
