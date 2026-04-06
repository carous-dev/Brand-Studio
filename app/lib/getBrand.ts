/**
 * Client-safe brand loader that pulls configs from the Flask/SQLite API
 * instead of local TypeScript files. Uses env/cookie to resolve the slug
 * and caches the result in-memory for the session.
 */

import type { BrandConfig } from '@/brands/types'
import { fetchBrandBySlug } from './brandApi'

type BrandCache = {
  slug: string
  brand: BrandConfig
  cachedAt: number
}

let cachedBrand: BrandCache | null = null

function getCacheTtlMs() {
  const raw =
    (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_BRAND_CACHE_TTL_MS || process.env.BRAND_CACHE_TTL_MS)) ||
    ''
  if (!raw) return 0
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function resolveBrandSlug(): string {
  // 1) Explicit override via env
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BRAND) {
    return process.env.NEXT_PUBLIC_BRAND.toLowerCase()
  }

  // 2) Client cookie (set by middleware/domain routing)
  if (typeof document !== 'undefined') {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('x-brand='))
      ?.split('=')[1]

    if (cookieValue) {
      return decodeURIComponent(cookieValue).toLowerCase()
    }
  }

  // 3) Sensible fallback for dev
  return 'fairfield'
}

/**
 * Async brand fetcher (works in client and server components)
 * Pulls data from Flask previews API and caches per slug.
 */
export async function getBrand(): Promise<BrandConfig | null> {
  const slug = resolveBrandSlug()

  const ttl = getCacheTtlMs()
  if (ttl > 0 && cachedBrand && cachedBrand.slug === slug && Date.now() - cachedBrand.cachedAt < ttl) {
    return cachedBrand.brand
  }

  const brand = await fetchBrandBySlug(slug)

  if (brand) {
    cachedBrand = { slug, brand, cachedAt: Date.now() }
  }

  return brand
}

/**
 * Return last fetched brand if available (no network).
 * Useful in rare cases where synchronous access is required.
 */
export function getBrandSync(): BrandConfig | null {
  return cachedBrand?.brand || null
}

export function clearBrandCache() {
  cachedBrand = null
}

export default getBrand
