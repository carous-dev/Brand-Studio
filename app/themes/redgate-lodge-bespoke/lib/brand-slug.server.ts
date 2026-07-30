import { headers } from 'next/headers'

/**
 * Returns the current brand slug for the active request, or `null` for
 * loopback / unknown hosts. Used by server-component data fetchers to
 * scope `/api/inventory`, `/api/featured-vehicles`, etc. to the
 * brand-specific inventory file uploaded via `/update/<slug>`.
 *
 * Resolution order:
 *  1. `x-brand` header (set by proxy.ts on every brand-domain request)
 *  2. Subdomain of the request host (`carmax.lvh.me` -> `carmax`)
 *  3. `null` if neither yields a sensible slug
 */
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
