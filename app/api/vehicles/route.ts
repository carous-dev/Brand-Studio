import { NextRequest, NextResponse } from 'next/server'
import { resolveBrandInventory, extractPresetsFromInventory } from '@/app/lib/loadInventory'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const makes = url.searchParams.get('makes')
    const make = url.searchParams.get('make')
    const brand = url.searchParams.get('brand')

    // Load inventory for specified brand or main inventory
    const inventory = await resolveBrandInventory(brand || undefined)
    const presets = extractPresetsFromInventory(inventory)

    // If requesting all makes
    if (makes === 'true') {
      return NextResponse.json(presets, {
        headers: { 'Cache-Control': 'no-store' }
      })
    }

    // If requesting models for a specific make
    if (make) {
      const models = presets.models.get(make) || []
      return NextResponse.json({ models }, {
        headers: { 'Cache-Control': 'no-store' }
      })
    }

    return NextResponse.json(
      { error: 'Missing parameters: makes=true or make=<brand>' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('GET /api/vehicles error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vehicle data' },
      { status: 500 }
    )
  }
}
