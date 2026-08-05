'use client'

/**
 * CDN-hosted Carous widgets (enquiry + reserve) wiring for classic-dealer.
 * Mirrors the fbm-motors helper (which mirrors cnhcars-clone) but kept local to
 * the theme per the "each theme is self-contained" convention.
 *
 * The gallery stays local (the in-theme React gallery + lightbox). Only the
 * enquiry + reserve modals are hosted CDN widgets, loaded via <Script
 * strategy="afterInteractive"> from the theme's used-cars/[slug]/page.tsx.
 */

export const WIDGETS_BASE_URL =
  process.env.NEXT_PUBLIC_WIDGETS_BASE_URL?.replace(/\/+$/, '') ||
  'https://widgets.carous.co.uk'

export const VEHICLE_ENQUIRY_WIDGET_SRC = `${WIDGETS_BASE_URL}/widgets/vehicle-enquiry/latest/vehicle-enquiry.js`
export const RESERVE_WIDGET_SRC = `${WIDGETS_BASE_URL}/widgets/reserve-a-car/latest/reserve-a-car.js`

export type ExternalVehicleEnquirySummary = {
  title?: string
  registration?: string
  stock?: string
  make?: string
  model?: string
  derivative?: string
  year?: number | string
  price?: number
  priceText?: string
  mileage?: number | string
  transmission?: string
  fuel?: string
  engineSize?: string
  image?: string
  url?: string
}

declare global {
  interface Window {
    CarousVehicleEnquiry?: {
      open?: (options: { vehicle: ExternalVehicleEnquirySummary }) => void
      close?: () => void
      [key: string]: unknown
    }
    CarousReserveACar?: {
      open?: (options: { vehicle: ExternalVehicleEnquirySummary }) => void
      close?: () => void
      configure?: (config: Record<string, unknown>) => void
      [key: string]: unknown
    }
  }
}

/** True once the CDN vehicle-enquiry bundle has attached its open() API. */
export function isExternalVehicleEnquiryReady(): boolean {
  return typeof window !== 'undefined' && typeof window.CarousVehicleEnquiry?.open === 'function'
}

/** True once the CDN reserve-a-car bundle has attached its open() API. */
export function isExternalReservationReady(): boolean {
  return typeof window !== 'undefined' && typeof window.CarousReserveACar?.open === 'function'
}

/**
 * Open the CDN vehicle-enquiry modal. Returns false when the bundle hasn't
 * loaded yet so the caller can fall back to the local EnquiryForm.
 */
export function openExternalVehicleEnquiry(vehicle: ExternalVehicleEnquirySummary): boolean {
  if (!isExternalVehicleEnquiryReady()) return false
  window.CarousVehicleEnquiry!.open!({ vehicle })
  return true
}

/**
 * Open the CDN reserve-a-car modal. Returns false when the bundle hasn't loaded
 * yet so the caller can fall back (e.g. to the enquiry flow).
 */
export function openExternalReservation(vehicle: ExternalVehicleEnquirySummary): boolean {
  if (!isExternalReservationReady()) return false
  window.CarousReserveACar!.open!({ vehicle })
  return true
}
