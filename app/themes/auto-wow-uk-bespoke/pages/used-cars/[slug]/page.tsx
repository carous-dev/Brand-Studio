import Script from 'next/script'
import { notFound } from 'next/navigation'
import type { ThemePageProps } from '../../../../types'
import { apiUrl } from '../../../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../../../lib/inventory'
import { getBrandSlugFromRequest } from '../../../lib/brand-slug.server'
import { getVehicleLookupCandidates } from '../../../lib/vehicle-links'
import { RESERVE_WIDGET_SRC, VEHICLE_ENQUIRY_WIDGET_SRC } from '../../../lib/external-widgets'
import VehicleDetailIsland, { type DetailVehicle, type DetailSimilarVehicle, type DetailMakeTally } from './VehicleDetailIsland'

type DetailRuntimeProps = ThemePageProps & {
  params?: { slug?: string } | Promise<{ slug?: string }>
}

type RawApiVehicle = any

function pickSpecs(raw: RawApiVehicle, normalized: InventoryVehicle | null): Array<{ label: string; value: string }> {
  const vehicle = raw?.vehicle ?? raw ?? {}
  const advert = raw?.advert ?? raw ?? {}
  const specs: Array<{ label: string; value: string }> = []
  const push = (label: string, value: unknown) => {
    const s = String(value ?? '').trim()
    if (!s || s === '0' || s.toLowerCase() === 'unknown') return
    specs.push({ label, value: s })
  }
  push('Body type', vehicle.body_type ?? vehicle.bodyType ?? normalized?.body)
  push('Fuel', vehicle.fuel_type ?? normalized?.fuel)
  push('Transmission', vehicle.transmission_type ?? normalized?.transmission)
  push('Engine', vehicle.engine_capacity_cc ? `${vehicle.engine_capacity_cc}cc` : null)
  push('Power', vehicle.engine_power_bhp ? `${vehicle.engine_power_bhp} bhp` : null)
  push('Doors', normalized?.doors)
  push('Seats', vehicle.seats)
  push('Colour', vehicle.colour ?? normalized?.color)
  push('CO₂', vehicle.co2_emission_gpkm ? `${vehicle.co2_emission_gpkm} g/km` : null)
  push('Economy', vehicle.fuel_economy_nedc_combined_mpg ? `${vehicle.fuel_economy_nedc_combined_mpg} mpg` : null)
  push('Boot space', vehicle.boot_space_seats_up_litres ? `${vehicle.boot_space_seats_up_litres} L` : null)
  push('Previous owners', raw?.history?.previous_owners_count)
  return specs
}

function pickGallery(raw: RawApiVehicle, normalized: InventoryVehicle | null): string[] {
  const collect: string[] = []
  const fromArr = (arr: unknown) => {
    if (!Array.isArray(arr)) return
    arr.forEach((item) => {
      if (!item) return
      if (typeof item === 'string') collect.push(item)
      else if (typeof item === 'object') {
        const url = (item as any).url || (item as any).href || (item as any).src || (item as any).image
        if (typeof url === 'string') collect.push(url)
      }
    })
  }
  fromArr(raw?.gallery)
  fromArr(raw?.vehicle?.gallery)
  fromArr(raw?.media)
  fromArr(raw?.images)
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of collect) {
    if (!url || seen.has(url)) continue
    seen.add(url)
    out.push(url)
  }
  if (out.length === 0 && normalized?.image) out.push(normalized.image)
  return out
}

async function fetchVehicleBySlug(slug: string, brandSlug: string | null): Promise<{ raw: RawApiVehicle; norm: InventoryVehicle } | null> {
  const candidates = getVehicleLookupCandidates(slug)
  for (const candidate of candidates) {
    const params = new URLSearchParams()
    if (candidate.slug) params.set('slug', candidate.slug)
    if (candidate.reg) params.set('reg', candidate.reg)
    if (brandSlug) params.set('brand', brandSlug)
    try {
      const res = await fetch(apiUrl(`/vehicle?${params.toString()}`), { cache: 'no-store' })
      if (!res.ok) continue
      const payload = await res.json()
      const data = payload?.vehicle ?? payload
      if (!data) continue
      const norm = normalizeInventoryItem(data)
      if (!norm) continue
      return { raw: data, norm }
    } catch {
      continue
    }
  }
  return null
}

