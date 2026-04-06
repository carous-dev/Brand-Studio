import { NextResponse } from 'next/server'
import { loadAllInventories, normalizeVehicle } from '@/app/lib/loadInventory'

function normalizeId(id: unknown) {
  return String(id).trim()
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const ids: string[] = Array.isArray(body?.ids)
      ? body.ids.map((id: unknown) => normalizeId(id)).filter(Boolean)
      : []
    const brand = body?.brand ? String(body.brand).toLowerCase().trim() : ''

    if (!ids.length) {
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    // Load inventories
    const allInventories = loadAllInventories()
    let inventory = allInventories.get(brand) || allInventories.get('main') || []

    // Normalize IDs for matching
    const idsLower = ids.map((id) => id.toLowerCase())
    const idsNoSpace = ids.map((id) => id.replace(/\s+/g, '').toLowerCase())

    // Find matching vehicles
    const items = []
    for (const item of inventory) {
      const normalized = normalizeVehicle(item)

      const matches = ids.some((id) => {
        const idLower = id.toLowerCase()
        const idNoSpace = idLower.replace(/\s+/g, '')

        return (
          (normalized.derivative_slug && normalized.derivative_slug.toLowerCase() === idLower) ||
          (normalized.registration && normalized.registration.toLowerCase() === idLower) ||
          (normalized.registration && normalized.registration.replace(/\s+/g, '').toLowerCase() === idNoSpace) ||
          (normalized.vin && normalized.vin.toLowerCase() === idLower) ||
          (normalized.reg && normalized.reg.toLowerCase() === idLower)
        )
      })

      if (matches) {
        items.push({
          vin: normalized.vin || null,
          reg: normalized.registration || normalized.vin || null,
          registration: normalized.registration || null,
          make: normalized.make || null,
          model: normalized.model || null,
          derivative: normalized.derivative || null,
          derivative_slug: normalized.derivative_slug || null,
          year: normalized.year || null,
          mileage: normalized.mileage || null,
          fuel: normalized.fuel_type || null,
          trans: normalized.transmission_type || null,
          body_type: normalized.body_type || null,
          price: normalized.price || null,
          description: normalized.description || null,
          image: item.image || '/images/placeholder.png'
        })
      }
    }

    console.log(`[/api/vehicles/batch] Found ${items.length} items for brand "${brand || 'main'}" from ${ids.length} requested IDs`)

    return NextResponse.json({ items }, { status: 200 })
  } catch (err) {
    console.error('[/api/vehicles/batch] Error:', err)
    return NextResponse.json({ error: 'Failed to load vehicles' }, { status: 500 })
  }
}
