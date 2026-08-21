"use client"

import { useId } from "react"
import type {
  UseVehicleFiltersReturn,
  VehicleFiltersConfig,
  VehicleFiltersField,
  VehicleFiltersOptions,
} from "./types"

const DEFAULT_FIELDS: VehicleFiltersField[] = [
  "q",
  "make",
  "model",
  "body",
  "fuel",
  "maxPrice",
  "maxMileage",
  "sort",
]

const DEFAULT_LABELS: Record<VehicleFiltersField, string> = {
  q: "Search",
  make: "Make",
  model: "Model",
  body: "Body Type",
  fuel: "Fuel Type",
  transmission: "Transmission",
  maxPrice: "Max Price",
  maxMileage: "Max Mileage",
  priceRange: "Price",
  yearRange: "Year",
  sort: "Sort by",
}

const DEFAULT_ANY_LABELS: Partial<Record<VehicleFiltersField, string>> = {
  make: "Any Make",
  model: "Any Model",
  body: "Any Body Type",
  fuel: "Any Fuel",
  transmission: "Any Transmission",
  maxPrice: "No Limit",
  maxMileage: "No Limit",
}

const DEFAULT_SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "mileage_asc", label: "Mileage: Low to High" },
  { value: "year_desc", label: "Year: Newest first" },
]

const DEFAULT_PRICE_BANDS = [
  { value: "5000", label: "Up to £5,000" },
  { value: "10000", label: "Up to £10,000" },
  { value: "15000", label: "Up to £15,000" },
  { value: "20000", label: "Up to £20,000" },
  { value: "30000", label: "Up to £30,000" },
  { value: "50000", label: "Up to £50,000" },
]

const DEFAULT_MILEAGE_BANDS = [
  { value: "20000", label: "Under 20,000 mi" },
  { value: "40000", label: "Under 40,000 mi" },
  { value: "60000", label: "Under 60,000 mi" },
  { value: "80000", label: "Under 80,000 mi" },
  { value: "100000", label: "Under 100,000 mi" },
]

type Props = {
  filters: UseVehicleFiltersReturn
  options: VehicleFiltersOptions
  config?: VehicleFiltersConfig
  /** Prefix for input/label IDs to keep them unique per render site. */
  idPrefix: string
}

/**
 * Renders the configured filter fields as a stacked column. Used by both
 * the desktop sidebar and the mobile bottom sheet.
 */
