/**
 * Server-only brand loader using headers/cookies to pick the slug
 * and fetching config from the Flask/SQLite previews API.
 */

import type { BrandConfig } from '@/brands/types'
import { fetchBrandBySlug } from './brandApi'
import { headers, cookies } from 'next/headers'

type BrandCache = {
  slug: string
  brand: BrandConfig
  cachedAt: number
}

let cachedBrand: BrandCache | null = null

function getCacheTtlMs() {
  const raw = process.env.BRAND_CACHE_TTL_MS
  if (!raw) return 0
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

async function resolveBrandSlugServer(): Promise<string> {
  try {
    const headerBrand = (await headers()).get('x-brand')
    if (headerBrand) return headerBrand.toLowerCase()
  } catch (e) {
    /* ignore */
  }

  try {
    const cookieBrand = (await cookies()).get('x-brand')?.value
    if (cookieBrand) return cookieBrand.toLowerCase()
  } catch (e) {
    /* ignore */
  }

  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BRAND) {
    return process.env.NEXT_PUBLIC_BRAND.toLowerCase()
  }

  return 'fairfield'
}

export async function getBrandAsync(): Promise<BrandConfig | null> {
  const slug = await resolveBrandSlugServer()

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

export function getBrandFromEnv(): string {
  const envBrand = process.env.NEXT_PUBLIC_BRAND as string | undefined
  return (envBrand || 'fairfield').toLowerCase()
}
