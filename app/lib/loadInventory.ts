import * as fs from 'fs'
import * as path from 'path'

export interface VehicleItem {
  vin?: string
  registration?: string
  reg?: string
  make?: string
  model?: string
  derivative?: string
  derivative_slug?: string
  year?: number
  body_type?: string
  fuel_type?: string
  fuel?: string
  transmission_type?: string
  trans?: string
  colour?: string
  engine_capacity_cc?: number
  engine_power_bhp?: number
  seats?: number
  doors?: number
  mileage?: number
  odometer_reading_miles?: number
  price?: number
  forecourt_price_gbp?: number
  description?: string
  status?: string
  featured?: boolean
  [key: string]: any
}

/**
 * Load inventory for a specific brand
 * Falls back to main inventory if brand-specific inventory doesn't exist
 */
export function loadInventoryByBrand(brand?: string): VehicleItem[] {
  try {
    let inventoryPath: string

    if (brand && brand.length > 0) {
      // Try to load brand-specific inventory
      inventoryPath = path.join(
        process.cwd(),
        `app/data/inventories/${brand.toLowerCase()}-inventory.json`
      )

      if (!fs.existsSync(inventoryPath)) {
        console.warn(
          `Brand inventory not found: ${inventoryPath}, falling back to main inventory`
        )
        // Fall back to main inventory
        inventoryPath = path.join(process.cwd(), 'app/data/inventory.json')
      }
    } else {
      // No brand specified, use main inventory
      inventoryPath = path.join(process.cwd(), 'app/data/inventory.json')
    }

    const data = JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'))
    return Array.isArray(data) ? data : data.items || []
  } catch (error) {
    console.error(`Failed to load inventory for brand "${brand}":`, error)
    return []
  }
}

/**
 * Load brand inventory without falling back to main inventory.
 * If `brand` is provided and the brand-specific file does not exist,
 * returns an empty array instead of falling back.
 */
export function loadBrandInventoryStrict(brand?: string): VehicleItem[] {
  try {
    let inventoryPath: string

    if (brand && brand.length > 0) {
      inventoryPath = path.join(
        process.cwd(),
        `app/data/inventories/${brand.toLowerCase()}-inventory.json`
      )

      if (!fs.existsSync(inventoryPath)) {
        // Do NOT fall back to main inventory for strict load
        return []
      }
    } else {
      // No brand specified, load main inventory
      inventoryPath = path.join(process.cwd(), 'app/data/inventory.json')
      if (!fs.existsSync(inventoryPath)) return []
    }

    const data = JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'))
    return Array.isArray(data) ? data : data.items || []
  } catch (error) {
    console.error(`Failed to strictly load inventory for brand "${brand}":`, error)
    return []
  }
}

/**
 * Load all available inventories (main + all brand-specific)
 */
export function loadAllInventories(): Map<string, VehicleItem[]> {
  const inventories = new Map<string, VehicleItem[]>()

  try {
    // Load main inventory
    const mainInventory = loadInventoryByBrand()
    inventories.set('main', mainInventory)

    // Load brand-specific inventories
    const inventoriesDir = path.join(process.cwd(), 'app/data/inventories')
    if (fs.existsSync(inventoriesDir)) {
      const files = fs.readdirSync(inventoriesDir)
      for (const file of files) {
        if (file.endsWith('-inventory.json')) {
          const brandSlug = file.replace('-inventory.json', '')
          const brandInventory = loadInventoryByBrand(brandSlug)
          inventories.set(brandSlug, brandInventory)
        }
      }
    }
  } catch (error) {
    console.error('Failed to load all inventories:', error)
  }

  return inventories
}

/**
 * Normalize vehicle data from inventory - converts field names to canonical form
 */
export function normalizeVehicle(item: VehicleItem): VehicleItem {
  return {
    vin: item.vin,
    registration: item.registration || item.reg,
    reg: item.registration || item.reg,
    make: item.make,
    model: item.model,
    derivative: item.derivative,
    derivative_slug: item.derivative_slug,
    year: item.year,
    body_type: item.body_type,
    fuel_type: item.fuel_type || item.fuel,
    fuel: item.fuel_type || item.fuel,
    transmission_type: item.transmission_type || item.trans,
    trans: item.transmission_type || item.trans,
    colour: item.colour,
    engine_capacity_cc: item.engine_capacity_cc,
    engine_power_bhp: item.engine_power_bhp,
    seats: item.seats,
    doors: item.doors,
    mileage: item.odometer_reading_miles || item.mileage,
    odometer_reading_miles: item.odometer_reading_miles || item.mileage,
    price: item.price || item.forecourt_price_gbp,
    forecourt_price_gbp: item.price || item.forecourt_price_gbp,
    description: item.description,
    status: item.status || 'publish',
    featured: item.featured || false,
    ...item // Include any additional fields
  }
}

/**
 * Generate slug for a vehicle
 */
