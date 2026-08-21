"use client"

import type { ButtonHTMLAttributes } from "react"
import { Filter } from "lucide-react"

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Number of currently applied filters (badge). Hidden when 0. */
  activeCount?: number
  /** Label next to the icon. */
  label?: string
}

/**
 * Floating-action-button to open the mobile filter sheet. Pre-styled
 * via `.vf-fab`; pass `className` to layer on per-app accent overrides.
 */
export function VehicleFiltersFab({
  activeCount = 0,
  label = "Filters",
  className,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={["vf-fab", className].filter(Boolean).join(" ")}
      {...rest}
    >
      <Filter size={16} aria-hidden="true" />
      <span>{label}</span>
      {activeCount > 0 ? <strong className="vf-fab__badge">{activeCount}</strong> : null}
    </button>
  )
}
