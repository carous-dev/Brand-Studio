import { apiUrl } from './api'
import { getBrandSlugFromRequest } from './brand-slug.server'
import { normalizeInventoryItem, type InventoryVehicle } from './inventory'

export type HomeData = {
  featured: InventoryVehicle[]
  makes: string[]
}

const FALLBACK_MAKES = [
  'Abarth', 'Alfa Romeo', 'Audi', 'BMW', 'Citroën', 'Dacia', 'Fiat', 'Ford',
  'Honda', 'Hyundai', 'Jaguar', 'Kia', 'Land Rover', 'Lexus', 'Mazda',
  'Mercedes-Benz', 'MINI', 'Nissan', 'Peugeot', 'Renault', 'SEAT', 'Skoda',
  'Suzuki', 'Toyota', 'Vauxhall', 'Volkswagen', 'Volvo',
]

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
  let makes: string[] = FALLBACK_MAKES

  try {
    const res = await fetch(apiUrl(`/inventory?${params.toString()}`), { cache: 'no-store' })
    if (res.ok) {
      const payload = await res.json()
      const items = Array.isArray(payload?.items) ? payload.items : []
      featured = items.map((item: any) => normalizeInventoryItem(item)).filter(Boolean) as InventoryVehicle[]
      const available: string[] = payload?.meta?.available?.makes || []
      if (Array.isArray(available) && available.length > 0) makes = available
    }
  } catch {
    /* keep fallbacks */
  }

  return { featured, makes }
}
