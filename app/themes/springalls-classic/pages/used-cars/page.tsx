import { apiUrl } from '../../lib/api'
import UsedCarsClient from './UsedCarsClient'
import { normalizeInventoryItem, type InventoryMeta, type InventoryVehicle } from '../../lib/inventory'
import { getBrandSlugFromRequest } from '../../lib/brand-slug.server'
import type { ThemePageProps } from '../../../types'

type UsedCarsRuntimeProps = ThemePageProps & {
  searchParams?: Record<string, any> | Promise<Record<string, any>>
}

export async function SpringallsUsedCarsPage({ searchParams }: UsedCarsRuntimeProps) {
  let items: any[] = []
  let initialMeta: InventoryMeta | null = null

  if (searchParams && typeof (searchParams as any)?.then === 'function') {
    try {
      // @ts-ignore - runtime unwrap
      searchParams = await searchParams
    } catch {
      // @ts-ignore
      searchParams = undefined
    }
  }

  try {
    const params = new URLSearchParams()
    const allowed = ['page', 'per_page', 'q', 'make', 'model', 'body', 'fuel', 'min_price', 'max_price', 'min_year', 'max_year', 'max_mileage', 'sort']
    const numericKeys = new Set(['page', 'per_page', 'min_price', 'max_price', 'min_year', 'max_year', 'max_mileage'])

    for (const key of allowed) {
      let value: any = undefined
      try {
        if (typeof URLSearchParams !== 'undefined' && searchParams instanceof (URLSearchParams as any)) {
          value = (searchParams as unknown as URLSearchParams).get(key)
        } else if (searchParams && typeof (searchParams as any) === 'object') {
          try {
            const usp = new URLSearchParams(searchParams as any)
            value = usp.get(key)
          } catch {
            value = undefined
          }
        }
      } catch {
        value = undefined
      }

      if (value == null) continue
      const raw = Array.isArray(value) ? value[0] : String(value)
      if (!raw) continue
      if (numericKeys.has(key)) {
        if (!/^\d+$/.test(raw)) continue
        params.set(key, raw)
        continue
      }
      params.set(key, raw)
    }

    if (!params.has('page')) params.set('page', '1')
    params.set('per_page', '12')
    params.set('light', '1')
    if (!params.has('sort')) params.set('sort', 'price_desc')
    params.set('vehicle_type', 'car')
    params.set('stock_status', 'in_stock')

    const brand = await getBrandSlugFromRequest()
    if (brand) params.set('brand', brand)

    const url = apiUrl(`/inventory?${params.toString()}`)
    const res = await fetch(url, { cache: 'no-store' })
    if (res.ok) {
      const payload = await res.json()
      items = Array.isArray(payload?.items) ? payload.items : []
      initialMeta = payload?.meta ?? null
    } else {
      items = []
      initialMeta = null
    }
  } catch {
    items = []
    initialMeta = null
  }

  const initialVehicles = items
    .map((item) => normalizeInventoryItem(item))
    .filter(Boolean) as InventoryVehicle[]

  return <UsedCarsClient initialVehicles={initialVehicles} initialMeta={initialMeta} />
}

export default SpringallsUsedCarsPage
