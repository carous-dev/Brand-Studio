"use client";

import { useEffect, useRef } from "react";

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
  /** Visual template variant: 'grid' (default) | 'thumbs' | 'strip'. */
  template?: ExternalVehicleGalleryTemplate;
  /** Extra class added to the outer `.vehicle-gallery-card`. */
  className?: string;
};

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

type WhatsAppEnquiryIntent = {
  id: string;
  label: string;
  intro: string;
};

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

declare global {
  interface Window {
    CarousVehicleEnquiry?: {
      open?: (options: { vehicle: ExternalVehicleEnquirySummary }) => void;
      close?: () => void;
      [key: string]: unknown;
    };
    CarousReserveACar?: {
      open?: (options: { vehicle: ExternalVehicleEnquirySummary }) => void;
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

export function openExternalVehicleEnquiry(vehicle: ExternalVehicleEnquirySummary) {
  if (typeof window === "undefined") return;
  window.CarousVehicleEnquiry?.open?.({ vehicle });
}

export function openExternalReservation(vehicle: ExternalVehicleEnquirySummary) {
  if (typeof window === "undefined") return;
  window.CarousReserveACar?.open?.({ vehicle });
}

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
 * Mount the CDN vehicle-gallery widget into `target` and keep it in sync with
 * the supplied options. Waits for the widget bundle to load (script tag uses
 * strategy="afterInteractive") before applying the first config. Subsequent
 * renders only push an update() if any tracked field changes.
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
