import type { BrandConfig } from '@/brands/types'

const API_BASE =
  process.env.FLASK_API_URL ||
  process.env.NEXT_PUBLIC_FLASK_API_URL ||
  'http://localhost:5000/api'

function buildUrl(path: string) {
  const base = API_BASE.replace(/\/$/, '')
  return `${base}${path}`
}

type BrandCacheEntry = {
  value: BrandConfig | null
  expiresAt: number
}

const slugCache = new Map<string, BrandCacheEntry>()
const hostCache = new Map<string, BrandCacheEntry>()
const slugInflight = new Map<string, Promise<BrandConfig | null>>()
const hostInflight = new Map<string, Promise<BrandConfig | null>>()

function getCacheTtlMs() {
  const raw =
    process.env.BRAND_API_CACHE_TTL_MS ||
    process.env.NEXT_PUBLIC_BRAND_API_CACHE_TTL_MS ||
    '2000'
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function getCached(map: Map<string, BrandCacheEntry>, key: string): BrandConfig | null | undefined {
  const ttl = getCacheTtlMs()
  if (ttl <= 0) return undefined
  const entry = map.get(key)
  if (!entry) return undefined
  if (entry.expiresAt <= Date.now()) {
    map.delete(key)
    return undefined
  }
  return entry.value
}

function setCached(map: Map<string, BrandCacheEntry>, key: string, value: BrandConfig | null) {
  const ttl = getCacheTtlMs()
  if (ttl <= 0) return
  map.set(key, { value, expiresAt: Date.now() + ttl })
}

export async function fetchBrandBySlug(slug: string): Promise<BrandConfig | null> {
  if (!slug) return null
  const key = slug.toLowerCase()

  const cached = getCached(slugCache, key)
  if (cached !== undefined) return cached

  const inflight = slugInflight.get(key)
  if (inflight) return inflight

  const req = (async () => {
    const res = await fetch(buildUrl(`/previews/${slug}`), {
      cache: 'no-store',
      next: { revalidate: 0 }
    })

    if (!res.ok) {
      setCached(slugCache, key, null)
      return null
    }

    const data = await res.json()
    const brand = (data?.preview || data?.brand || data) as BrandConfig
    setCached(slugCache, key, brand || null)
    return brand || null
  })().catch((error) => {
    console.error('[brandApi] Failed to fetch brand', slug, error)
    return null
  }).finally(() => {
    slugInflight.delete(key)
  })

  slugInflight.set(key, req)
  return req
}

export async function fetchBrandByHost(host: string): Promise<BrandConfig | null> {
  if (!host) return null
  const key = host.toLowerCase().trim()

  const cached = getCached(hostCache, key)
  if (cached !== undefined) return cached

  const inflight = hostInflight.get(key)
  if (inflight) return inflight

  const req = (async () => {
    const res = await fetch(buildUrl(`/previews/resolve?host=${encodeURIComponent(host)}`), {
      cache: 'no-store',
      next: { revalidate: 0 }
    })

    if (!res.ok) {
      setCached(hostCache, key, null)
      return null
    }

    const data = await res.json()
    const brand = (data?.preview || data?.brand || data) as BrandConfig
    setCached(hostCache, key, brand || null)
    return brand || null
  })().catch((error) => {
    console.error('[brandApi] Failed to resolve brand by host', host, error)
    return null
  }).finally(() => {
    hostInflight.delete(key)
  })

  hostInflight.set(key, req)
  return req
}

export async function fetchAllBrands(): Promise<BrandConfig[]> {
  try {
    const res = await fetch(buildUrl('/previews'), {
      cache: 'no-store',
      next: { revalidate: 0 }
    })

    if (!res.ok) {
      return []
    }

    const data = await res.json()
    const list = (data?.previews || data?.brands || data) as BrandConfig[] | undefined
    return Array.isArray(list) ? list : []
  } catch (error) {
    console.error('[brandApi] Failed to fetch brands list', error)
    return []
  }
}
