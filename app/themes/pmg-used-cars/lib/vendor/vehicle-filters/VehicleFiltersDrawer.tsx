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
  /** Which edge the drawer slides in from. Default "right". */
  side?: "left" | "right"
}

/**
 * Side-drawer variant. Single overlay paradigm at all viewports — slides in
 * from the right edge (or left, via `side="left"`) on top of the page. Used
 * by apps that prefer to keep the inventory grid full-width and pop a drawer
 * when the user wants to filter, instead of giving up sidebar real estate
 * permanently.
 *
 * Renders via React Portal so it always sits above sticky chrome.
 */
export function VehicleFiltersDrawer({ filters, options, config, open, onClose, side = "right" }: Props) {
  const [portalReady, setPortalReady] = useState(false)
  useEffect(() => setPortalReady(true), [])

  useEffect(() => {
    if (!open) return
    return lockBodyScroll()
  }, [open])

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
    // audit-ignore: a11y-div-as-button — filter drawer backdrop; the panel has real close/apply buttons + Escape
    <div
      className={`vf-drawer${side === "left" ? " vf-drawer--left" : ""}${open ? " vf-drawer--open" : ""}`}
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        type="button"
        className="vf-drawer__backdrop"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div className="vf-drawer__panel" role="dialog" aria-modal="true" aria-label={heading}>
        <header className="vf-drawer__head">
          <div className="vf-drawer__head-text">
            <h2 className="vf-drawer__title">{heading}</h2>
            {subheading ? <p className="vf-drawer__subtitle">{subheading}</p> : null}
          </div>
          <button
            type="button"
            className="vf-drawer__close"
            aria-label="Close filters"
            onClick={onClose}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <div className="vf-drawer__body">
          <VehicleFiltersFields
            filters={filters}
            options={options}
            config={config}
            idPrefix="vf-drawer"
          />
        </div>
        <div className="vf-drawer__actions">
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
