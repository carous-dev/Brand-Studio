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

/**
 * Overlay a Carous dealer's LIVE DMS branding (Appearance page) onto a preview's
 * base config — so a demo dealer's logo + colours + name follow whatever they set
 * in the DMS, without re-authoring in the studio. Only runs for Carous-bound
 * previews (`carousClientId`). Fail-soft: any miss returns the base brand.
 */
export async function applyCarousBranding(brand: BrandConfig): Promise<BrandConfig> {
  const id = String(brand.carousClientId || '').trim()
  if (!id) return brand
  const base = (process.env.CAROUS_API_BASE || 'https://api.carous.co.uk/v1').replace(/\/$/, '')
  try {
    const res = await fetch(`${base}/dealer-theme?dealer=${encodeURIComponent(id)}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return brand
    const t = await res.json()
    if (!t || typeof t !== 'object') return brand
    const next: BrandConfig = { ...brand, theme: { ...brand.theme, colors: { ...brand.theme.colors } } }
    if (typeof t.name === 'string' && t.name) next.name = t.name
    if (typeof t.logo === 'string' && t.logo) next.logo = t.logo
    if (t.colors && typeof t.colors === 'object') {
      if (t.colors.brand) next.theme.colors.primaryColor = t.colors.brand
      if (t.colors.accent) next.theme.colors.accentColor = t.colors.accent
    }
    return next
  } catch {
    return brand
  }
}

export async function getBrandAsync(): Promise<BrandConfig | null> {
  const slug = await resolveBrandSlugServer()

  const ttl = getCacheTtlMs()
  if (ttl > 0 && cachedBrand && cachedBrand.slug === slug && Date.now() - cachedBrand.cachedAt < ttl) {
    return cachedBrand.brand
  }

  const raw = await fetchBrandBySlug(slug)
  // Carous-bound previews (demo accounts) get their branding live from the DMS.
  const brand = raw?.carousClientId ? await applyCarousBranding(raw) : raw

  if (brand) {
    cachedBrand = { slug, brand, cachedAt: Date.now() }
  }

  return brand
}

export function getBrandFromEnv(): string {
  const envBrand = process.env.NEXT_PUBLIC_BRAND as string | undefined
  return (envBrand || 'fairfield').toLowerCase()
}
