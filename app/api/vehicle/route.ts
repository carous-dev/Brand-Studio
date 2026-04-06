import { NextResponse } from 'next/server'
import { generateVehicleSlug, loadBrandInventoryStrict, loadInventoryByBrand } from '@/app/lib/loadInventory'
import { getBrandFromHost } from '@/config/domains'
import { fetchBrandByHost, fetchBrandBySlug } from '@/app/lib/brandApi'

function buildSpecsGroups(vehicleRow: any, advertRow: any, vehicleHistory: any) {
  // helper to pick first non-empty value from possible fields across provided objects
  function pick(...keys: string[]) {
    for (const k of keys) {
      const parts = k.split('.')
      for (const src of [vehicleRow, advertRow, vehicleHistory]) {
        if (!src) continue
        let v: any = src
        let ok = true
        for (const p of parts) {
          if (v == null) { ok = false; break }
          v = v[p]
        }
        if (ok && v != null && v !== '') return v
      }
    }
    return null
  }

  const perfMap: Array<[string, string[]]> = [
    ['0-60mph', ['acceleration_0_60', 'zero_to_sixty', 'zeroToSixty', 'accel_0_60']],
    ['Top speed', ['top_speed', 'topSpeed']],
    ['Cylinders', ['cylinders', 'cylinder_count', 'engine_cylinders']],
    ['Valves', ['valves', 'valve_count']],
    ['Engine power', ['engine_power_bhp', 'engine_power', 'power', 'bhp']],
    ['Engine torque', ['engine_torque_nm', 'engine_torque', 'torque']],
    ['Miles per gallon', ['mpg', 'miles_per_gallon', 'fuel_consumption_combined', 'fuel_economy_nedc_combined_mpg']],
    ['CO2', ['co2_emission_gpkm', 'co2']]
  ]

  const sizeMap: Array<[string, string[]]> = [
    ['Height', ['height_mm', 'height']],
    ['Length', ['length_mm', 'length']],
    ['Width', ['width_mm', 'width']],
    ['Wheelbase', ['wheelbase_mm', 'wheelbase']],
    ['Seats', ['seats', 'number_of_seats']],
    ['Fuel tank capacity', ['fuel_tank_capacity_l', 'fuel_tank_capacity', 'fuel_tank']],
    ['Boot space (seats down)', ['boot_space_down_l', 'boot_space', 'boot_space_seats_down']],
    ['Boot space (seats up)', ['boot_space_up_l', 'boot_space_up', 'boot_space_seats_up']],
    ['Minimum kerb weight', ['kerb_weight_kg', 'kerb_weight', 'minimum_kerb_weight']]
  ]

  // Format raw values into human-friendly strings per-label
  function formatValue(label: string, raw: any) {
    if (raw == null || raw === '') return ''
    // try to extract numeric value when possible
    const s = String(raw).trim()
    const num = Number(s.replace(/[^0-9.\-]/g, ''))

    if (!isNaN(num)) {
      // Miles per gallon -> two decimals
      if (/miles per gallon|mpg|fuel_economy/i.test(label)) return num.toFixed(2)
      // CO2 -> integer g/km
      if (/co2|co2 emission/i.test(label)) return String(Math.round(num))
      // For common whole-number specs like cylinders, seats, power — prefer integer representation
      if (/cylinders|seats|valves|power|engine power|engine torque|wheelbase|height|length|width|kerb weight|weight|capacity/i.test(label)) {
        return Number.isInteger(num) ? String(Math.round(num)) : String(num)
      }
      // default: show number without unnecessary trailing zeros
      return (num % 1 === 0) ? String(Math.round(num)) : String(num)
    }

    return s
  }

  const performanceItems: any[] = []
  for (const [label, keys] of perfMap) {
    const v = pick(...keys)
    if (v != null && v !== '') performanceItems.push({ name: label, value: formatValue(label, v) })
  }

  const sizeItems: any[] = []
  for (const [label, keys] of sizeMap) {
    const v = pick(...keys)
    if (v != null && v !== '') sizeItems.push({ name: label, value: formatValue(label, v) })
  }

  const groups: any[] = []
  groups.push({ category: 'Performance', count: String(performanceItems.length), items: performanceItems })
  groups.push({ category: 'Size and dimensions', count: String(sizeItems.length), items: sizeItems })
  return groups
}

