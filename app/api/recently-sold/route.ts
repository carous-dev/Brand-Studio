import { NextResponse } from 'next/server'
import { getBrandFromHost } from '@/config/domains'
import { fetchBrandByHost, fetchBrandBySlug } from '@/app/lib/brandApi'
import { generateVehicleSlug, resolveBrandInventory, normalizeVehicle, type VehicleItem } from '@/app/lib/loadInventory'

type RecentlySoldVehicle = VehicleItem & {
  stock_status: 'sold'
  status: 'sold'
  sale_date: string
  days_on_market: number
  slug: string
  image: string | null
  images: string[]
}

function getRandomSubset<T>(items: T[], size: number): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = tmp
  }
  return shuffled.slice(0, Math.max(0, Math.min(size, shuffled.length)))
}

async function resolveBrandFromRequest(request: Request, explicitBrand: string): Promise<string> {
  const cleanedBrand = explicitBrand.toLowerCase().trim()
  if (cleanedBrand) return cleanedBrand

  const headerBrand = (request.headers.get('x-brand') || '').toLowerCase().trim()
  if (headerBrand) {
    const bySlug = await fetchBrandBySlug(headerBrand)
    if (bySlug?.slug) return bySlug.slug.toLowerCase()
    return headerBrand
  }

  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('x-original-host') ||
    request.headers.get('host') ||
    'localhost'

  const byHost = await fetchBrandByHost(host)
  if (byHost?.slug) return byHost.slug.toLowerCase()

  return (getBrandFromHost(host) || '').toLowerCase().trim()
}

function toRecentlySold(vehicle: VehicleItem, index: number): RecentlySoldVehicle {
  const normalized = normalizeVehicle(vehicle)
  const candidateImages = [
    ...(Array.isArray(normalized.images) ? normalized.images : []),
    normalized.image,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)

  const images = Array.from(new Set(candidateImages))
  const mileage = Number(normalized.odometer_reading_miles || normalized.mileage || 0)
  const daysOnMarket = Math.max(7, Math.min(90, ((mileage || ((index + 1) * 4000)) % 84) + 7))
  const soldDaysAgo = Math.floor(Math.random() * 90) + 2
  const saleDate = new Date(Date.now() - soldDaysAgo * 24 * 60 * 60 * 1000).toISOString()

  return {
    ...normalized,
    reg: normalized.reg || normalized.registration || normalized.vin || '',
    registration: normalized.registration || normalized.reg || '',
    slug: generateVehicleSlug(normalized),
    stock_status: 'sold',
    status: 'sold',
    sale_date: saleDate,
    days_on_market: Number(daysOnMarket),
    image: images[0] || null,
    images,
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const requestedBrand = url.searchParams.get('brand') || ''
    const limitParam = url.searchParams.get('limit') || url.searchParams.get('per_page') || '12'
    const limit = Math.max(1, Math.min(60, Number.parseInt(limitParam, 10) || 12))

    const brand = await resolveBrandFromRequest(request, requestedBrand)
    const inventory = (await resolveBrandInventory(brand || undefined)).map(normalizeVehicle)

    if (inventory.length === 0) {
      return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
    }

    const randomVehicles = getRandomSubset(inventory, limit)
    const items = randomVehicles.map((vehicle, index) => toRecentlySold(vehicle, index))

    return NextResponse.json(items, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error: any) {
    console.error('[/api/recently-sold] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch recently sold vehicles' },
      { status: 500 },
    )
  }
}
