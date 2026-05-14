export type InventoryVehicle = {
  id: string
  slug?: string
  reg?: string
  title: string
  year: number
  price: number
  mileage: number
  fuel: string
  transmission: string
  body: string
  make: string
  color: string
  doors: number
  location: string
  image: string
  featured?: boolean
}

export type InventoryMeta = {
  total?: number
  totalPages?: number
  page?: number
  per_page?: number
  perPage?: number
  sort?: string
  available?: {
    makes?: string[]
    body_types?: string[]
    fuel_types?: string[]
  }
}

const toText = (input: unknown): string => {
  if (input === null || input === undefined) return ''
  if (typeof input === 'string' || typeof input === 'number') return String(input).trim()
  if (typeof input === 'object') {
    const named = (input as any).name
    if (typeof named === 'string' || typeof named === 'number') return String(named).trim()
    const label = (input as any).label
    if (typeof label === 'string' || typeof label === 'number') return String(label).trim()
  }
  return ''
}

const collectImages = (input: unknown) => {
  if (!Array.isArray(input)) return []
  return input
    .map((item) => {
      if (!item) return ''
      if (typeof item === 'string') return item
      if (typeof item === 'object') {
        return toText((item as any).url || (item as any).href || (item as any).src || (item as any).image)
      }
      return ''
    })
    .filter(Boolean)
}

export function normalizeInventoryItem(item: any): InventoryVehicle | null {
  if (!item) return null

  const vehicle = item.vehicle ?? item
  const advert = item.advert ?? item
  const make = toText(item.make?.name ?? vehicle.make ?? item.make)
  const model = toText(item.model?.name ?? vehicle.model ?? item.model)
  const derivative = toText(vehicle.derivative ?? vehicle.trim ?? item.derivative)
  const year = Number(vehicle.year_of_manufacture ?? vehicle.year ?? item.year ?? 0)
  const price = Number(advert.forecourt_price_gbp ?? advert.price ?? vehicle.price ?? item.price ?? 0)
  const mileage = Number(vehicle.odometer_reading_miles ?? vehicle.mileage ?? item.mileage ?? 0)
  const fuel = toText(vehicle.fuel_type ?? vehicle.fuel ?? item.fuel_type ?? item.fuel)
  const transmission = toText(vehicle.transmission_type ?? vehicle.trans ?? item.transmission ?? item.trans)
  const body = toText(vehicle.body_type ?? vehicle.bodyType ?? item.body_type ?? item.body)
  const color = toText(vehicle.colour ?? vehicle.color ?? item.colour ?? item.color)
  const doors = Number(vehicle.doors ?? item.doors ?? 0)
  const location = toText(item.advertiser?.town ?? item.advertiser?.region ?? item.location ?? 'Reading, Berkshire')

  const galleryImages = [
    ...collectImages(item.gallery),
    ...collectImages(vehicle.gallery),
    ...collectImages(item.media),
  ]
  const image = toText(galleryImages[0] ?? vehicle.image ?? item.image)
  const fallbackImage = '/images/image.png'

  const titleParts = [year || undefined, make || undefined, model || undefined, derivative || undefined].filter(Boolean)
  const title = titleParts.length ? titleParts.join(' ') : toText(item.title ?? `${make} ${model}`)

  const id =
    toText(vehicle.original_id ?? vehicle.vin ?? vehicle.registration ?? item.id ?? advert.advert_id ?? advert.stock_id) ||
    toText(title)
  const slug = toText(item.slug ?? vehicle.slug ?? vehicle.derivative_slug ?? item.derivative_slug)

  if (!id || !title) return null

  return {
    id,
    slug: slug || undefined,
    reg: toText(vehicle.registration ?? vehicle.reg ?? item.reg) || undefined,
    title,
    year: Number.isFinite(year) && year > 0 ? year : 0,
    price: Number.isFinite(price) ? price : 0,
    mileage: Number.isFinite(mileage) ? mileage : 0,
    fuel: fuel || 'Petrol',
    transmission: transmission || 'Manual',
    body: body || 'Car',
    make: make || 'Vehicle',
    color: color || 'Colour',
    doors: Number.isFinite(doors) && doors > 0 ? doors : 4,
    location: location || 'Reading, Berkshire',
    image: image || fallbackImage,
    featured: Boolean(advert.featured ?? item.featured),
  }
}
