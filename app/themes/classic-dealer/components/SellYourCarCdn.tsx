"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useBrand } from "../context/BrandClientWrapper";
import { getBrandContactInfo } from "../lib/contact";

/**
 * Sell-your-car page body — hosted Carous CDN widget instead of the local
 * SellCarForm wizard. The bundle self-mounts nothing until we call
 * `CarousSellYourCar.mount(target, config)`; it injects its own styles and
 * drives the full identify → valuation → details flow against the app's
 * existing `/api/lookup` and `/api/send-lead-email` routes (bundle defaults).
 *
 * Mirrors the vehicle-detail CDN wiring pattern (afterInteractive Script +
 * poll-until-global-ready), kept local to the theme per the self-contained
 * convention.
 */

const WIDGETS_BASE_URL =
  process.env.NEXT_PUBLIC_WIDGETS_BASE_URL?.replace(/\/+$/, "") ||
  "https://widgets.carous.co.uk";

const SELL_YOUR_CAR_WIDGET_SRC = `${WIDGETS_BASE_URL}/widgets/sell-your-car/latest/sell-your-car.js`;

/* The bundle AUTO-mounts on load into `#carous-sell-your-car-root` (appending
   a div to <body> if it's missing) and later mount() calls keep the existing
   root. So we must render the default-id div ourselves; the hero's
   "#sell-form" anchor lives on the section wrapper. */
const MOUNT_ID = "carous-sell-your-car-root";

type SellYourCarCdnApi = {
  mount?: (target?: string | Element | null, config?: Record<string, unknown>) => unknown;
  update?: (config: Record<string, unknown>) => void;
  unmount?: () => void;
};

declare global {
  interface Window {
    CarousSellYourCar?: SellYourCarCdnApi;
  }
}

function readBodyVar(name: string): string | undefined {
  const value = getComputedStyle(document.body).getPropertyValue(name).trim();
  return value || undefined;
}

export default function SellYourCarCdn() {
  const brand = useBrand();
  const brandName = brand?.name || "our dealership";
  const brandSlug = brand?.slug || "";
  const contact = getBrandContactInfo(brand);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const config: Record<string, unknown> = {
      target: `#${MOUNT_ID}`,
      brandName,
      leadOwner: brandSlug || undefined,
      leadType: "sell-your-car",
      leadSource: "sell-your-car-page",
      contact: {
        phoneTel: contact.phoneTel || undefined,
        phoneDisplay: contact.phoneDisplay || undefined,
        email: contact.email || undefined,
        whatsappUrl: contact.whatsappUrl || undefined,
      },
      // Brand palette → widget theme, read from the live CSS vars so the
      // widget repaints with whatever the dashboard pickers resolved to.
      theme: {
        accent: readBodyVar("--brand-primary"),
        accentForeground: readBodyVar("--brand-background"),
        bg: readBodyVar("--brand-background"),
        fg: readBodyVar("--brand-text"),
      },
      copy: {
        cardTitle: "Vehicle Valuation Request",
        cardSubtitle: `Three quick steps. Dealer-backed offer from ${brandName}.`,
        successHeading: "Thanks — your details are on their way",
        successBody: `A member of the ${brandName} team will review your vehicle and contact you with the next step.`,
      },
    };

    const apply = () => {
      const api = window.CarousSellYourCar;
      if (!api?.mount) return false;
      try {
        // mount() is a no-op on the root if already auto-mounted, but merges
        // config; update() covers the auto-mounted-first path explicitly.
        api.mount(`#${MOUNT_ID}`, config);
        api.update?.(config);
      } catch {
        return false;
      }
      return true;
    };

    if (!apply()) {
      const intervalId = window.setInterval(() => {
        if (cancelled) return;
        if (apply()) window.clearInterval(intervalId);
      }, 100);

      return () => {
        cancelled = true;
        window.clearInterval(intervalId);
        try {
          window.CarousSellYourCar?.unmount?.();
        } catch { /* best-effort */ }
      };
    }

    return () => {
      cancelled = true;
      try {
        window.CarousSellYourCar?.unmount?.();
      } catch { /* best-effort */ }
    };
  }, [brandName, brandSlug, contact.phoneTel, contact.phoneDisplay, contact.email, contact.whatsappUrl]);

  return (
    <section id="sell-form" className="scs-widget-section" aria-label="Vehicle valuation request">
      <Script src={SELL_YOUR_CAR_WIDGET_SRC} strategy="afterInteractive" />
      <div className="sell-shell">
        <div id={MOUNT_ID} className="scs-widget-root" />
      </div>
    </section>
  );
}
