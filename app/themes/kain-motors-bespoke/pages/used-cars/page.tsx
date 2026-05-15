import type { ThemePageProps } from '../../../types'
import { apiUrl } from '../../lib/api'
import { getBrandSlugFromRequest } from '../../lib/brand-slug.server'
import { normalizeInventoryItem, type InventoryMeta, type InventoryVehicle } from '../../lib/inventory'
import UsedCarsClient from './UsedCarsClient'

type RuntimeProps = ThemePageProps & {
  searchParams?: Record<string, any> | Promise<Record<string, any>>
}

const FILTER_KEYS = ['page', 'per_page', 'q', 'make', 'model', 'body', 'fuel', 'min_price', 'max_price', 'min_year', 'max_year', 'max_mileage', 'sort'] as const
const NUMERIC_FILTERS = new Set(['page', 'per_page', 'min_price', 'max_price', 'min_year', 'max_year', 'max_mileage'])

async function unwrapSearchParams(input: RuntimeProps['searchParams']): Promise<Record<string, any> | undefined> {
  if (!input) return undefined
  if (typeof (input as any)?.then === 'function') {
    try { return await (input as Promise<Record<string, any>>) } catch { return undefined }
  }
  return input as Record<string, any>
}

function toQuery(source: Record<string, any> | undefined): URLSearchParams {
  const out = new URLSearchParams()
  if (!source) return out
  for (const key of FILTER_KEYS) {
    const raw = source[key]
    if (raw == null) continue
    const value = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
    if (!value) continue
    if (NUMERIC_FILTERS.has(key) && !/^\d+$/.test(value)) continue
    out.set(key, value)
  }
  return out
}

async function fetchInitialInventory(filters: URLSearchParams): Promise<{ vehicles: InventoryVehicle[]; meta: InventoryMeta | null }> {
  // Prestige inventory loader — server-side fetch with brand scope so
  // operator-uploaded vehicles render reliably (SKILL Pitfall row 14).
  if (!filters.has('page')) filters.set('page', '1')
  filters.set('per_page', '12')
  filters.set('light', '1')
  if (!filters.has('sort')) filters.set('sort', 'price_desc')
  filters.set('vehicle_type', 'car')
  filters.set('stock_status', 'in_stock')

  const brand = await getBrandSlugFromRequest()
  if (brand) filters.set('brand', brand)

  try {
    const response = await fetch(apiUrl(`/inventory?${filters.toString()}`), { cache: 'no-store' })
    if (!response.ok) return { vehicles: [], meta: null }
    const payload = await response.json()
    const rawItems: any[] = Array.isArray(payload?.items) ? payload.items : []
    const vehicles = rawItems
      .map((item) => normalizeInventoryItem(item))
      .filter((v): v is InventoryVehicle => Boolean(v))
    return { vehicles, meta: payload?.meta ?? null }
  } catch {
    return { vehicles: [], meta: null }
  }
}

export async function KainUsedCarsPage({ searchParams }: RuntimeProps) {
  const unwrapped = await unwrapSearchParams(searchParams)
  const filters = toQuery(unwrapped)
  const { vehicles, meta } = await fetchInitialInventory(filters)
  return <UsedCarsClient initialVehicles={vehicles} initialMeta={meta} />
}

export default KainUsedCarsPage
