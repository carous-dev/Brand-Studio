"use client";

import { apiUrl } from "../../../lib/api";
import type { ClientFilters, InventoryVehicle } from "./types";
import { PER_PAGE } from "./types";

// The upstream `/inventory` endpoint silently ignores `fuel` + `transmission`.
// When either is set we fetch the whole collection with the remaining
// server-side filters applied, refine client-side, then paginate locally.
// Mirrors the server-side fetchInventory() so client + SSR results match.
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

export async function fetchInventoryClient(
  filters: ClientFilters,
  signal?: AbortSignal,
  brandSlug?: string | null,
): Promise<{ items: InventoryVehicle[]; total: number }> {
  const needsClientFilter = Boolean(filters.fuel) || Boolean(filters.transmission);

  const params = new URLSearchParams();
  params.set("per_page", needsClientFilter ? "200" : String(PER_PAGE));
  params.set("page", needsClientFilter ? "1" : String(filters.page));
  params.set("sort", filters.sort || "newest");
  if (brandSlug) params.set("brand", brandSlug);
  if (filters.q) params.set("q", filters.q);
  if (filters.make) params.set("make", filters.make);
  if (filters.model) params.set("model", filters.model);
  if (filters.body) params.set("body", filters.body);
  if (filters.minPrice) params.set("min_price", filters.minPrice);
  if (filters.maxPrice) params.set("max_price", filters.maxPrice);
  if (filters.maxMileage) params.set("max_mileage", filters.maxMileage);

  try {
    const res = await fetch(apiUrl(`/inventory?${params.toString()}`), {
      cache: "no-store",
      signal,
    });
    if (!res.ok) return { items: [], total: 0 };
    const payload = await res.json();
    const raw: InventoryVehicle[] = Array.isArray(payload?.items) ? payload.items : [];

    if (!needsClientFilter) {
      const total =
        Number(payload?.total) ||
        Number(payload?.pagination?.total) ||
        Number(payload?.meta?.total) ||
        raw.length;
      return { items: raw, total };
    }

    const fuelWanted = filters.fuel.toLowerCase();
    const transmissionWanted = filters.transmission.toLowerCase();
    const filtered = raw.filter((it) => {
      if (fuelWanted && itemFuel(it) !== fuelWanted) return false;
      if (transmissionWanted && itemTransmission(it) !== transmissionWanted) return false;
      return true;
    });
    const start = (filters.page - 1) * PER_PAGE;
    return { items: filtered.slice(start, start + PER_PAGE), total: filtered.length };
  } catch {
    return { items: [], total: 0 };
  }
}