async function fetchSimilar(make: string, brandSlug: string | null, excludeId: string): Promise<DetailSimilarVehicle[]> {
  try {
    const params = new URLSearchParams({ per_page: '5', light: '1', stock_status: 'in_stock', make })
    if (brandSlug) params.set('brand', brandSlug)
    const res = await fetch(apiUrl(`/inventory?${params.toString()}`), { cache: 'no-store' })
    if (!res.ok) return []
    const payload = await res.json()
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []
    return items
      .map((item: any) => normalizeInventoryItem(item))
      .filter((v: InventoryVehicle | null): v is InventoryVehicle => Boolean(v) && v!.id !== excludeId)
      .slice(0, 4)
      .map((v: InventoryVehicle) => ({
        id: v.id,
        slug: v.slug,
        title: v.title,
        price: v.price,
        mileage: v.mileage,
        fuel: v.fuel,
        image: v.image,
        year: v.year,
      }))
  } catch {
    return []
  }
}

async function fetchMakesTally(brandSlug: string | null): Promise<DetailMakeTally[]> {
  try {
    const params = new URLSearchParams({ per_page: '100', light: '1', stock_status: 'in_stock' })
    if (brandSlug) params.set('brand', brandSlug)
    const res = await fetch(apiUrl(`/inventory?${params.toString()}`), { cache: 'no-store' })
    if (!res.ok) return []
    const payload = await res.json()
    const items = Array.isArray(payload?.items) ? payload.items : []
    const tally = new Map<string, number>()
    items.forEach((item: any) => {
      const name = String(item?.make?.name ?? item?.make ?? item?.vehicle?.make ?? '').trim()
      if (!name) return
      tally.set(name, (tally.get(name) || 0) + 1)
    })
    return Array.from(tally.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
  } catch {
    return []
  }
}

export async function AutoVehicleDetailPage(props: DetailRuntimeProps) {
  const { params, brand, vehicle: runtimeVehicle, images: runtimeImagesProp } = props
  let slug = ''
  try {
    const resolved = (params && typeof (params as any).then === 'function') ? await (params as Promise<any>) : (params as any)
    slug = String(resolved?.slug ?? '').trim()
  } catch {
    slug = ''
  }
  if (!slug) slug = String(props.vehicleSlug ?? runtimeVehicle?.slug ?? runtimeVehicle?.reg ?? '').trim()
  if (!slug) return notFound()

  const brandSlug = (brand?.slug || '').trim() || await getBrandSlugFromRequest()
  const found = await fetchVehicleBySlug(slug, brandSlug)
  const fallbackNorm = found ? null : normalizeInventoryItem(runtimeVehicle)
  if (!found && !fallbackNorm) return notFound()

  const raw = found?.raw ?? runtimeVehicle ?? {}
  const norm = found?.norm ?? fallbackNorm!
  const runtimeImages = Array.isArray(runtimeImagesProp) ? runtimeImagesProp : []
  const gallery = runtimeImages.length ? runtimeImages : pickGallery(raw, norm)
  const specs = pickSpecs(raw, norm)
  const description = String(raw?.vehicle?.description ?? raw?.description ?? '').trim()
  const advertiserPhone = String(raw?.vehicle?.advertiser_phone ?? raw?.advertiser?.phone ?? '').trim()

  const [similar, makes] = await Promise.all([
    fetchSimilar(norm.make, brandSlug, norm.id),
    fetchMakesTally(brandSlug),
  ])

  const detailVehicle: DetailVehicle = {
    id: norm.id,
    slug: norm.slug,
    title: norm.title,
    year: norm.year,
    price: norm.price,
    mileage: norm.mileage,
    fuel: norm.fuel,
    transmission: norm.transmission,
    body: norm.body,
    make: norm.make,
    color: norm.color,
    doors: norm.doors,
    reg: norm.reg,
    location: norm.location,
    description,
    advertiserPhone,
    gallery,
    specs,
  }

  return (
    <>
      <Script
        id="carous-vehicle-enquiry-widget"
        src={VEHICLE_ENQUIRY_WIDGET_SRC}
        strategy="afterInteractive"
      />
      <Script
        id="carous-reserve-a-car-widget"
        src={RESERVE_WIDGET_SRC}
        strategy="afterInteractive"
      />
      <VehicleDetailIsland vehicle={detailVehicle} similar={similar} makes={makes} />
    </>
  )
}

export default AutoVehicleDetailPage
