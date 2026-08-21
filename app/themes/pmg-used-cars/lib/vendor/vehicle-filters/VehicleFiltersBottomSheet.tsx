"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { VehicleFiltersFields } from "./VehicleFiltersFields"
import { lockBodyScroll } from "./scroll-lock"
import type {
  UseVehicleFiltersReturn,
  VehicleFiltersConfig,
  VehicleFiltersOptions,
} from "./types"

type Props = {
  filters: UseVehicleFiltersReturn
  options: VehicleFiltersOptions
  config?: VehicleFiltersConfig
  open: boolean
  onClose: () => void
}

/**
 * Mobile bottom-sheet variant. Renders via React Portal to document.body so
 * it always sits above sticky headers / chat widgets / cookie banners
 * regardless of where the host page mounts it.
 *
 * Locks body scroll while open. Escape closes. Click outside the sheet
 * closes. Respects prefers-reduced-motion.
 */
export function VehicleFiltersBottomSheet({ filters, options, config, open, onClose }: Props) {
  const [portalReady, setPortalReady] = useState(false)
  useEffect(() => setPortalReady(true), [])

  // Body scroll lock while the sheet is open (scrollbar-width compensated).
  useEffect(() => {
    if (!open) return
    return lockBodyScroll()
  }, [open])

  // Escape closes.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!portalReady || typeof document === "undefined") return null

  const heading = config?.heading ?? "Filters"
  const subheading = config?.subheading
  const applyLabel = config?.applyLabel ?? "Show results"
  const clearLabel = config?.clearLabel ?? "Clear"

  return createPortal(
    // audit-ignore: a11y-div-as-button — filter sheet backdrop; the panel has real close/apply buttons + Escape
    <div
      className={`vf-sheet${open ? " vf-sheet--open" : ""}`}
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        type="button"
        className="vf-sheet__backdrop"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div
        className="vf-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label={heading}
      >
        <header className="vf-sheet__head">
          <div className="vf-sheet__head-text">
            <h2 className="vf-sheet__title">{heading}</h2>
            {subheading ? <p className="vf-sheet__subtitle">{subheading}</p> : null}
          </div>
          <button
            type="button"
            className="vf-sheet__close"
            aria-label="Close filters"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="vf-sheet__body">
          <VehicleFiltersFields
            filters={filters}
            options={options}
            config={config}
            idPrefix="vf-mobile"
          />
        </div>
        <div className="vf-sheet__actions">
          <button
            type="button"
            className="vf-button vf-button--ghost"
            onClick={() => {
              filters.clear()
              onClose()
            }}
          >
            {clearLabel}
          </button>
          <button
            type="button"
            className="vf-button vf-button--primary"
            onClick={() => {
              filters.apply()
              onClose()
            }}
          >
            {applyLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
