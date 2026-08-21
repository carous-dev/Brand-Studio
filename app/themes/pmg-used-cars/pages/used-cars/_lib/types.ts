/**
 * Shared, side-effect-free types + pure helpers for the used-cars inventory.
 *
 * Imported by BOTH the server module (inventory.ts) and the client module
 * (inventory-client.ts) as well as the card UI. It must therefore contain
 * ZERO runtime side effects — no "use client", no process.env, no fetch.
 */

/** Page size for the inventory grid. */
export const PER_PAGE = 12;

/**
 * Raw vehicle shape as returned by the Carous `/inventory` API. Kept
 * permissive/nullable — upstream field names drift and the card UI reads a
 * mix of snake_case + camelCase aliases.
 */
export type InventoryVehicle = {
  slug?: string | null;
  id?: string | number | null;
  advert_id?: string | null;
  reg?: string | null;
  make?: { name?: string } | string | null;
  model?: { name?: string } | string | null;
  derivative?: string | null;
  trim?: string | null;
  variant?: string | null;
  year?: number | string | null;
  price?: number | string | null;
  mileage?: number | string | null;
  fuel?: string | null;
  trans?: string | null;
  transmission?: string | null;
  body_type?: string | null;
  bodyType?: string | null;
  body?: string | null;
  colour?: string | null;
  color?: string | null;
  engine_size?: number | string | null;
  engineSize?: number | string | null;
  engine?: number | string | null;
  image?: string | null;
  images?: string[];
  gallery?: Array<{ url?: string; href?: string; src?: string; file?: string; path?: string; image?: string } | string>;
  media?: Array<{ type?: string; href?: string; url?: string }>;
  photo_count?: number;
  stock_status?: string;
  status?: string;
  reserved?: boolean;
  description?: string | null;
};

/** Filter option metadata derived from live stock. */
export type FilterMeta = {
  makesToModels: Record<string, string[]>;
  bodies: string[];
  fuels: string[];
  transmissions: string[];
};

/** Server-side filter state (URL-safe strings; empty = off). */
export type FilterValues = {
  q: string;
  make: string;
  model: string;
  body: string;
  fuel: string;
  transmission: string;
  min_price: string;
  max_price: string;
  max_mileage: string;
  sort: string;
  page: number;
};

export const EMPTY_FILTERS: FilterValues = {
  q: "",
  make: "",
  model: "",
  body: "",
  fuel: "",
  transmission: "",
  min_price: "",
  max_price: "",
  max_mileage: "",
  sort: "newest",
  page: 1,
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function readParam(sp: RawSearchParams, key: string): string {
  const value = sp[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function readFilters(sp: RawSearchParams): FilterValues {
  return {
    q: readParam(sp, "q"),
    make: readParam(sp, "make"),
    model: readParam(sp, "model"),
    body: readParam(sp, "body"),
    fuel: readParam(sp, "fuel"),
    transmission: readParam(sp, "transmission"),
    min_price: readParam(sp, "min_price"),
    max_price: readParam(sp, "max_price"),
    max_mileage: readParam(sp, "max_mileage"),
    sort: readParam(sp, "sort") || "newest",
    page: Math.max(1, Number(readParam(sp, "page")) || 1),
  };
}

export function toName(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as { name?: unknown }).name === "string"
  ) {
    return (value as { name: string }).name;
  }
  return "";
}

/** Filter shape the interactive client grid queries with. */
export type ClientFilters = {
  q: string;
  make: string;
  model: string;
  body: string;
  fuel: string;
  transmission: string;
  minPrice: string;
  maxPrice: string;
  maxMileage: string;
  sort: string;
  page: number;
};
