import { NextResponse } from 'next/server'
import {
  generateVehicleSlug,
  resolveBrandInventory,
  normalizeVehicle,
  type VehicleItem,
} from '@/app/lib/loadInventory'
import { getBrandFromHost } from '@/config/domains'
import { fetchBrandByHost, fetchBrandBySlug } from '@/app/lib/brandApi'

function normalizeKey(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function toNumberOrNull(value: unknown): number | null {
  const numeric = Number(String(value ?? '').replace(/[^0-9.-]/g, '').trim())
  return Number.isFinite(numeric) ? numeric : null
}

function compactVehicle(item: VehicleItem): Record<string, unknown> {
  const normalized = normalizeVehicle(item)
  const images = Array.isArray(item.images)
    ? item.images.map((src) => String(src || '').trim()).filter(Boolean)
    : []
  const image =
    images[0] ||
    (typeof item.image === 'string' && item.image.trim() ? item.image.trim() : '/images/placeholder.png')

  return {
    reg: normalized.reg || normalized.registration || normalized.vin || null,
    registration: normalized.registration || normalized.reg || null,
    slug: (item.slug || item.derivative_slug || generateVehicleSlug(item)) || null,
    make: normalized.make || null,
    model: normalized.model || null,
    derivative: normalized.derivative || null,
    year: normalized.year || null,
    price: normalized.price || null,
    mileage: normalized.mileage || null,
    trans: normalized.transmission_type || normalized.trans || null,
    transmission: normalized.transmission_type || normalized.trans || null,
    fuel: normalized.fuel_type || normalized.fuel || null,
    fuel_type: normalized.fuel_type || normalized.fuel || null,
    body_type: normalized.body_type || null,
    colour: normalized.colour || null,
    color: normalized.colour || null,
    image,
    images,
    description: normalized.description || null,
    stock_status: (item.status as string) || null,
    first_registration_date: (item.first_registration_date as string) || null,
  }
}

function scoreSimilarity(current: VehicleItem, candidate: VehicleItem): number {
  const cur = normalizeVehicle(current)
  const row = normalizeVehicle(candidate)

  let score = 0

  if (normalizeKey(cur.make) && normalizeKey(cur.make) === normalizeKey(row.make)) score += 40
  if (normalizeKey(cur.model) && normalizeKey(cur.model) === normalizeKey(row.model)) score += 30
  if (normalizeKey(cur.fuel_type) && normalizeKey(cur.fuel_type) === normalizeKey(row.fuel_type)) score += 8
  if (normalizeKey(cur.transmission_type) && normalizeKey(cur.transmission_type) === normalizeKey(row.transmission_type)) score += 6

  const curPrice = toNumberOrNull(cur.price)
  const rowPrice = toNumberOrNull(row.price)
  if (curPrice !== null && rowPrice !== null) {
    const delta = Math.abs(rowPrice - curPrice) / Math.max(1, curPrice)
    if (delta <= 0.1) score += 20
    else if (delta <= 0.25) score += 10
    else if (delta <= 0.4) score += 4
  }

  const curYear = toNumberOrNull(cur.year)
  const rowYear = toNumberOrNull(row.year)
  if (curYear !== null && rowYear !== null) {
    const delta = Math.abs(rowYear - curYear)
    if (delta === 0) score += 8
    else if (delta <= 1) score += 5
    else if (delta <= 2) score += 2
  }

  const curMileage = toNumberOrNull(cur.mileage)
  const rowMileage = toNumberOrNull(row.mileage)
  if (curMileage !== null && rowMileage !== null) {
    const delta = Math.abs(rowMileage - curMileage) / Math.max(1, curMileage)
    if (delta <= 0.15) score += 6
    else if (delta <= 0.3) score += 3
  }

  if (Array.isArray(candidate.images) && candidate.images.length > 0) score += 2
  if (typeof candidate.image === 'string' && candidate.image.trim()) score += 1

  return score
}

function findCurrentVehicle(inventory: VehicleItem[], reg: string, slug: string): VehicleItem | null {
  const normalizedReg = normalizeKey(reg)
  const normalizedSlug = normalizeKey(slug)

  for (const item of inventory) {
    const itemReg = normalizeKey(item.reg || item.registration || item.vin)
    const generatedSlug = generateVehicleSlug(item)
    const explicitSlug = String((item as any).slug || (item as any).derivative_slug || '').toLowerCase()
    const itemSlug = explicitSlug || generatedSlug
    const normalizedItemSlug = normalizeKey(itemSlug)

    if (reg && (itemReg === normalizedReg || String(item.reg || item.registration || '').toLowerCase() === reg.toLowerCase())) {
      return item
    }

    if (slug && (itemSlug === slug.toLowerCase() || normalizedItemSlug === normalizedSlug)) {
      return item
    }
  }

  return null
}

async function resolveBrand(request: Request, url: URL): Promise<string> {
  const queryBrand = (url.searchParams.get('brand') || '').toLowerCase().trim()
  const xBrandHeader = (request.headers.get('x-brand') || '').toLowerCase().trim()
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('x-original-host') ||
    request.headers.get('host') ||
    'localhost'

  if (queryBrand) {
    const fromQuery = await fetchBrandBySlug(queryBrand)
    if (fromQuery?.slug) return fromQuery.slug.toLowerCase()
    return queryBrand
  }

  if (xBrandHeader) {
    const fromHeader = await fetchBrandBySlug(xBrandHeader)
    if (fromHeader?.slug) return fromHeader.slug.toLowerCase()
  }

  const fromHost = await fetchBrandByHost(host)
  if (fromHost?.slug) return fromHost.slug.toLowerCase()

  return (getBrandFromHost(host) || 'fairfield').toLowerCase()
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const reg = (url.searchParams.get('reg') || '').trim()
    const slug = (url.searchParams.get('slug') || '').trim()
    const limit = Math.max(1, Math.min(50, parseInt(url.searchParams.get('limit') || '6', 10)))

    if (!reg && !slug) {
      return NextResponse.json({ items: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
    }

    const brand = await resolveBrand(request, url)
    // Carous-bound previews resolve to the dealer's live DMS stock only.
    const inventory = await resolveBrandInventory(brand)

    if (!inventory.length) {
      return NextResponse.json({ items: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
    }

    const current = findCurrentVehicle(inventory, reg, slug)
    if (!current) {
      return NextResponse.json({ items: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
    }

    const currentRegKey = normalizeKey(current.reg || current.registration || current.vin)
    const currentSlugKey = normalizeKey((current as any).slug || (current as any).derivative_slug || generateVehicleSlug(current))

    const candidates = inventory
      .filter((item) => {
        const itemRegKey = normalizeKey(item.reg || item.registration || item.vin)
        const itemSlugKey = normalizeKey((item as any).slug || (item as any).derivative_slug || generateVehicleSlug(item))
        return itemRegKey !== currentRegKey && itemSlugKey !== currentSlugKey
      })
      .map((item, index) => ({
        item,
        score: scoreSimilarity(current, item),
        index,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score

        const yearA = toNumberOrNull(a.item.year) || 0
        const yearB = toNumberOrNull(b.item.year) || 0
        if (yearB !== yearA) return yearB - yearA

        const priceA = toNumberOrNull(a.item.price || a.item.forecourt_price_gbp) || 0
        const priceB = toNumberOrNull(b.item.price || b.item.forecourt_price_gbp) || 0
        if (priceA !== priceB) return priceA - priceB

        return a.index - b.index
      })
      .slice(0, limit)
      .map(({ item }) => compactVehicle(item))

    return NextResponse.json({ items: candidates }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[/api/vehicle/similar] Error:', err)
    return NextResponse.json({ items: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  }
}
