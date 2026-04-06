import { NextResponse } from 'next/server'
import {
  loadInventoryByBrand,
  filterInventory,
  sortInventory,
  paginateInventory,
  slugifyParts,
  extractPresetsFromInventory
} from '@/app/lib/loadInventory'
import { generateVehicleSlug } from '@/app/lib/loadInventory'
import { getBrandFromHost } from '@/config/domains'
import { fetchBrandByHost, fetchBrandBySlug } from '@/app/lib/brandApi'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const per_page = Math.max(1, parseInt(url.searchParams.get('per_page') || '12', 10))

    // Extract filters from query params
    const q = (url.searchParams.get('q') || '').toLowerCase().trim()
    const make = (url.searchParams.get('make') || '').toLowerCase().trim()
    const model = (url.searchParams.get('model') || '').toLowerCase().trim()
    const body = (url.searchParams.get('body') || '').toLowerCase().trim()
    const sort = (url.searchParams.get('sort') || 'newest').trim().toLowerCase()
    const year = url.searchParams.get('year')
    const price = url.searchParams.get('price')
    const min_price = url.searchParams.get('min_price')
    const max_price = url.searchParams.get('max_price')
    const min_year = url.searchParams.get('min_year')
    const max_year = url.searchParams.get('max_year')
    const fuel = (url.searchParams.get('fuel') || '').toLowerCase().trim()
    const trans = (url.searchParams.get('trans') || '').toLowerCase().trim()

    const xBrandHeader = request.headers.get('x-brand')
    const host =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('x-original-host') ||
      request.headers.get('host') ||
      'localhost'

    // Resolve brand robustly:
    // 1) Trust x-brand only if it exists in previews.
    // 2) Otherwise resolve by host against previews.db (supports custom domains).
    // 3) Fallback to slug-from-host heuristic.
    let resolvedBrandId: string | null = null

    if (xBrandHeader) {
      const fromHeader = await fetchBrandBySlug(xBrandHeader.toLowerCase())
      if (fromHeader?.slug) resolvedBrandId = fromHeader.slug.toLowerCase()
    }

    if (!resolvedBrandId) {
      const fromHost = await fetchBrandByHost(host)
      if (fromHost?.slug) resolvedBrandId = fromHost.slug.toLowerCase()
    }

    if (!resolvedBrandId) {
      resolvedBrandId = (getBrandFromHost(host) || 'fairfield').toLowerCase()
    }

    const brand = resolvedBrandId

    // Load inventory from files
    let inventory = loadInventoryByBrand(brand || undefined)

    // Apply filters
    let filtered = filterInventory(inventory, {
      q: q || undefined,
      make: make || undefined,
      model: model || undefined,
      body: body || undefined,
      year: year ? parseInt(year, 10) : undefined,
      min_year: min_year ? parseInt(min_year, 10) : undefined,
      max_year: max_year ? parseInt(max_year, 10) : undefined,
      price: price || undefined,
      min_price: min_price ? parseFloat(min_price) : undefined,
      max_price: max_price ? parseFloat(max_price) : undefined,
      fuel: fuel || undefined,
      trans: trans || undefined
    })

    // Apply sorting
    const sorted = sortInventory(filtered, sort)

    // Paginate results
    const paginated = paginateInventory(sorted, page, per_page)

    // Add slugs to items
    const items = paginated.items.map((item) => ({
      ...item,
      slug: generateVehicleSlug(item as any)
    }))

    // Extract presets for filter UI
    const presets = extractPresetsFromInventory(inventory)

    const meta = {
      total: paginated.total,
      page: paginated.page,
      per_page: paginated.per_page,
      totalPages: paginated.total_pages,
      stats: {
        min_price: inventory.length > 0 ? Math.min(...inventory.map(i => i.price || 0).filter(p => p > 0)) : null,
        avg_mileage: inventory.length > 0 ? Math.round(inventory.reduce((sum, i) => sum + (i.mileage || 0), 0) / inventory.length) : null
      },
      filters: { q, make, model, body, sort, year, price, min_price, max_price, min_year, max_year, fuel, trans },
      available: {
        makes: presets.makes,
        years: presets.years,
        prices: presets.prices
      },
      source: 'inventory.json'
    }

    return NextResponse.json({ items, meta }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[/api/inventory] Error:', err)
    return NextResponse.json({ error: 'Failed to load inventory', details: String(err) }, { status: 500 })
  }
}