export function VehicleFiltersFields({ filters, options, config, idPrefix }: Props) {
  const fallbackId = useId().replace(/[:]/g, "")
  const prefix = idPrefix || fallbackId
  const fields = config?.fields ?? DEFAULT_FIELDS
  const labels = { ...DEFAULT_LABELS, ...(config?.labels ?? {}) }
  const anyLabels = { ...DEFAULT_ANY_LABELS, ...(config?.anyLabels ?? {}) }
  const sorts = options.sorts ?? DEFAULT_SORTS
  const priceBands = options.priceBands ?? DEFAULT_PRICE_BANDS
  const mileageBands = options.mileageBands ?? DEFAULT_MILEAGE_BANDS

  return (
    <div className="vf-field-stack">
      {fields.map((field) => {
        const id = `${prefix}-vf-${field}`
        switch (field) {
          case "q":
            return (
              <div key={field} className="vf-field">
                <label htmlFor={id}>{labels.q}</label>
                <input
                  id={id}
                  type="search"
                  value={filters.draft.q}
                  onChange={(e) => filters.setField("q", e.target.value)}
                  placeholder="Make, model, reg…"
                  autoComplete="off"
                />
              </div>
            )
          case "make":
            return (
              <div key={field} className="vf-field">
                <label htmlFor={id}>{labels.make}</label>
                <select
                  id={id}
                  value={filters.draft.make}
                  onChange={(e) => filters.setField("make", e.target.value)}
                >
                  <option value="">{anyLabels.make}</option>
                  {(options.makes ?? []).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            )
          case "model":
            return (
              <div key={field} className="vf-field">
                <label htmlFor={id}>{labels.model}</label>
                <select
                  id={id}
                  value={filters.draft.model}
                  onChange={(e) => filters.setField("model", e.target.value)}
                  disabled={!filters.draft.make && (options.models ?? []).length === 0}
                >
                  <option value="">{anyLabels.model}</option>
                  {(options.models ?? []).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            )
          case "body":
            return (
              <div key={field} className="vf-field">
                <label htmlFor={id}>{labels.body}</label>
                <select
                  id={id}
                  value={filters.draft.body}
                  onChange={(e) => filters.setField("body", e.target.value)}
                >
                  <option value="">{anyLabels.body}</option>
                  {(options.bodyTypes ?? []).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            )
          case "fuel":
            return (
              <div key={field} className="vf-field">
                <label htmlFor={id}>{labels.fuel}</label>
                <select
                  id={id}
                  value={filters.draft.fuel}
                  onChange={(e) => filters.setField("fuel", e.target.value)}
                >
                  <option value="">{anyLabels.fuel}</option>
                  {(options.fuels ?? []).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            )
          case "transmission":
            return (
              <div key={field} className="vf-field">
                <label htmlFor={id}>{labels.transmission}</label>
                <select
                  id={id}
                  value={filters.draft.transmission}
                  onChange={(e) => filters.setField("transmission", e.target.value)}
                >
                  <option value="">{anyLabels.transmission}</option>
                  {(options.transmissions ?? []).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            )
          case "priceRange": {
            const bounds = options.priceBounds
            return (
              <div key={field} className="vf-field vf-field--range">
                <label>{labels.priceRange}</label>
                <div className="vf-range-row">
                  <input
                    type="number"
                    inputMode="numeric"
                    aria-label={`${labels.priceRange} (minimum)`}
                    placeholder="Min"
                    min={bounds?.min}
                    max={bounds?.max}
                    step={bounds?.step ?? 100}
                    value={filters.draft.minPrice}
                    onChange={(e) => filters.setField("minPrice", e.target.value)}
                  />
                  <span aria-hidden="true">–</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    aria-label={`${labels.priceRange} (maximum)`}
                    placeholder="Max"
                    min={bounds?.min}
                    max={bounds?.max}
                    step={bounds?.step ?? 100}
                    value={filters.draft.maxPrice}
                    onChange={(e) => filters.setField("maxPrice", e.target.value)}
                  />
                </div>
              </div>
            )
          }
          case "yearRange": {
            const bounds = options.yearBounds
            return (
              <div key={field} className="vf-field vf-field--range">
                <label>{labels.yearRange}</label>
                <div className="vf-range-row">
                  <input
                    type="number"
                    inputMode="numeric"
                    aria-label={`${labels.yearRange} (from)`}
                    placeholder="From"
                    min={bounds?.min}
                    max={bounds?.max}
                    step={bounds?.step ?? 1}
                    value={filters.draft.minYear}
                    onChange={(e) => filters.setField("minYear", e.target.value)}
                  />
                  <span aria-hidden="true">–</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    aria-label={`${labels.yearRange} (to)`}
                    placeholder="To"
                    min={bounds?.min}
                    max={bounds?.max}
                    step={bounds?.step ?? 1}
                    value={filters.draft.maxYear}
                    onChange={(e) => filters.setField("maxYear", e.target.value)}
                  />
                </div>
              </div>
            )
          }
          case "maxPrice":
            return (
              <div key={field} className="vf-field">
                <label htmlFor={id}>{labels.maxPrice}</label>
                <select
                  id={id}
                  value={filters.draft.maxPrice}
                  onChange={(e) => filters.setField("maxPrice", e.target.value)}
                >
                  <option value="">{anyLabels.maxPrice}</option>
                  {priceBands.map((band) => (
                    <option key={band.value} value={band.value}>
                      {band.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          case "maxMileage":
            return (
              <div key={field} className="vf-field">
                <label htmlFor={id}>{labels.maxMileage}</label>
                <select
                  id={id}
                  value={filters.draft.maxMileage}
                  onChange={(e) => filters.setField("maxMileage", e.target.value)}
                >
                  <option value="">{anyLabels.maxMileage}</option>
                  {mileageBands.map((band) => (
                    <option key={band.value} value={band.value}>
                      {band.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          case "sort":
            return (
              <div key={field} className="vf-field">
                <label htmlFor={id}>{labels.sort}</label>
                <select
                  id={id}
                  value={filters.draft.sort}
                  onChange={(e) => filters.setField("sort", e.target.value)}
                >
                  {sorts.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