export function slugifyParts(...parts: Array<string | number | undefined>): string {
  const joined = parts.filter(Boolean).join(' ')
  return String(joined)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Generate detailed vehicle slug matching inventory format.
 * Example result: ford-focus-1-5-tdci-zetec-euro-6-s-s-5dr-101-000-miles-3990-101000-202601068964821
 */
export function generateVehicleSlug(item: VehicleItem): string {
  try {
    const normalized = normalizeVehicle(item)

    const subtitle = (item.subTitle || (item as any).sub_title || '') as string
    const sub = subtitle.toString().toLowerCase()

    // engine size: look for a decimal like 1.5 in subtitle, else derive from cc
    let engineSize = ''
    const engMatch = sub.match(/(\d+\.\d+)/)
    if (engMatch) {
      engineSize = engMatch[1].replace('.', '-')
    } else if (normalized.engine_capacity_cc) {
      const litres = Number(normalized.engine_capacity_cc) / 1000
      engineSize = String(Math.round(litres * 10) / 10).replace('.', '-')
    }

    // engine type: try to capture common token after engine size (e.g. tdci, dci, tdi)
    let engineType = ''
    if (engMatch) {
      const after = sub.slice(sub.indexOf(engMatch[0]) + engMatch[0].length)
      const token = after.match(/\s*([a-z0-9\-]{2,15})/)
      if (token) engineType = token[1].replace(/[^a-z0-9\-]/g, '')
    }

    // derivative / trim
    let derivative = (normalized.derivative || '').toString().toLowerCase()
    if (!derivative && sub) {
      const euroIdx = sub.indexOf('euro')
      const endIdx = euroIdx > -1 ? euroIdx : sub.indexOf('(')
      const segment = endIdx > -1 ? sub.slice(0, endIdx) : sub
      const withoutEngine = segment.replace(/(\d+\.\d+)|\b(s\/s)\b|\b(euro)\b/gi, '')
      // take last words (likely trim)
      const segParts = withoutEngine.split(/\s|\u2022/).map(s => s.trim()).filter(Boolean)
      if (segParts.length > 1) {
        derivative = segParts.slice(1).join(' ')
      }
    }

    // euro standard
    const euroMatch = sub.match(/euro\s*(\d+)/)
    const euro = euroMatch ? `euro-${euroMatch[1]}` : ''

    // start/stop marker
    const ss = /\(s\/s\)/.test(sub) ? 's-s' : ''

    // doors
    let doors = ''
    const doorsMatch = sub.match(/(\d)dr/)
    if (doorsMatch) doors = `${doorsMatch[1]}dr`
    else if (normalized.doors) doors = `${normalized.doors}dr`

    // mileage formatting
    const milesNum = normalized.mileage || 0
    const milesHyphen = milesNum ? milesNum.toLocaleString('en-GB').replace(/,/g, '-') : ''
    const milesSegment = milesHyphen ? `${milesHyphen}-miles` : ''
    const milesRaw = milesNum ? String(milesNum) : ''

    const price = normalized.price ? String(normalized.price) : ''

    const reg = (normalized.registration || normalized.reg || normalized.vin || '').toString()

    const parts: string[] = []
    if (normalized.make) parts.push(normalized.make)
    if (normalized.model) parts.push(normalized.model)
    if (engineSize) parts.push(engineSize)
    if (engineType) parts.push(engineType)
    if (derivative) parts.push(derivative)
    if (euro) parts.push(euro)
    if (ss) parts.push(ss)
    if (doors) parts.push(doors)
    if (milesSegment) parts.push(milesSegment)
    if (price) parts.push(price)
    if (milesRaw) parts.push(milesRaw)
    if (reg) parts.push(reg)

    const slug = parts
      .filter(Boolean)
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9\-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')

    return slug
  } catch (err) {
    console.error('generateVehicleSlug error:', err)
    return slugifyParts(item.make, item.model, item.derivative, item.price, item.mileage, item.registration)
  }
}

/**
 * Extract unique values from inventory (for filters/presets)
 */
export function extractPresetsFromInventory(inventory: VehicleItem[]): {
  makes: string[]
  years: number[]
  prices: number[]
  models: Map<string, string[]>
} {
  const makesSet = new Set<string>()
  const yearsSet = new Set<number>()
  const pricesSet = new Set<number>()
  const modelsByMake = new Map<string, Set<string>>()

  for (const v of inventory) {
    if (v.make) {
      makesSet.add(v.make)
      if (!modelsByMake.has(v.make)) {
        modelsByMake.set(v.make, new Set())
      }
      if (v.model) {
        modelsByMake.get(v.make)!.add(v.model)
      }
    }
    if (v.year) yearsSet.add(v.year)
    if (v.price || v.forecourt_price_gbp) {
      const price = v.price || v.forecourt_price_gbp
      if (price) pricesSet.add(price)
    }
  }

  // Convert models set map to string array map
  const models = new Map<string, string[]>()
  modelsByMake.forEach((modelSet, make) => {
    models.set(make, Array.from(modelSet).sort())
  })

  return {
    makes: Array.from(makesSet).sort(),
    years: Array.from(yearsSet).sort((a, b) => b - a),
    prices: Array.from(pricesSet).sort((a, b) => a - b),
    models
  }
}

/**
 * Filter inventory based on query parameters
 */
export function filterInventory(
  inventory: VehicleItem[],
  filters: {
    q?: string
    make?: string
    model?: string
    body?: string
    year?: number
    min_year?: number
    max_year?: number
    price?: string
    min_price?: number
    max_price?: number
    fuel?: string
    trans?: string
    featured?: boolean
  }
): VehicleItem[] {
  return inventory.filter((item) => {
    const normalized = normalizeVehicle(item)

    // Search query filter
    if (filters.q) {
      const searchStr = `${normalized.make || ''} ${normalized.model || ''} ${normalized.description || ''} ${normalized.registration || ''}`.toLowerCase()
      if (!searchStr.includes(filters.q.toLowerCase())) return false
    }

    // Make filter
    if (filters.make) {
      if (!normalized.make?.toLowerCase().includes(filters.make.toLowerCase())) return false
    }

    // Model filter
    if (filters.model) {
      if (!normalized.model?.toLowerCase().includes(filters.model.toLowerCase())) return false
    }

    // Body type filter
    if (filters.body) {
      if (!normalized.body_type?.toLowerCase().includes(filters.body.toLowerCase())) return false
    }

    // Year filter (exact match or range)
    if (filters.year && normalized.year !== filters.year) return false
    if (filters.min_year && (!normalized.year || normalized.year < filters.min_year)) return false
    if (filters.max_year && (!normalized.year || normalized.year > filters.max_year)) return false

    // Price filter
    if (filters.price) {
      const [minStr, maxStr] = filters.price.split('-')
      const min = parseInt(minStr, 10)
      const max = parseInt(maxStr, 10)
      const price = normalized.price || 0
      if (price < min || price > max) return false
    }
    if (filters.min_price && (!normalized.price || normalized.price < filters.min_price)) return false
    if (filters.max_price && (!normalized.price || normalized.price > filters.max_price)) return false

    // Fuel type filter
    if (filters.fuel) {
      if (!normalized.fuel_type?.toLowerCase().includes(filters.fuel.toLowerCase())) return false
    }

    // Transmission filter
    if (filters.trans) {
      if (!normalized.transmission_type?.toLowerCase().includes(filters.trans.toLowerCase())) return false
    }

    // Featured filter
    if (filters.featured && !normalized.featured) return false

    return true
  })
}

/**
 * Sort inventory by various criteria
 */
export function sortInventory(
  inventory: VehicleItem[],
  sort?: string,
  limit?: number
): VehicleItem[] {
  let sorted = [...inventory]

  switch (sort?.toLowerCase()) {
    case 'newest':
      sorted.sort((a, b) => {
        const aYear = a.year || 0
        const bYear = b.year || 0
        return bYear - aYear
      })
      break

    case 'oldest':
      sorted.sort((a, b) => {
        const aYear = a.year || 0
        const bYear = b.year || 0
        return aYear - bYear
      })
      break

    case 'price-asc':
    case 'price-low':
      sorted.sort((a, b) => {
        const aPrice = a.price || a.forecourt_price_gbp || 0
        const bPrice = b.price || b.forecourt_price_gbp || 0
        return aPrice - bPrice
      })
      break

    case 'price-desc':
    case 'price-high':
      sorted.sort((a, b) => {
        const aPrice = a.price || a.forecourt_price_gbp || 0
        const bPrice = b.price || b.forecourt_price_gbp || 0
        return bPrice - aPrice
      })
      break

    case 'mileage-low':
    case 'mileage-asc':
      sorted.sort((a, b) => {
        const aMileage = a.mileage || a.odometer_reading_miles || 0
        const bMileage = b.mileage || b.odometer_reading_miles || 0
        return aMileage - bMileage
      })
      break

    case 'mileage-high':
    case 'mileage-desc':
      sorted.sort((a, b) => {
        const aMileage = a.mileage || a.odometer_reading_miles || 0
        const bMileage = b.mileage || b.odometer_reading_miles || 0
        return bMileage - aMileage
      })
      break

    case 'featured':
      sorted.sort((a, b) => {
        const aFeatured = a.featured ? 1 : 0
        const bFeatured = b.featured ? 1 : 0
        return bFeatured - aFeatured
      })
      break

    default:
      // 'newest' is default
      sorted.sort((a, b) => {
        const aYear = a.year || 0
        const bYear = b.year || 0
        return bYear - aYear
      })
  }

  if (limit && limit > 0) {
    sorted = sorted.slice(0, limit)
  }

  return sorted
}

/**
 * Paginate inventory results
 */
export function paginateInventory(
  inventory: VehicleItem[],
  page: number = 1,
  perPage: number = 12
): {
  items: VehicleItem[]
  page: number
  per_page: number
  total: number
  total_pages: number
} {
  const total = inventory.length
  const total_pages = Math.ceil(total / perPage)
  const actualPage = Math.max(1, Math.min(page, total_pages || 1))
  const start = (actualPage - 1) * perPage
  const items = inventory.slice(start, start + perPage)

  return {
    items,
    page: actualPage,
    per_page: perPage,
    total,
    total_pages
  }
}
