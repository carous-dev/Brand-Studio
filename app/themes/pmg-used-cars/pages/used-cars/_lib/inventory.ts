/**
 * Server-side inventory data layer for the PMG used-cars pages.
 *
 * PORTED to brandstudio: the source app hit the external Carous `/inventory`
 * API with dealer headers; brandstudio serves per-brand inventory from the
 * SAME origin at `/api/inventory?brand=<slug>`. The response items are flat and
 * map directly onto `InventoryVehicle` (permissive shape), so no reshaping is
 * needed. When a caller doesn't pass a slug we resolve it from the request
 * (`x-brand` header / host) via `getBrandSlugFromRequest()`.
 */
import type { FilterMeta, FilterValues, InventoryVehicle } from "./types";
import { PER_PAGE, toName } from "./types";
import { getBrandSlugFromRequest } from "../../../lib/brand-slug.server";

function serverOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_INTERNAL_ORIGIN ||
    `http://127.0.0.1:${process.env.PORT || process.env.NEXT_INTERNAL_PORT || "3000"}`
  ).replace(/\/+$/, "");
}

async function resolveBrand(brandSlug?: string | null): Promise<string | null> {
  if (typeof brandSlug === "string" && brandSlug.trim()) return brandSlug.trim();
  if (brandSlug === null) return null;
  try {
    return await getBrandSlugFromRequest();
  } catch {
    return null;
  }
}

function inventoryUrl(params: URLSearchParams, brandSlug: string | null): string {
  if (brandSlug) params.set("brand", brandSlug);
  return `${serverOrigin()}/api/inventory?${params.toString()}`;
}

// Field paths for fuel + transmission (items are flat; may use `trans`).
function itemFuel(item: unknown): string {
  const it = item as Record<string, unknown>;
  return String(it?.fuel ?? it?.fuel_type ?? "").trim().toLowerCase();
}

function itemTransmission(item: unknown): string {
  const it = item as Record<string, unknown>;
  return String(it?.trans ?? it?.transmission ?? it?.transmission_type ?? "")
    .trim()
    .toLowerCase();
}

export async function fetchInventory(
  filters: FilterValues,
  brandSlug?: string | null,
): Promise<{ items: InventoryVehicle[]; total: number }> {
  const brand = await resolveBrand(brandSlug);
  const needsClientFilter = Boolean(filters.fuel) || Boolean(filters.transmission);

  const params = new URLSearchParams();
  if (needsClientFilter) {
    params.set("page", "1");
    params.set("per_page", "200");
  } else {
    params.set("page", String(filters.page));
    params.set("per_page", String(PER_PAGE));
  }
  params.set("sort", filters.sort);
  params.set("light", "1");
  if (filters.q) params.set("q", filters.q);
  if (filters.make) params.set("make", filters.make);
  if (filters.model) params.set("model", filters.model);
  if (filters.body) params.set("body", filters.body);
  if (filters.min_price) params.set("min_price", filters.min_price);
  if (filters.max_price) params.set("max_price", filters.max_price);
  if (filters.max_mileage) params.set("max_mileage", filters.max_mileage);

  try {
    const response = await fetch(inventoryUrl(params, brand), { cache: "no-store" });
    if (!response.ok) return { items: [], total: 0 };
    const payload = await response.json();
    const rawItems: InventoryVehicle[] = Array.isArray(payload?.items) ? payload.items : [];

    if (!needsClientFilter) {
      const total =
        Number(payload?.total) ||
        Number(payload?.pagination?.total) ||
        Number(payload?.meta?.total) ||
        rawItems.length;
      return { items: rawItems, total };
    }

    const fuelWanted = filters.fuel.toLowerCase();
    const transmissionWanted = filters.transmission.toLowerCase();
    const filtered = rawItems.filter((item) => {
      if (fuelWanted && itemFuel(item) !== fuelWanted) return false;
      if (transmissionWanted && itemTransmission(item) !== transmissionWanted) return false;
      return true;
    });

    const total = filtered.length;
    const start = (filters.page - 1) * PER_PAGE;
    const items = filtered.slice(start, start + PER_PAGE);
    return { items, total };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function fetchFilterMeta(brandSlug?: string | null): Promise<FilterMeta> {
  const brand = await resolveBrand(brandSlug);
  try {
    const params = new URLSearchParams({ per_page: "200", light: "1" });
    const response = await fetch(inventoryUrl(params, brand), { cache: "no-store" });
    if (!response.ok) return { makesToModels: {}, bodies: [], fuels: [], transmissions: [] };
    const payload = await response.json();
    const items: InventoryVehicle[] = Array.isArray(payload?.items) ? payload.items : [];

    const makeMap = new Map<string, Set<string>>();
    const bodySet = new Set<string>();
    const fuelSet = new Set<string>();
    const transmissionSet = new Set<string>();

    for (const item of items) {
      const make = toName(item.make);
      const model = toName(item.model);
      if (make) {
        if (!makeMap.has(make)) makeMap.set(make, new Set());
        if (model) makeMap.get(make)!.add(model);
      }
      const body = toName(item.body_type) || toName(item.bodyType) || toName(item.body);
      if (body) bodySet.add(body);
      const fuel = toName(item.fuel);
      if (fuel) fuelSet.add(fuel);
      const trans = toName(item.transmission) || toName(item.trans);
      if (trans) transmissionSet.add(trans);
    }

    const makesToModels: Record<string, string[]> = {};
    for (const [k, v] of makeMap.entries()) makesToModels[k] = Array.from(v).sort();

    return {
      makesToModels,
      bodies: Array.from(bodySet).sort(),
      fuels: Array.from(fuelSet).sort(),
      transmissions: Array.from(transmissionSet).sort(),
    };
  } catch {
    return { makesToModels: {}, bodies: [], fuels: [], transmissions: [] };
  }
}
