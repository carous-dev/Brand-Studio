"use client";

import React, { Suspense } from "react";
import { Header } from "./Header";
import ServicesCta from "./ServicesCta";
import Footer from "./Footer";
import ThemeChrome from "@/app/themes/lib/ThemeChrome";
import { useBrand } from "../context/BrandClientWrapper";
import "../styles/header.css";
import "../styles/footer.css";
import "../styles/color-policy.css";

/**
 * classic-dealer shell — thin wrapper over the shared <ThemeChrome>
 * (route-gating, skip-link, canonical widget stack, shared PreviewBanner +
 * CookieBanner). Theme-specific bits: the `.classic-theme` styling scope, its
 * own Header (kept inside <Suspense>) / Footer, and the ServicesCta band
 * rendered between <main> and the footer.
 *
 * classic has no Garage/Wishlist context, so no `provider` is passed. It never
 * mounted MotionFX or ScrollProgress, so those widgets are opted out; the
 * framer-motion whileInView sections in its components are untouched.
 */
export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const brand = useBrand();

  // The `.classic-theme` div is a styling scope and must wrap BOTH the normal
  // site chrome and the dashboard/login bare branch (ThemeChrome handles that
  // route-gating internally), so it wraps <ThemeChrome> here.
  return (
    <div className="classic-theme">
      <ThemeChrome
        brand={brand ?? null}
        classPrefix="classic"
        header={
          <Suspense fallback={null}>
            <Header />
          </Suspense>
        }
        footer={<Footer />}
        belowMain={<ServicesCta />}
        widgets={{ motionFx: false, scrollProgress: false }}
      >
        {children}
      </ThemeChrome>
    </div>
  );
}
