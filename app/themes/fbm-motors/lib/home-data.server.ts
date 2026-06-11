import { apiUrl } from './api'
import { getBrandSlugFromRequest } from './brand-slug.server'
import { normalizeInventoryItem, type InventoryVehicle } from './inventory'

export type HomeData = {
  featured: InventoryVehicle[]
  makes: Array<{ name: string; count: number }>
}

export async function loadHomeData(): Promise<HomeData> {
  const brand = await getBrandSlugFromRequest()
  const params = new URLSearchParams({
    page: '1',
    per_page: '12',
    light: '1',
    sort: 'price_desc',
    stock_status: 'in_stock',
    vehicle_type: 'car',
  })
  if (brand) params.set('brand', brand)

  let featured: InventoryVehicle[] = []
  let makes: Array<{ name: string; count: number }> = []

  try {
    const res = await fetch(apiUrl(`/inventory?${params.toString()}`), { cache: 'no-store' })
    if (res.ok) {
      const payload = await res.json()
      const items = Array.isArray(payload?.items) ? payload.items : []
      featured = items
        .map((item: any) => normalizeInventoryItem(item))
        .filter(Boolean) as InventoryVehicle[]

      const availableMakes: unknown = payload?.meta?.available?.makes
      if (Array.isArray(availableMakes)) {
        makes = availableMakes
          .map((m: any) => (typeof m === 'string' ? { name: m, count: 0 } : null))
          .filter(Boolean) as Array<{ name: string; count: number }>
      }
    }
  } catch {
    /* keep empty so caller can fall back to seed */
  }

  return { featured, makes }
}
