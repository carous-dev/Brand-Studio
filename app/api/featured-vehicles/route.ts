import { NextResponse } from 'next/server'
import { loadInventoryByBrand, sortInventory, normalizeVehicle } from '@/app/lib/loadInventory'

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

    // If no featured vehicles, get random vehicles from inventory
    if (featured.length === 0) {
      console.log(`[/api/featured-vehicles] No featured vehicles found, selecting random vehicles`)
      featured = [...inventory]
        .sort(() => 0.5 - Math.random()) // Shuffle randomly
        .slice(0, limit) // Take requested number
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
      headers: { 'Cache-Control': 'public, max-age=3600' }
    })
  } catch (error: any) {
    console.error('[/api/featured-vehicles] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch featured vehicles' },
      { status: 500 }
    )
  }
}
