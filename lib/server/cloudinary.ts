import 'server-only'
import { createHash } from 'node:crypto'

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env

function signParams(params: Record<string, string | number>) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return createHash('sha1').update(toSign + CLOUDINARY_API_SECRET).digest('hex')
}

export async function uploadToCloudinary(file: Blob, filename: string, folder = 'products') {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary env vars are not configured')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const params = { folder, timestamp }
  const signature = signParams(params)

  const form = new FormData()
  form.append('file', file, filename)
  form.append('api_key', CLOUDINARY_API_KEY)
  form.append('timestamp', String(timestamp))
  form.append('folder', folder)
  form.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message ?? `Cloudinary upload failed (${res.status})`)
  return json as { secure_url: string; public_id: string }
}
