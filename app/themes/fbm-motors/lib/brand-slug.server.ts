import { headers } from 'next/headers'

export async function getBrandSlugFromRequest(): Promise<string | null> {
  const h = await headers()
  const xBrand = h.get('x-brand')
  if (xBrand) {
    const trimmed = xBrand.toLowerCase().trim()
    if (trimmed) return trimmed
  }

  const host =
    h.get('x-forwarded-host') ||
    h.get('x-original-host') ||
    h.get('host') ||
    ''
  const cleaned = host.toLowerCase().trim().split(':')[0]
  if (!cleaned) return null

  const stripped = cleaned.startsWith('www.') ? cleaned.slice(4) : cleaned
  const first = stripped.split('.')[0]
  if (!first) return null
  if (first === 'localhost' || first === '127' || first === '::1') return null
  return first
}
