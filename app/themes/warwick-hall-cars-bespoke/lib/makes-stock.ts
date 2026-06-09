import { apiUrl } from './api'
import {
  normaliseMakeName,
  resolveLogoSlug,
  toMakeUrlSlug,
} from './make-logos'

/**
 * Live in-stock make list. Ported from kainmotors' fetchMakesInStock so the
 * BrowseByMakes section can render real brand glyphs alongside the count.
 * Adapted for brandstudio: requires a brand slug (server fetches resolve to
 * 127.0.0.1 without it — see SKILL Pitfall row 14) and reads the brandstudio
 * inventory response shape ({ items, meta }).
 */
export type MakeStockEntry = {
  /** Display name as it appears in inventory (proper case, e.g. "Mercedes-Benz"). */
  name: string
  /** URL-safe slug (e.g. "mercedes-benz", "land-rover"). */
  slug: string
  /** Live count of non-excluded items in stock. */
  count: number
  /** simple-icons CDN slug (e.g. "mercedes"), or null if no curated mapping. */
  logoSlug: string | null
}

type InventoryItem = {
  make?: unknown
  vehicle?: { make?: unknown } | null
  status?: string
  stock_status?: string
  advert?: { status?: string; stock_status?: string } | null
}

const EXCLUDED_STATUSES = new Set([
  'sold',
  'sale_pending',
  'reserved',
  'archived',
  'deleted',
  'withdrawn',
  'hidden',
])

function readMakeFromItem(item: InventoryItem): string {
  const candidates: unknown[] = [
    item?.make,
    item?.vehicle?.make,
    (item as any)?.make_name,
    (item as any)?.makeName,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c
    if (c && typeof c === 'object') {
      const named = (c as any).name ?? (c as any).label
      if (typeof named === 'string' && named.trim()) return named
    }
  }
  return ''
}

function readStatusFromItem(item: InventoryItem): string {
  const raw =
    item?.stock_status ??
    item?.status ??
    item?.advert?.stock_status ??
    item?.advert?.status ??
    ''
  return String(raw).toLowerCase()
}

export async function fetchMakesInStock(
  brandSlug: string,
  options: { signal?: AbortSignal } = {},
): Promise<MakeStockEntry[]> {
  if (!brandSlug) return []
  const params = new URLSearchParams({
    brand: brandSlug,
    page: '1',
    per_page: '250',
    published_only: '1',
  })
  try {
    const res = await fetch(apiUrl(`/api/inventory?${params.toString()}`), {
      signal: options.signal,
    })
    if (!res.ok) return []
    const payload = (await res.json()) as { items?: InventoryItem[] } | unknown
    const p = payload as any
    const items: InventoryItem[] = Array.isArray(p?.items)
      ? p.items
      : Array.isArray(p?.vehicles)
        ? p.vehicles
        : Array.isArray(p)
          ? p
          : []
    const counts = new Map<string, number>()
    for (const item of items) {
      const status = readStatusFromItem(item)
      if (EXCLUDED_STATUSES.has(status)) continue
      const make = normaliseMakeName(readMakeFromItem(item))
      if (!make) continue
      counts.set(make, (counts.get(make) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        slug: toMakeUrlSlug(name),
        count,
        logoSlug: resolveLogoSlug(name),
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  } catch {
    return []
  }
}
