// =============================================================
// Migrate our own products' local images (public/products/<slug>.webp)
// to Cloudinary, so the whole catalog (original + agromukam imports)
// is consistently Cloudinary-hosted and public/products/ can be deleted.
//
//   node --env-file=.env.local scripts/migrate-our-images-cloudinary.mjs
//
// Writes: scripts/.agromukam-cache/our-products-cloudinary-manifest.json
// Updates: products.images in Supabase
// =============================================================

import { readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const ROOT = new URL('..', import.meta.url).pathname
const PRODUCTS_DIR = path.join(ROOT, 'public/products')
const MANIFEST_PATH = path.join(ROOT, 'scripts/.agromukam-cache/our-products-cloudinary-manifest.json')

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET — run with --env-file=.env.local')
  process.exit(1)
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

async function exists(p) {
  return access(p).then(() => true, () => false)
}

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

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: form })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message ?? `upload failed (${res.status})`)
  return json
}

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, slug, images')
    .not('tags', 'cs', '{imported:agromukam}')
  if (error) throw error

  let manifest = {}
  try { manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8')) } catch { /* first run */ }

  let uploaded = 0, skipped = 0, missing = 0
  for (const product of products) {
    if (manifest[product.slug]) { skipped++; continue }
    const filePath = path.join(PRODUCTS_DIR, `${product.slug}.webp`)
    if (!(await exists(filePath))) {
      console.log(`— ${product.slug}: no local file, leaving images as-is`)
      missing++
      continue
    }
    try {
      const result = await uploadFile(filePath, `products/${product.slug}`)
      manifest[product.slug] = { secureUrl: result.secure_url }
      uploaded++
      console.log(`✓ ${product.slug} → ${result.secure_url}`)
    } catch (err) {
      console.log(`✗ ${product.slug}: ${err.message}`)
    }
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  }

  console.log(`\nUploaded ${uploaded}, skipped ${skipped} (cached), ${missing} missing local file`)

  console.log('\nUpdating products.images in Supabase…')
  let updated = 0
  for (const product of products) {
    const entry = manifest[product.slug]
    if (!entry) continue
    const { error: upErr } = await supabase.from('products').update({ images: [entry.secureUrl] }).eq('id', product.id)
    if (upErr) { console.log(`✗ ${product.slug} db update: ${upErr.message}`); continue }
    updated++
  }
  console.log(`Updated ${updated}/${products.length} product rows`)
}

main()
