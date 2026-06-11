'use client'

import { useEffect, useRef } from 'react'

/**
 * CDN-hosted Carous widgets (gallery + enquiry + reserve) wiring.
 * Mirrors the cnhcars-clone helper but kept local to the theme per the
 * "each theme is self-contained" convention.
 */

export const WIDGETS_BASE_URL =
  process.env.NEXT_PUBLIC_WIDGETS_BASE_URL?.replace(/\/+$/, '') ||
  'https://widgets.carous.co.uk'

export const VEHICLE_GALLERY_WIDGET_SRC = `${WIDGETS_BASE_URL}/widgets/vehicle-gallery/latest/vehicle-gallery.js`
export const VEHICLE_ENQUIRY_WIDGET_SRC = `${WIDGETS_BASE_URL}/widgets/vehicle-enquiry/latest/vehicle-enquiry.js`
export const RESERVE_WIDGET_SRC = `${WIDGETS_BASE_URL}/widgets/reserve-a-car/latest/reserve-a-car.js`

export type ExternalVehicleGalleryTemplate = 'grid' | 'thumbs' | 'strip'

export type ExternalVehicleGalleryConfig = {
  target: string
  images: string[]
  vehicleTitle?: string
  videoUrl?: string
  loading?: boolean
  template?: ExternalVehicleGalleryTemplate
  className?: string
}

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
    CarousVehicleGallery?: {
      mount?: (target?: string | Element | null, config?: ExternalVehicleGalleryConfig) => void
      update?: (config: ExternalVehicleGalleryConfig) => void
      unmount?: () => void
      [key: string]: unknown
    }
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

export function openExternalVehicleEnquiry(vehicle: ExternalVehicleEnquirySummary) {
  if (typeof window === 'undefined') return
  window.CarousVehicleEnquiry?.open?.({ vehicle })
}

export function openExternalReservation(vehicle: ExternalVehicleEnquirySummary) {
  if (typeof window === 'undefined') return
  window.CarousReserveACar?.open?.({ vehicle })
}

/**
 * Mount the CDN vehicle-gallery widget into `target` and keep it in sync with
 * the supplied options. Polls for the script bundle to load before applying
 * the first config so we don't lose paint when the script is afterInteractive.
 */
export function useExternalVehicleGallery(
  target: string,
  options: Omit<ExternalVehicleGalleryConfig, 'target'>,
) {
  const { images, vehicleTitle, videoUrl, loading, template, className } = options
  const imagesKey = images.join('|')
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let cancelled = false
    const config: ExternalVehicleGalleryConfig = {
      target,
      images,
      vehicleTitle,
      videoUrl,
      loading,
      template,
      className,
    }

    const apply = () => {
      const api = window.CarousVehicleGallery
      if (!api) return false
      try {
        api.mount?.(target, config)
        api.update?.(config)
      } catch {
        return false
      }
      return true
    }

    if (apply()) return

    const intervalId = window.setInterval(() => {
      if (cancelled) return
      if (apply()) {
        window.clearInterval(intervalId)
      }
    }, 100)

    stopRef.current = () => window.clearInterval(intervalId)

    return () => {
      cancelled = true
      stopRef.current?.()
      stopRef.current = null
      try {
        window.CarousVehicleGallery?.unmount?.()
      } catch { /* unmount best-effort */ }
    }
  }, [target, imagesKey, vehicleTitle, videoUrl, loading, template, className])
}
