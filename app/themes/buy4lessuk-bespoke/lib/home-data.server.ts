import { apiUrl } from './api'
import { getBrandSlugFromRequest } from './brand-slug.server'
import { normalizeInventoryItem, type InventoryVehicle } from './inventory'

export type HomeData = {
  featured: InventoryVehicle[]
  makes: string[]
  bodies: string[]
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
  let bodies: string[] = []

  try {
    const res = await fetch(apiUrl(`/inventory?${params.toString()}`), { cache: 'no-store' })
    if (res.ok) {
      const payload = await res.json()
      const items = Array.isArray(payload?.items) ? payload.items : []
      featured = items.map((item: any) => normalizeInventoryItem(item)).filter(Boolean) as InventoryVehicle[]
      const available: string[] = payload?.meta?.available?.makes || []
      if (Array.isArray(available) && available.length > 0) makes = available
      const availableBodies: string[] = payload?.meta?.available?.body_types || []
      if (Array.isArray(availableBodies)) bodies = availableBodies.filter((b) => typeof b === 'string' && b.trim())
    }
  } catch {
    /* keep fallbacks */
  }

  if (bodies.length === 0) {
    bodies = Array.from(new Set(featured.map((v) => v.body).filter(Boolean)))
  }

  return { featured, makes, bodies }
}
