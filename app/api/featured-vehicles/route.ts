import { NextResponse } from 'next/server'
import { generateVehicleSlug, loadInventoryByBrand, normalizeVehicle } from '@/app/lib/loadInventory'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const brand = (url.searchParams.get('brand') || '').toLowerCase().trim()
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '12', 10), 50)

    // Load inventory for specified brand
    const inventory = loadInventoryByBrand(brand || undefined)
    console.log(`[/api/featured-vehicles] Loaded ${inventory.length} items from brand "${brand || 'main'}"`)

    // Filter featured items and sort by newest
    let featured = inventory
      .filter((item) => !!item.featured)
      .sort((a, b) => {
        const aYear = a.year || 0
        const bYear = b.year || 0
        return bYear - aYear
      })

    // If no featured vehicles, fall back to the newest stock (year desc, then
    // price desc as a tiebreak) so prospect previews show a sensible "highlight
    // reel" rather than a random shuffle every reload.
    if (featured.length === 0) {
      console.log(`[/api/featured-vehicles] No featured flag set — using newest-stock fallback`)
      featured = [...inventory]
        .sort((a, b) => {
          const yearDelta = (Number(b.year) || 0) - (Number(a.year) || 0)
          if (yearDelta !== 0) return yearDelta
          return (Number(b.price) || 0) - (Number(a.price) || 0)
        })
        .slice(0, limit)
    } else {
      featured = featured.slice(0, limit)
    }

    console.log(`[/api/featured-vehicles] Found ${featured.length} featured items`)

    // Map to response format
    const items = featured.map((item) => {
      const normalized = normalizeVehicle(item)
      return {
        vin: normalized.vin || null,
        registration: normalized.registration || null,
        reg: normalized.registration || normalized.vin || null,
        slug: generateVehicleSlug(item as any),
        make: normalized.make || null,
        model: normalized.model || null,
        derivative: normalized.derivative || null,
        derivative_slug: normalized.derivative_slug || null,
        year: normalized.year || null,
        body_type: normalized.body_type || null,
        fuel: normalized.fuel_type || null,
        trans: normalized.transmission_type || null,
        engine_capacity_cc: item.engine_capacity_cc || null,
        engine_power_bhp: item.engine_power_bhp || null,
        seats: normalized.seats || null,
        doors: item.doors || null,
        colour: normalized.colour || null,
        description: normalized.description || null,
        price: normalized.price || null,
        mileage: normalized.mileage || null,
        featured: 1,
        image: item.image || '/images/placeholder.png',
        images: item.images || [item.image || '/images/placeholder.png']
      }
    })

    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error: any) {
    console.error('[/api/featured-vehicles] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch featured vehicles' },
      { status: 500 }
    )
  }
}
