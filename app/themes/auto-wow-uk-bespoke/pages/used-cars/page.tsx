import { apiUrl } from '../../lib/api'
import UsedCarsClient from './UsedCarsClient'
import {
  normalizeInventoryItem,
  type InventoryMeta,
  type InventoryVehicle,
} from '../../lib/inventory'
import { getBrandSlugFromRequest } from '../../lib/brand-slug.server'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const ALLOWED_QUERY_KEYS = [
  'page', 'per_page', 'q', 'make', 'model', 'body', 'fuel',
  'min_price', 'max_price', 'min_year', 'max_year', 'max_mileage', 'sort',
] as const

const NUMERIC_KEYS = new Set([
  'page', 'per_page', 'min_price', 'max_price', 'min_year', 'max_year', 'max_mileage',
])

const DEFAULT_PER_PAGE = '12'
const DEFAULT_SORT = 'price_desc'

type RawSearchParams = Record<string, string | string[] | undefined> | URLSearchParams | undefined
type SearchParamsLike = RawSearchParams | Promise<RawSearchParams>

type UsedCarsRuntimeProps = ThemePageProps & {
  searchParams?: SearchParamsLike
}

async function resolveSearchParams(input: SearchParamsLike): Promise<RawSearchParams> {
  if (input == null) return undefined
  if (typeof (input as any)?.then !== 'function') return input as RawSearchParams
  try {
    return (await (input as Promise<RawSearchParams>)) ?? undefined
  } catch {
    return undefined
  }
}

function readParamValue(source: RawSearchParams, key: string): string | null {
  if (!source) return null
  try {
    if (typeof URLSearchParams !== 'undefined' && source instanceof URLSearchParams) {
      return source.get(key)
    }
    if (typeof source === 'object') {
      const value = (source as Record<string, string | string[] | undefined>)[key]
      if (Array.isArray(value)) return value[0] ?? null
      if (value == null) return null
      return String(value)
    }
  } catch {
    return null
  }
  return null
}

function buildInventoryQuery(source: RawSearchParams, brandSlug: string | null): URLSearchParams {
  const out = new URLSearchParams()
  for (const key of ALLOWED_QUERY_KEYS) {
    const raw = readParamValue(source, key)
    if (raw == null || raw === '') continue
    if (NUMERIC_KEYS.has(key) && !/^\d+$/.test(raw)) continue
    out.set(key, raw)
  }
  if (!out.has('page')) out.set('page', '1')
  out.set('per_page', DEFAULT_PER_PAGE)
  out.set('light', '1')
  if (!out.has('sort')) out.set('sort', DEFAULT_SORT)
  out.set('vehicle_type', 'car')
  out.set('stock_status', 'in_stock')
  if (brandSlug) out.set('brand', brandSlug)
  return out
}

async function fetchInventoryPage(query: URLSearchParams): Promise<{ items: any[]; meta: InventoryMeta | null }> {
  try {
    const url = apiUrl(`/inventory?${query.toString()}`)
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return { items: [], meta: null }
    const payload = await res.json()
    const items = Array.isArray(payload?.items) ? payload.items : []
    const meta: InventoryMeta | null = payload?.meta ?? null
    return { items, meta }
  } catch {
    return { items: [], meta: null }
  }
}

export async function AutoUsedCarsPage({ searchParams }: UsedCarsRuntimeProps) {
  const resolved = await resolveSearchParams(searchParams)
  const brandSlug = await getBrandSlugFromRequest()
  const query = buildInventoryQuery(resolved, brandSlug)
  const { items, meta } = await fetchInventoryPage(query)

  const initialVehicles = items
    .map((item) => normalizeInventoryItem(item))
    .filter((v): v is InventoryVehicle => Boolean(v))

  return (
    <section className={styles.listingWrap}>
      <UsedCarsClient initialVehicles={initialVehicles} initialMeta={meta} />
    </section>
  )
}

export default AutoUsedCarsPage