function sortImagesByLabel(mediaRows: any[]): string[] {
  // Standard gallery label order
  const labelOrder = [
    'Front Left',
    'Front',
    'Front Right',
    'Side Left',
    'Side Right',
    'Rear Left',
    'Rear',
    'Rear Right',
    'Badge Exterior',
    'Wheel',
    'Engine',
    'Interior Front',
    'Seat Driver',
    'Seat Front Passenger',
    'Seats Rear',
    'Cargo Space',
    'Boot',
    'Steering Wheel',
    'Driver Instruments',
    'Infotainment System',
    'Door Interior',
    'Pedals',
    'Misc Controls',
    'Documentation',
    'Inconclusive'
  ]

  // Build a map of label -> index for quick lookup
  const labelIndex = new Map<string, number>()
  labelOrder.forEach((label, idx) => {
    labelIndex.set(label.toLowerCase(), idx)
  })

  // Extract URLs and sort by tag/label priority
  const withLabels = mediaRows
    .map((m: any) => ({
      url: m.href ?? m.url ?? '',
      // Get the label from media_tag table (from joined query), or fallback to source
      label: (m.label || m.source || 'Other').toLowerCase()
    }))
    .filter(item => item.url)
    .sort((a, b) => {
      const aIdx = labelIndex.get(a.label) ?? labelOrder.length
      const bIdx = labelIndex.get(b.label) ?? labelOrder.length
      return aIdx - bIdx
    })

  // Normalize URLs and dedupe while preserving order
  const seen = new Set<string>()
  const images: string[] = []
  withLabels.forEach(item => {
    try {
      const normalized = String(item.url).replace(/\d+x\d+/, '{resize}')
      if (!seen.has(normalized)) {
        seen.add(normalized)
        images.push(normalized)
      }
    } catch { /* ignore invalid */ }
  })

  return images
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const slug = (url.searchParams.get('slug') || url.searchParams.get('car') || url.searchParams.get('reg') || '').trim()
    if (!slug) return NextResponse.json({ error: 'missing slug/reg parameter' }, { status: 400 })

    const queryBrand = (url.searchParams.get('brand') || '').toLowerCase().trim()
    const xBrandHeader = (req.headers.get('x-brand') || '').toLowerCase().trim()
    const host =
      req.headers.get('x-forwarded-host') ||
      req.headers.get('x-original-host') ||
      req.headers.get('host') ||
      'localhost'

    // Resolve brand robustly:
    // 1) explicit query param
    // 2) trusted x-brand header (if it resolves)
    // 3) host lookup via previews API
    // 4) deterministic host fallback
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

    // Keep behavior aligned with /api/inventory:
    // prefer strict brand inventory, but fall back to the main inventory file when absent.
    const strictInventory = loadBrandInventoryStrict(brand)
    const inventory = strictInventory.length > 0 ? strictInventory : loadInventoryByBrand(brand)
    if (!inventory || inventory.length === 0) {
      return NextResponse.json({ error: 'brand inventory not found' }, { status: 404 })
    }

    const slugLower = slug.toLowerCase()
    const normalizedLookup = slugLower.replace(/[^a-z0-9]/g, '')

    // Find vehicle strictly within brand inventory
    const found = inventory.find((item: any) => {
      const generatedSlug = generateVehicleSlug(item as any)
      const explicitSlug = (item.slug || item.derivative_slug || '').toString().toLowerCase()
      const itemSlug = explicitSlug || generatedSlug
      const normalizedItemSlug = itemSlug.replace(/[^a-z0-9]/g, '')
      const reg = (item.reg || item.registration || '').toString().toLowerCase()
      const normalizedReg = reg.replace(/[^a-z0-9]/g, '')
      return (
        itemSlug === slugLower ||
        Boolean(normalizedLookup && normalizedItemSlug && normalizedItemSlug === normalizedLookup) ||
        reg === slugLower ||
        Boolean(normalizedLookup && normalizedReg && normalizedReg === normalizedLookup)
      )
    })

    if (!found) {
      return NextResponse.json({ error: 'Vehicle not found in brand inventory' }, { status: 404 })
    }

    return NextResponse.json({ vehicle: found }, { status: 200 })
  } catch (err) {
    console.error('[/api/vehicle] Error:', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
