'use client'

/**
 * CDN-hosted Carous widgets (vehicle enquiry + reserve-a-car) wiring for the
 * redgate-lodge-bespoke theme. Kept local to the theme per the
 * "each theme is self-contained" convention (mirrors auto-wow-uk-bespoke /
 * cnhcars-clone).
 *
 * The detail page mounts the two widget bundles as `afterInteractive`
 * <Script>s. At click time the island calls `isExternal*Ready()` — if the
 * hosted bundle has loaded it opens the CDN widget; otherwise it falls back to
 * the theme's local <EnquiryModal>, which still captures the lead. The gallery
 * always stays local (mosaic + lightbox in GalleryMosaic.tsx).
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

export function isExternalEnquiryReady(): boolean {
  return typeof window !== 'undefined' && typeof window.CarousVehicleEnquiry?.open === 'function'
}

export function isExternalReserveReady(): boolean {
  return typeof window !== 'undefined' && typeof window.CarousReserveACar?.open === 'function'
}

export function openExternalVehicleEnquiry(vehicle: ExternalVehicleEnquirySummary) {
  if (typeof window === 'undefined') return
  window.CarousVehicleEnquiry?.open?.({ vehicle })
}

export function openExternalReservation(vehicle: ExternalVehicleEnquirySummary) {
  if (typeof window === 'undefined') return
  window.CarousReserveACar?.open?.({ vehicle })
}
