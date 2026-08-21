"use client"

import { VehicleFiltersFields } from "./VehicleFiltersFields"
import type {
  UseVehicleFiltersReturn,
  VehicleFiltersConfig,
  VehicleFiltersOptions,
} from "./types"

type Props = {
  filters: UseVehicleFiltersReturn
  options: VehicleFiltersOptions
  config?: VehicleFiltersConfig
  className?: string
}

/**
 * Desktop sidebar variant. Sits in the page layout next to the results
 * grid. Renders the filter fields, plus Apply + Clear buttons at the bottom.
 */
export function VehicleFiltersSidebar({ filters, options, config, className }: Props) {
  const heading = config?.heading ?? "Refine your search"
  const applyLabel = config?.applyLabel ?? "Apply filters"
  const clearLabel = config?.clearLabel ?? "Clear all"

  return (
    <aside className={["vf-sidebar", className].filter(Boolean).join(" ")} aria-label={heading}>
      <header className="vf-sidebar__head">
        <h2 className="vf-sidebar__title">{heading}</h2>
      </header>
      <VehicleFiltersFields
        filters={filters}
        options={options}
        config={config}
        idPrefix="vf-desktop"
      />
      <div className="vf-sidebar__actions">
        <button
          type="button"
          className="vf-button vf-button--ghost"
          onClick={filters.clear}
          disabled={filters.activeCount === 0 && Object.values(filters.draft).every((v) => !v)}
        >
          {clearLabel}
        </button>
        <button type="button" className="vf-button vf-button--primary" onClick={filters.apply}>
          {applyLabel}
        </button>
      </div>
    </aside>
  )
}
