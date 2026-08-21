/**
 * Pure, server-safe selection of the homepage "Featured stock" slice from raw
 * `/inventory` API items. No "use client", no fetch — imported by the server
 * page and passed down to the client <FeaturedStock/> component, which renders
 * the shared <InventoryCard/> for each entry.
 */
import { toName, type InventoryVehicle } from "../../pages/used-cars/_lib/types";

/**
 * A featured entry is just the raw inventory item plus the body-type grouping
 * the homepage tabs filter on. The card itself is the shared <InventoryCard/>,
 * so all display fields (title, price, specs, images) are derived there — no
 * lossy pre-mapping here.
 */
export type FeaturedCar = {
  vehicle: InventoryVehicle;
  bodyKey: string;
  bodyLabel: string;
};

/** Curated body-type tabs, in display order. `other` catches the long tail. */
export const BODY_ORDER = [
  "hatchback",
  "suv",
  "saloon",
  "estate",
  "coupe",
  "mpv",
  "convertible",
  "other",
] as const;

export const BODY_LABELS: Record<string, string> = {
  hatchback: "Hatchbacks",
  suv: "SUVs",
  saloon: "Saloons",
  estate: "Estates",
  coupe: "Coupes",
  mpv: "MPVs",
  convertible: "Convertibles",
  other: "Other",
};

function bodyKey(raw: string): string {
  const s = raw.toLowerCase();
  if (/hatch/.test(s)) return "hatchback";
  if (/suv|crossover|4x4|4 x 4/.test(s)) return "suv";
  if (/saloon|sedan/.test(s)) return "saloon";
  if (/estate|touring|avant|tourer|sw\b|shooting/.test(s)) return "estate";
  if (/coup/.test(s)) return "coupe";
  if (/mpv|people|carrier|van/.test(s)) return "mpv";
  if (/convert|cabrio|roadster|drop|spider|spyder/.test(s)) return "convertible";
  return "other";
}

function buildTitle(vehicle: InventoryVehicle): string {
  const trim =
    toName(vehicle.derivative) || toName(vehicle.variant) || toName(vehicle.trim);
  return [toName(vehicle.make), toName(vehicle.model), trim].filter(Boolean).join(" ").trim();
}

function isSold(vehicle: InventoryVehicle): boolean {
  return String(vehicle.stock_status || vehicle.status || "").toLowerCase() === "sold";
}

/**
 * Pick the featured slice of raw inventory items. Sold stock is dropped; the
 * caller decides how many to show (the grid renders two rows of three well).
 * Each entry keeps the raw vehicle so the shared <InventoryCard/> can render it.
 */
export function toFeaturedCars(items: InventoryVehicle[], limit = 6): FeaturedCar[] {
  const cars: FeaturedCar[] = [];
  for (const vehicle of items) {
    if (isSold(vehicle)) continue;
    if (!buildTitle(vehicle)) continue;
    const bodyRaw = toName(vehicle.body_type) || toName(vehicle.bodyType) || toName(vehicle.body);
    const key = bodyKey(bodyRaw);
    cars.push({ vehicle, bodyKey: key, bodyLabel: BODY_LABELS[key] });
    if (cars.length >= limit) break;
  }
  return cars;
}
