import Script from 'next/script'
import { notFound } from 'next/navigation'
import type { ThemePageProps } from '../../../../types'
import { apiUrl } from '../../../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../../../lib/inventory'
import { getBrandSlugFromRequest } from '../../../lib/brand-slug.server'
import { getVehicleLookupCandidates } from '../../../lib/vehicle-links'
import { VEHICLE_ENQUIRY_WIDGET_SRC, RESERVE_WIDGET_SRC } from '../../../lib/external-widgets'
import DetailClient, {
  type DetailVehicle,
  type DetailSimilarVehicle,
} from './DetailClient'

/**
 * Vehicle detail — /used-cars/[slug] (Server Component).
 *
 * Structure (design-language §7 detail flow + build-rules §11):
 *   title strip (bg) → full-bleed mosaic gallery (bg) → claret specs band
 *   (primary, the route's single primary band — NO px-invite here) →
 *   content + sticky sidebar (bg) → similar-vehicles rail (surface) → footer.
 *
 * This wrapper stays a Server Component: it brand-scopes the vehicle fetch,
 * walks every payload path for the gallery, extracts the six ledger specs,
 * loads the two CDN widget bundles as `afterInteractive` <Script>s, and hands a
 * plain data object to the co-located `DetailClient` island. Interactivity
 * (gallery lightbox, sticky bars, enquiry CDN/modal fallback) lives in the
 * island; the gallery is always local.
 */

type DetailRuntimeProps = ThemePageProps & {
  params?: { slug?: string } | Promise<{ slug?: string }>
}

type RawApiVehicle = any

const SOLD_STATUSES = new Set(['sold', 'sold_out', 'out_of_stock'])

function toText(input: unknown): string {
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

/**
 * Gallery extraction walks EVERY known payload path — `.gallery / .images /
 * .media / .photos` at the root, under `.vehicle`, and under `.advert` — so an
 * imageful car never falls through to the "Photos coming soon" placeholder
 * just because the feed nested its photos differently.
 */
function pickGallery(raw: RawApiVehicle, runtimeImages: string[], norm: InventoryVehicle | null): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const add = (value: unknown) => {
    const url =
      typeof value === 'string'
        ? value.trim()
        : toText(
            (value as any)?.url ||
              (value as any)?.href ||
              (value as any)?.src ||
              (value as any)?.image ||
              (value as any)?.HREF,
          )
    if (!url || seen.has(url)) return
    seen.add(url)
    out.push(url)
  }
  const fromArr = (arr: unknown) => {
    if (Array.isArray(arr)) arr.forEach(add)
  }
  const nodes = [raw, raw?.vehicle, raw?.advert].filter(Boolean)
  for (const node of nodes) {
    fromArr((node as any)?.gallery)
    fromArr((node as any)?.images)
    fromArr((node as any)?.media)
    fromArr((node as any)?.photos)
  }
  runtimeImages.forEach(add)
  if (norm?.image) add(norm.image)
  return out.filter((url) => !/image\.png$/i.test(url))
}

function formatEngine(raw: RawApiVehicle): string {
  const vehicle = raw?.vehicle ?? raw ?? {}
  const cc = Number(vehicle.engine_capacity_cc ?? vehicle.engineCapacityCc ?? 0)
  if (Number.isFinite(cc) && cc > 0) return `${(cc / 1000).toFixed(1)}L`
  const bhp = Number(vehicle.engine_power_bhp ?? 0)
  if (Number.isFinite(bhp) && bhp > 0) return `${bhp} bhp`
  return ''
}

