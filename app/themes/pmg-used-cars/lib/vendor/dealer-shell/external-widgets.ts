"use client";

/**
 * Canonical client-side helpers that talk to the CDN widget globals.
 *
 * Centralises the previously-duplicated `app/lib/external-widgets.ts` copy
 * that lived in every dealer app under `apps/*`. The widget bundles themselves
 * still live at `widgets.carous.co.uk` — these helpers are just the React
 * adapter layer (the polling effect, the typed window globals, etc.).
 */

import { useEffect, useRef } from "react";

// ─── CDN bundle URLs ─────────────────────────────────────────────────────────
// The widget bundles live at widgets.carous.co.uk. The detail page loads the
// gallery/enquiry/reserve bundles via <Script>; the site-wide WhatsApp launcher
// is loaded by the shared <CarousWhatsAppWidget> from the theme shell.

export const WIDGETS_BASE_URL =
  process.env.NEXT_PUBLIC_WIDGETS_BASE_URL?.replace(/\/+$/, "") || "https://widgets.carous.co.uk";

export const VEHICLE_GALLERY_WIDGET_SRC = `${WIDGETS_BASE_URL}/widgets/vehicle-gallery/latest/vehicle-gallery.js`;
export const VEHICLE_ENQUIRY_WIDGET_SRC = `${WIDGETS_BASE_URL}/widgets/vehicle-enquiry/latest/vehicle-enquiry.js`;
export const RESERVE_WIDGET_SRC = `${WIDGETS_BASE_URL}/widgets/reserve-a-car/latest/reserve-a-car.js`;

// ─── Vehicle Enquiry widget ──────────────────────────────────────────────────

export type ExternalVehicleEnquirySummary = {
  title?: string;
  registration?: string;
  stock?: string;
  make?: string;
  model?: string;
  derivative?: string;
  year?: number | string;
  price?: number;
  priceText?: string;
  mileage?: number | string;
  transmission?: string;
  fuel?: string;
  engineSize?: string;
  image?: string;
  url?: string;
};

// ─── WhatsApp Enquiry widget ─────────────────────────────────────────────────

type WhatsAppEnquiryIntent = { id: string; label: string; intro: string };
type WhatsAppEnquiryVehicle = {
  label?: string | null;
  year?: string | number | null;
  make?: string | null;
  model?: string | null;
  derivative?: string | null;
  registration?: string | null;
  vin?: string | null;
  slug?: string | null;
  price?: string | number | null;
  mileage?: string | number | null;
  fuel?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  colour?: string | null;
};

export type ExternalWhatsAppEnquirySubject = {
  dealerName: string;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  pageTitle?: string | null;
  pageUrl?: string | null;
  vehicle?: WhatsAppEnquiryVehicle | null;
  quickActions?: WhatsAppEnquiryIntent[];
  defaultIntentId?: string | null;
  defaultMessage?: string | null;
  greeting?: string | null;
  launcherLabel?: string | null;
  panelTitle?: string | null;
  panelDescription?: string | null;
  accentColor?: string | null;
  surfaceColor?: string | null;
  textColor?: string | null;
  borderColor?: string | null;
  placement?: "bottom-right" | "bottom-left";
};

// ─── Vehicle Gallery widget ──────────────────────────────────────────────────

export type ExternalVehicleGalleryTemplate = "grid" | "thumbs" | "strip";

export type ExternalVehicleGalleryConfig = {
  /** CSS selector for the mount element on the page. */
  target: string;
  /** Ordered photo URLs. */
  images: string[];
  /** Vehicle title used in alt text / aria-label. */
  vehicleTitle?: string;
  /** Optional video URL (YouTube / Vimeo / youtu.be). Becomes the FIRST slide. */
  videoUrl?: string;
  /** When `true`, render skeleton until next update(). */
  loading?: boolean;
  /** Visual template variant. */
  template?: ExternalVehicleGalleryTemplate;
  /** Extra class added to the outer `.vehicle-gallery-card`. */
  className?: string;
};

/** Reuse the vehicle-enquiry summary shape — both widgets read the same vehicle context. */
export type ExternalReserveACarSummary = ExternalVehicleEnquirySummary;

declare global {
  interface Window {
    CarousVehicleEnquiry?: {
      open?: (options: { vehicle: ExternalVehicleEnquirySummary }) => void;
      close?: () => void;
      [key: string]: unknown;
    };
    CarousReserveACar?: {
      open?: (options: { vehicle: ExternalReserveACarSummary }) => void;
      close?: () => void;
      configure?: (config: Record<string, unknown>) => void;
      [key: string]: unknown;
    };
    CarousWhatsAppEnquiry?: {
      subject?: ExternalWhatsAppEnquirySubject | null;
      setSubject?: (subject: ExternalWhatsAppEnquirySubject | null) => void;
      [key: string]: unknown;
    };
    CarousVehicleGallery?: {
      mount?: (target?: string | Element | null, config?: ExternalVehicleGalleryConfig) => void;
      update?: (config: ExternalVehicleGalleryConfig) => void;
      unmount?: () => void;
      [key: string]: unknown;
    };
  }
}

/** Fire-and-forget call to open the CDN vehicle-enquiry modal. */
export function openExternalVehicleEnquiry(vehicle: ExternalVehicleEnquirySummary) {
  if (typeof window === "undefined") return;
  window.CarousVehicleEnquiry?.open?.({ vehicle });
}

/** Fire-and-forget call to open the CDN reserve-a-car modal. */
export function openExternalReservation(vehicle: ExternalReserveACarSummary) {
  if (typeof window === "undefined") return;
  window.CarousReserveACar?.open?.({ vehicle });
}

/** Publishes the current WhatsApp enquiry subject to the global widget. */
export function useExternalWhatsAppEnquiryScope(subject: ExternalWhatsAppEnquirySubject | null) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.CarousWhatsAppEnquiry = {
      ...(window.CarousWhatsAppEnquiry || {}),
      subject,
    };
    window.CarousWhatsAppEnquiry.setSubject?.(subject);

    return () => {
      window.CarousWhatsAppEnquiry = {
        ...(window.CarousWhatsAppEnquiry || {}),
        subject: null,
      };
      window.CarousWhatsAppEnquiry?.setSubject?.(null);
    };
  }, [subject]);
}

/**
 * Mount the CDN vehicle-gallery widget into `target` and keep it in sync.
 * Polls for the global widget API to be published (script tag uses
 * `strategy="afterInteractive"` so the hook can race the script load).
 */
export function useExternalVehicleGallery(
  target: string,
  options: Omit<ExternalVehicleGalleryConfig, "target">,
) {
  const { images, vehicleTitle, videoUrl, loading, template, className } = options;
  const imagesKey = images.join("|");
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const config: ExternalVehicleGalleryConfig = {
      target,
      images,
      vehicleTitle,
      videoUrl,
      loading,
      template,
      className,
    };

    const apply = () => {
      const api = window.CarousVehicleGallery;
      if (!api) return false;
      try {
        api.mount?.(target, config);
        api.update?.(config);
      } catch {
        return false;
      }
      return true;
    };

    if (apply()) return;

    const intervalId = window.setInterval(() => {
      if (cancelled) return;
      if (apply()) {
        window.clearInterval(intervalId);
      }
    }, 100);

    stopRef.current = () => window.clearInterval(intervalId);

    return () => {
      cancelled = true;
      stopRef.current?.();
      stopRef.current = null;
    };
  }, [target, imagesKey, vehicleTitle, videoUrl, loading, template, className]);
}
