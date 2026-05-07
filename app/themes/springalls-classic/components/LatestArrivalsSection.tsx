import LatestArrivalsSectionClient from "./LatestArrivalsSectionClient"
import { apiUrl } from "../lib/api"
import { normalizeInventoryItem, type InventoryVehicle } from "../lib/inventory"

const normalizeItems = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object") {
    const typed = data as any
    if (Array.isArray(typed.items)) return typed.items
    if (Array.isArray(typed.vehicles)) return typed.vehicles
  }
  return []
}

async function getLatestArrivals(): Promise<InventoryVehicle[]> {
  try {
    const response = await fetch(apiUrl("/featured-vehicles?sort=price_desc"), { cache: "no-store" })
    if (!response.ok) return []

    const contentType = response.headers.get("content-type") || ""
    const raw = await response.text()
    if (!raw.trim()) return []

    if (contentType.includes("application/json") || raw.trim().startsWith("[") || raw.trim().startsWith("{")) {
      const items = normalizeItems(JSON.parse(raw))
      return items.map(normalizeInventoryItem).filter(Boolean) as InventoryVehicle[]
    }
  } catch {
    return []
  }

  return []
}

export default async function LatestArrivalsSection() {
  const vehicles = await getLatestArrivals()
  if (!vehicles.length) return null
  return <LatestArrivalsSectionClient vehicles={vehicles} />
}
