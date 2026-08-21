/**
 * Client-side wishlist + compare store for the dealer inventory.
 *
 * Each saved vehicle is persisted as a JSON snapshot of its card display data
 * (keyed by slug) so the /wishlist and /compare pages can render entirely from
 * localStorage — no client-side vehicle API round-trip needed. Storage-key
 * prefixes + update events are the Carous fleet standard (`vp-…`), so a buyer's
 * saved list is consistent across every dealer site that uses this package.
 *
 * All functions are safe to call during SSR (they no-op when `window` is
 * undefined) — client components read real state in a mount effect.
 */

export type SavedVehicle = {
  slug: string;
  href: string;
  title: string;
  price: string;
  image: string;
  year: string;
  mileage: string;
  transmission: string;
  fuel: string;
};

export type SavedKind = "wishlist" | "compare";

export const WISHLIST_PREFIX = "vp-vehicle-wishlist:";
export const COMPARE_PREFIX = "vp-vehicle-compare:";
export const WISHLIST_EVENT = "vp:wishlist-updated";
export const COMPARE_EVENT = "vp:compare-updated";

/** Compare is capped so the side-by-side table stays readable. */
export const MAX_COMPARE = 3;

function config(kind: SavedKind): { prefix: string; event: string } {
  return kind === "wishlist"
    ? { prefix: WISHLIST_PREFIX, event: WISHLIST_EVENT }
    : { prefix: COMPARE_PREFIX, event: COMPARE_EVENT };
}

function storageKey(kind: SavedKind, slug: string): string {
  return `${config(kind).prefix}${slug}`;
}

function emit(kind: SavedKind): void {
  window.dispatchEvent(new CustomEvent(config(kind).event));
}

export function readSaved(kind: SavedKind): SavedVehicle[] {
  if (typeof window === "undefined") return [];
  const { prefix } = config(kind);
  const out: SavedVehicle[] = [];
  for (const key of Object.keys(window.localStorage)) {
    if (!key.startsWith(prefix)) continue;
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as SavedVehicle;
      if (parsed && typeof parsed === "object" && parsed.slug) out.push(parsed);
    } catch {
      // Ignore malformed entries.
    }
  }
  return out;
}

export function countSaved(kind: SavedKind): number {
  return readSaved(kind).length;
}

export function isSaved(kind: SavedKind, slug: string): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(storageKey(kind, slug)));
}

/**
 * Toggle a vehicle in the given store. Returns the new saved state, plus a
 * `limited` flag when a compare add was rejected for hitting MAX_COMPARE.
 */
export function toggleSaved(kind: SavedKind, vehicle: SavedVehicle): { saved: boolean; limited: boolean } {
  if (typeof window === "undefined") return { saved: false, limited: false };
  const key = storageKey(kind, vehicle.slug);
  const already = Boolean(window.localStorage.getItem(key));

  if (already) {
    window.localStorage.removeItem(key);
    emit(kind);
    return { saved: false, limited: false };
  }

  if (kind === "compare" && countSaved("compare") >= MAX_COMPARE) {
    return { saved: false, limited: true };
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(vehicle));
  } catch {
    return { saved: false, limited: false };
  }
  emit(kind);
  return { saved: true, limited: false };
}

export function removeSaved(kind: SavedKind, slug: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(kind, slug));
  emit(kind);
}

export function clearSaved(kind: SavedKind): void {
  if (typeof window === "undefined") return;
  const { prefix } = config(kind);
  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith(prefix)) window.localStorage.removeItem(key);
  }
  emit(kind);
}

/** Subscribe to changes for a store (same-tab custom event + cross-tab storage). */
export function subscribeSaved(kind: SavedKind, callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const { prefix, event } = config(kind);
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(prefix)) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(event, callback as EventListener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(event, callback as EventListener);
  };
}
