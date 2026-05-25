/**
 * Server wrapper for the used-cars inventory list (axis-autos-bespoke).
 *
 * Data-layer-only file (kept verbatim per SKILL pitfall #30): the JSX + CSS
 * redesign lives in UsedCarsClient + page.module.css. This wrapper does the
 * per-brand server fetch, normalises inventory, and hands off to the client
 * island. Helpers are extracted so responsibilities read clearly.
 */

import UsedCarsClient from './UsedCarsClient'
import { apiUrl } from '../../lib/api'
import { normalizeInventoryItem, type InventoryMeta, type InventoryVehicle } from '../../lib/inventory'
import { getBrandSlugFromRequest } from '../../lib/brand-slug.server'
import type { ThemePageProps } from '../../../types'

type SearchParamsLike = Record<string, any> | URLSearchParams | undefined

type FetchedInventory = {
  vehicles: InventoryVehicle[]
  meta: InventoryMeta | null
}

const ALLOWED_PARAMS = [
  'page', 'per_page', 'q', 'make', 'model', 'body', 'fuel',
  'min_price', 'max_price', 'min_year', 'max_year', 'max_mileage', 'sort',
] as const

const NUMERIC_PARAMS = new Set<typeof ALLOWED_PARAMS[number]>([
  'page', 'per_page', 'min_price', 'max_price', 'min_year', 'max_year', 'max_mileage',
])

const DEFAULT_PER_PAGE = '12'
const DEFAULT_SORT = 'price_desc'

async function resolveSearchParams(input: SearchParamsLike | Promise<SearchParamsLike>): Promise<SearchParamsLike> {
  if (input && typeof (input as any).then === 'function') {
    try { return await (input as Promise<SearchParamsLike>) } catch { return undefined }
  }
  return input as SearchParamsLike
}

function readSearchParam(source: SearchParamsLike, key: string): string | null {
  if (!source) return null
  try {
    if (typeof URLSearchParams !== 'undefined' && source instanceof URLSearchParams) {
      return source.get(key)
    }
    if (typeof source === 'object') {
      const usp = new URLSearchParams(source as Record<string, string>)
      return usp.get(key)
    }
  } catch { return null }
  return null
}

function buildInventoryQuery(source: SearchParamsLike, brand: string | null): URLSearchParams {
  const params = new URLSearchParams()

  for (const key of ALLOWED_PARAMS) {
    const raw = readSearchParam(source, key)
    if (raw == null) continue
    const value = Array.isArray(raw) ? (raw[0] as string) : String(raw)
    if (!value) continue
    if (NUMERIC_PARAMS.has(key) && !/^\d+$/.test(value)) continue
    params.set(key, value)
  }

  if (!params.has('page')) params.set('page', '1')
  params.set('per_page', DEFAULT_PER_PAGE)
  params.set('light', '1')
  if (!params.has('sort')) params.set('sort', DEFAULT_SORT)
  params.set('vehicle_type', 'car')
  params.set('stock_status', 'in_stock')
  if (brand) params.set('brand', brand)

  return params
}

async function fetchInventory(query: URLSearchParams): Promise<FetchedInventory> {
  try {
    const response = await fetch(apiUrl(`/inventory?${query.toString()}`), { cache: 'no-store' })
    if (!response.ok) return { vehicles: [], meta: null }
    const payload = await response.json()
    const rawItems = Array.isArray(payload?.items) ? payload.items : []
    const normalised = rawItems
      .map((item: any) => normalizeInventoryItem(item))
      .filter(Boolean) as InventoryVehicle[]
    return { vehicles: normalised, meta: payload?.meta ?? null }
  } catch {
    return { vehicles: [], meta: null }
  }
}

type UsedCarsRouteProps = ThemePageProps & {
  searchParams?: SearchParamsLike | Promise<SearchParamsLike>
}

export async function AxisUsedCarsPage(props: UsedCarsRouteProps) {
  const params = await resolveSearchParams(props?.searchParams)
  const brand = await getBrandSlugFromRequest()
  const query = buildInventoryQuery(params, brand)
  const { vehicles, meta } = await fetchInventory(query)

  return <UsedCarsClient initialVehicles={vehicles} initialMeta={meta} />
}

export default AxisUsedCarsPage
