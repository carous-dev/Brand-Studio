import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brand, forceRefresh } = body

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand parameter is required' },
        { status: 400 }
      )
    }

    // Import inventory loading functions
    const { loadBrandInventoryStrict, loadInventoryByBrand } = await import('@/app/lib/loadInventory')
    
    // Load inventory for the specified brand
    const inventory = forceRefresh 
      ? loadInventoryByBrand(brand)
      : loadBrandInventoryStrict(brand)

    if (!inventory || inventory.length === 0) {
      return NextResponse.json(
        { error: 'No inventory found for brand', brand },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      brand,
      count: inventory.length,
      inventory: inventory.slice(0, 10), // Return first 10 items for preview
      lastSync: new Date().toISOString()
    })
  } catch (error) {
    console.error('[POST /api/inventory/sync] Error:', error)
    return NextResponse.json(
      { error: 'Failed to sync inventory' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get('brand')

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand parameter is required' },
        { status: 400 }
      )
    }

    // Import inventory loading functions
    const { loadBrandInventoryStrict } = await import('@/app/lib/loadInventory')
    
    const inventory = loadBrandInventoryStrict(brand)

    if (!inventory || inventory.length === 0) {
      return NextResponse.json(
        { error: 'No inventory found for brand', brand },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      brand,
      count: inventory.length,
      lastSync: new Date().toISOString()
    })
  } catch (error) {
    console.error('[GET /api/inventory/sync] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get inventory status' },
      { status: 500 }
    )
  }
}