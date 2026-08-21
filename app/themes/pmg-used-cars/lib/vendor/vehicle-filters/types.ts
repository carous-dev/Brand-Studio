/**
 * The canonical filter shape used by every dealer app's inventory query.
 * All fields are strings (the inventory API receives URL-encoded query
 * params; numeric values are still stringified). Empty string = no filter.
 *
 * Range fields (priceMin/priceMax, yearMin/yearMax) are independent — apps
 * that only want a single-max constraint can ignore the *Min* fields and
 * use only `maxPrice` / `maxMileage` (the original simple shape).
 */
export type VehicleFiltersValue = {
  q: string
  make: string
  model: string
  body: string
  fuel: string
  transmission: string
  maxPrice: string
  /** Optional lower bound for a price range. Empty string = no min. */
  minPrice: string
  maxMileage: string
  /** Optional lower bound for a year range. Empty string = no min. */
  minYear: string
  /** Optional upper bound for a year range. Empty string = no max. */
  maxYear: string
  sort: string
}

/** Which filter fields the UI should render. */
export type VehicleFiltersField =
  | "q"
  | "make"
  | "model"
  | "body"
  | "fuel"
  | "transmission"
  | "maxPrice"
  | "maxMileage"
  | "priceRange"
  | "yearRange"
  | "sort"

export type SortOption = {
  value: string
  label: string
}

export type RangeBounds = {
  min: number
  max: number
  /** Step for numeric inputs. Default 1. */
  step?: number
}

/**
 * Options that populate the dropdowns. Apps source these from the
 * /inventory API's `meta.available` block (or compute them client-side
 * from the current result set).
 */
export type VehicleFiltersOptions = {
  makes?: string[]
  models?: string[]
  bodyTypes?: string[]
  fuels?: string[]
  transmissions?: string[]
  /** Sort options. Default: `[{value: "newest", label: "Newest first"}, ...]` */
  sorts?: SortOption[]
  /**
   * Override the default Max Price bands. Each item's `value` is what the
   * API receives (empty string = "No Limit"). If omitted, the package's
   * £5k / £10k / £15k / £20k / £30k / £50k baseline is used.
   */
  priceBands?: SortOption[]
  /** Override the default Max Mileage bands. Same shape as priceBands. */
  mileageBands?: SortOption[]
  /** Bounds for the priceRange field (only used if `fields` includes "priceRange"). */
  priceBounds?: RangeBounds
  /** Bounds for the yearRange field (only used if `fields` includes "yearRange"). */
  yearBounds?: RangeBounds
}

/**
 * Per-app cosmetic config. Labels, placeholders, which fields to show,
 * which visual variant + placement to use. Everything is optional with
 * sensible defaults.
 */
export type VehicleFiltersConfig = {
  /** Which fields to render (in order). Defaults to a sensible subset. */
  fields?: VehicleFiltersField[]
  /** Override field labels. Keys are the field name. */
  labels?: Partial<Record<VehicleFiltersField, string>>
  /** Override field placeholders for "Any X" dropdown options. */
  anyLabels?: Partial<Record<VehicleFiltersField, string>>
  /** Heading rendered at the top of the panel/sheet. */
  heading?: string
  /** Subhead under the heading on mobile. */
  subheading?: string
  /** Customise the apply / clear buttons. */
  applyLabel?: string
  clearLabel?: string
}

/**
 * Visual variant for the desktop / mobile chrome. Apps pick whichever
 * matches their look — this is the WordPress-theme style "pick the
 * variant" knob.
 *
 * - **panel**  — sticky column on desktop, bottom-sheet on mobile (default).
 * - **drawer** — full-height slide-in from the right edge on every viewport;
 *                used by apps that prefer a single overlay paradigm with no
 *                sidebar consuming page width.
 */
export type VehicleFiltersVariant = "panel" | "drawer"

export type UseVehicleFiltersOptions = {
  /** Initial *applied* filter values. Draft starts as a copy of this. */
  initial?: Partial<VehicleFiltersValue>
  /** Available dropdown options. Re-pass when the result set changes. */
  options: VehicleFiltersOptions
  /**
   * Callback fired whenever apply()/clear() runs with the new applied state.
   * Apps wire this to refetch + URL sync.
   */
  onApply?: (applied: VehicleFiltersValue) => void
  onClear?: () => void
}

export type UseVehicleFiltersReturn = {
  /** Currently *applied* values — what the API request should reflect. */
  applied: VehicleFiltersValue
  /** Currently *draft* values — what the user is editing in the panel. */
  draft: VehicleFiltersValue
  /** Number of applied non-empty filters (excluding `q` and `sort`). */
  activeCount: number
  /** Update one field of the draft. */
  setField: <K extends keyof VehicleFiltersValue>(field: K, value: VehicleFiltersValue[K]) => void
  /** Replace draft entirely (e.g. on URL hydration). */
  setDraft: (next: Partial<VehicleFiltersValue>) => void
  /** Replace applied entirely (e.g. on URL hydration). */
  setApplied: (next: Partial<VehicleFiltersValue>) => void
  /** Apply the current draft as the applied state and call `onApply`. */
  apply: () => void
  /** Clear both draft and applied. Calls onApply + onClear. */
  clear: () => void
  /** Reset draft back to applied (cancel edits). */
  cancel: () => void
}
