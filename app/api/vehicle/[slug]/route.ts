import { NextResponse } from 'next/server'
import { resolveBrandInventory, normalizeVehicle, generateVehicleSlug } from '@/app/lib/loadInventory'
import { getBrandFromHost } from '@/config/domains'
import { fetchBrandByHost, fetchBrandBySlug } from '@/app/lib/brandApi'

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    
    if (!slug) return NextResponse.json({ error: 'missing slug parameter' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })

    const url = new URL(req.url)
    const queryBrand = (url.searchParams.get('brand') || '').toLowerCase().trim()
    const xBrandHeader = (req.headers.get('x-brand') || '').toLowerCase().trim()
    const host =
      req.headers.get('x-forwarded-host') ||
      req.headers.get('x-original-host') ||
      req.headers.get('host') ||
      'localhost'

    let brand: string | null = null

    if (queryBrand) {
      const fromQuery = await fetchBrandBySlug(queryBrand)
      brand = fromQuery?.slug ? fromQuery.slug.toLowerCase() : queryBrand
    }

    if (!brand && xBrandHeader) {
      const fromHeader = await fetchBrandBySlug(xBrandHeader)
      if (fromHeader?.slug) brand = fromHeader.slug.toLowerCase()
    }

    if (!brand) {
      const fromHost = await fetchBrandByHost(host)
      if (fromHost?.slug) brand = fromHost.slug.toLowerCase()
    }

    if (!brand) {
      brand = (getBrandFromHost(host) || 'fairfield').toLowerCase()
    }

    if (!brand) {
      return NextResponse.json({ error: 'missing brand for vehicle lookup' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
    }

    // Carous-bound previews resolve to the dealer's live DMS stock only.
    const inventory = await resolveBrandInventory(brand)
    if (!inventory || inventory.length === 0) {
      return NextResponse.json({ error: 'brand inventory not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    }

    const slugLower = slug.toLowerCase()
    const normalizedLookup = slugLower.replace(/[^a-z0-9]/g, '')

    // Find vehicle by slug or registration (supports compact registration variants)
    const found = inventory.find((item: any) => {
      const generatedSlug = generateVehicleSlug(item)
      const explicitSlug = (item.slug || item.derivative_slug || '').toString().toLowerCase()
      const reg = (item.reg || item.registration || '').toString().toLowerCase()
      const normalizedReg = reg.replace(/[^a-z0-9]/g, '')
      const keys = [explicitSlug, generatedSlug, reg]
      if (explicitSlug && reg) keys.push(`${explicitSlug}-${reg}`)
      if (generatedSlug && reg) keys.push(`${generatedSlug}-${reg}`)
      const exactSlugMatch = keys.some((key) => {
        const normalizedKey = String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        return Boolean(normalizedKey && (String(key).toLowerCase() === slugLower || normalizedKey === normalizedLookup))
      })
      const regSuffixMatch = Boolean(normalizedLookup && normalizedReg && (normalizedReg === normalizedLookup || normalizedLookup.endsWith(normalizedReg)))
      return exactSlugMatch || regSuffixMatch
    })

    if (!found) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    }

    const normalized = normalizeVehicle(found)

    // Build response
    const vehicle: any = {
      vin: normalized.vin,
      registration: normalized.registration,
      make: normalized.make,
      model: normalized.model,
      derivative: normalized.derivative,
      year: normalized.year,
      body_type: normalized.body_type,
      fuel_type: normalized.fuel_type,
      transmission_type: normalized.transmission_type,
      colour: normalized.colour,
      engine_capacity_cc: found.engine_capacity_cc,
      engine_power_bhp: found.engine_power_bhp,
      seats: normalized.seats,
      doors: found.doors,
      mileage: normalized.mileage,
      price: normalized.price,
      description: normalized.description,
      ...found // Include any additional fields from inventory
    }

    const response: any = {
      vehicle: {
        ...vehicle,
        derivative_slug: generateVehicleSlug(found)
      },
      advert: {
        vin: normalized.vin,
        forecourt_price_gbp: normalized.price,
        status: 'publish',
        featured: found.featured || false
      },
      advertiser: found.advertiser || null,
      make: { name: normalized.make },
      model: { name: normalized.model },
      vehicle_history: found.vehicle_history || null,
      vehicle_check: found.vehicle_check || null,
      features: found.features || [],
      images: found.images || [found.image || '/images/placeholder.png'],
      specs: found.specs || {}
    }

    console.log(`[/api/vehicle/[slug]] Found vehicle: ${normalized.make} ${normalized.model} (${normalized.registration})`)

    return NextResponse.json({ vehicle: response }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[/api/vehicle/[slug]] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
