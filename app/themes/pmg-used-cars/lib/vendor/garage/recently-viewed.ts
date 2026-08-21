import type { SavedVehicle } from "./saved-vehicles";

/**
 * "Recently viewed" store — an ordered, deduped list of the last few vehicles
 * a buyer opened, kept in one localStorage array (most-recent first). Reuses
 * the SavedVehicle snapshot shape so cards render without an API call.
 */
export const RECENT_KEY = "vp-recent-vehicles";
export const RECENT_EVENT = "vp:recent-updated";
export const MAX_RECENT = 12;

export function readRecent(): SavedVehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedVehicle[]).filter((v) => v && v.slug) : [];
  } catch {
    return [];
  }
}

/** Record a viewed vehicle at the front of the list (deduped by slug, capped). */
export function recordRecent(vehicle: SavedVehicle): void {
  if (typeof window === "undefined" || !vehicle?.slug) return;
  const next = [vehicle, ...readRecent().filter((v) => v.slug !== vehicle.slug)].slice(0, MAX_RECENT);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    return;
  }
  window.dispatchEvent(new CustomEvent(RECENT_EVENT));
}

export function clearRecent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {
    return;
  }
  window.dispatchEvent(new CustomEvent(RECENT_EVENT));
}

export function subscribeRecent(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key === RECENT_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(RECENT_EVENT, callback as EventListener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RECENT_EVENT, callback as EventListener);
  };
}
