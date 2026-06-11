import { apiUrl } from '../../lib/api'
import { resolveText } from '../../lib/brand-text'
import { PageHero } from '../../components/PageHero'
import { heroImage as defaultHero } from '../../lib/cars'
import { getBrandSlugFromRequest } from '../../lib/brand-slug.server'
import { normalizeInventoryItem, type InventoryMeta, type InventoryVehicle } from '../../lib/inventory'
import UsedCarsClient from './UsedCarsClient'
import type { ThemePageProps } from '../../../types'

type UsedCarsRuntimeProps = ThemePageProps & {
  // Provided by `app/themes/page-runtime.server.tsx` — already-fetched raw
  // inventory items keyed by the request's searchParams. When present we
  // normalize directly instead of issuing a second `/api/inventory` call.
  initialInventory?: any[]
  searchParams?: Record<string, any> | Promise<Record<string, any>>
}

export async function FbmUsedCarsPage({ brand, initialInventory, searchParams }: UsedCarsRuntimeProps) {
  const heroBg = brand.images?.hero || brand.heroImage || defaultHero
  const heroTitle = resolveText(brand, 'usedCarsHeroTitle')
  const heroLead = resolveText(brand, 'usedCarsHeroLead')

  let items: any[] = Array.isArray(initialInventory) ? initialInventory : []
  let initialMeta: InventoryMeta | null = null

  if (searchParams && typeof (searchParams as any)?.then === 'function') {
    try {
      // @ts-ignore - runtime unwrap of async searchParams
      searchParams = await searchParams
    } catch {
      // @ts-ignore
      searchParams = undefined
    }
  }

  // If the runtime didn't pre-fetch (page invoked directly), fetch ourselves.
  if (items.length === 0) {
    try {
      const params = new URLSearchParams()
      const allowed = ['page', 'per_page', 'q', 'make', 'model', 'body', 'fuel', 'min_price', 'max_price', 'min_year', 'max_year', 'max_mileage', 'sort']
      const numericKeys = new Set(['page', 'per_page', 'min_price', 'max_price', 'min_year', 'max_year', 'max_mileage'])

      for (const key of allowed) {
        let value: any
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

      const brandSlug = await getBrandSlugFromRequest()
      if (brandSlug) params.set('brand', brandSlug)

      const res = await fetch(apiUrl(`/inventory?${params.toString()}`), { cache: 'no-store' })
      if (res.ok) {
        const payload = await res.json()
        items = Array.isArray(payload?.items) ? payload.items : []
        initialMeta = payload?.meta ?? null
      }
    } catch {
      /* keep items empty so the client falls back to seed */
    }
  }

  const initialVehicles = items
    .map((item) => normalizeInventoryItem(item))
    .filter(Boolean) as InventoryVehicle[]

  return (
    <>
      <PageHero image={heroBg} title={heroTitle} lead={heroLead} />
      <UsedCarsClient initialVehicles={initialVehicles} initialMeta={initialMeta} />
    </>
  )
}

export default FbmUsedCarsPage