async function fetchVehicleBySlug(
  slug: string,
  brandSlug: string | null,
): Promise<{ raw: RawApiVehicle; norm: InventoryVehicle } | null> {
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

async function fetchSimilar(
  make: string,
  body: string,
  brandSlug: string | null,
  excludeId: string,
): Promise<DetailSimilarVehicle[]> {
  const query = async (extra: Record<string, string>): Promise<DetailSimilarVehicle[]> => {
    try {
      const params = new URLSearchParams({ per_page: '8', light: '1', stock_status: 'in_stock', ...extra })
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
          reg: v.reg,
          title: v.title,
          make: v.make,
          year: v.year,
          price: v.price,
          mileage: v.mileage,
          fuel: v.fuel,
          transmission: v.transmission,
          image: v.image,
        }))
    } catch {
      return []
    }
  }

  // Prefer same make; TOP UP with same body type, then latest stock, until we
  // have at least 3 (show up to 4). Dedupe across the passes.
  const seen = new Set<string>([excludeId])
  const collected: DetailSimilarVehicle[] = []
  const addUnique = (list: DetailSimilarVehicle[]) => {
    for (const v of list) {
      if (seen.has(v.id)) continue
      seen.add(v.id)
      collected.push(v)
    }
  }
  if (make) addUnique(await query({ make }))
  if (collected.length < 3 && body) addUnique(await query({ body }))
  if (collected.length < 3) addUnique(await query({ sort: 'newest' }))
  return collected.slice(0, 4)
}

export async function RedgateVehicleDetailPage(props: DetailRuntimeProps) {
  const { params, brand, vehicle: runtimeVehicle, images: runtimeImagesProp } = props

  let slug = ''
  try {
    const resolved =
      params && typeof (params as any).then === 'function' ? await (params as Promise<any>) : (params as any)
    slug = String(resolved?.slug ?? '').trim()
  } catch {
    slug = ''
  }
  if (!slug) slug = String(props.vehicleSlug ?? runtimeVehicle?.slug ?? runtimeVehicle?.reg ?? '').trim()
  if (!slug) return notFound()

  const brandSlug = (brand?.slug || '').trim() || (await getBrandSlugFromRequest())

  const found = await fetchVehicleBySlug(slug, brandSlug)
  const fallbackNorm = found ? null : normalizeInventoryItem(runtimeVehicle)
  if (!found && !fallbackNorm) return notFound()

  const raw = found?.raw ?? runtimeVehicle ?? {}
  const norm = found?.norm ?? fallbackNorm!
  const rawVehicle = raw?.vehicle ?? raw ?? {}
  const rawAdvert = raw?.advert ?? {}

  const runtimeImages = Array.isArray(runtimeImagesProp) ? runtimeImagesProp : []
  const gallery = pickGallery(raw, runtimeImages, norm)

  const description = toText(rawVehicle.description ?? raw?.description ?? runtimeVehicle?.description)
  const advertiserPhone = toText(rawVehicle.advertiser_phone ?? raw?.advertiser?.phone)
  const stockStatus = toText(rawVehicle.stock_status ?? rawAdvert.stock_status ?? raw?.stock_status).toLowerCase()
  const sold = SOLD_STATUSES.has(stockStatus)

  const detailVehicle: DetailVehicle = {
    id: norm.id,
    slug: norm.slug,
    title: norm.title,
    make: norm.make,
    model: toText(raw?.model?.name ?? rawVehicle.model ?? runtimeVehicle?.model),
    derivative: toText(rawVehicle.derivative ?? rawVehicle.trim ?? runtimeVehicle?.derivative),
    reg: norm.reg || '',
    year: norm.year,
    price: norm.price,
    mileage: norm.mileage,
    fuel: norm.fuel,
    gearbox: norm.transmission,
    engine: formatEngine(raw),
    body: norm.body,
    color: norm.color,
    doors: norm.doors,
    description,
    advertiserPhone,
    gallery,
    sold,
  }

  const similar = await fetchSimilar(norm.make, norm.body, brandSlug, norm.id)

  return (
    <>
      <Script id="carous-vehicle-enquiry-widget" src={VEHICLE_ENQUIRY_WIDGET_SRC} strategy="afterInteractive" />
      <Script id="carous-reserve-a-car-widget" src={RESERVE_WIDGET_SRC} strategy="afterInteractive" />
      <DetailClient vehicle={detailVehicle} similar={similar} />
    </>
  )
}

export default RedgateVehicleDetailPage
