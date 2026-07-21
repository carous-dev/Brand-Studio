"use client";

import type { ReactNode } from "react";
import { useBrand } from "../context/BrandClientWrapper";
import ContactBar from "./ContactBar";
import Header from "./Header";
import Footer from "./Footer";
import ThemeChrome from "@/app/themes/lib/ThemeChrome";

import "../styles/base.css";
import "../styles/color-policy.css";
import "../styles/header.css";
import "../styles/footer.css";

/**
 * gilded-drive shell — thin wrapper over the shared <ThemeChrome> (route-gating,
 * skip-link, canonical widget stack, PreviewBanner + CookieBanner +
 * CarousWhatsAppWidget). Theme-specific bits: its own ContactBar + Header (the
 * ContactBar sits above the Header, matching the legacy order) and Footer.
 *
 * AuthProvider is NOT wrapped here: gilded's context/AuthContext AuthProvider is
 * mounted globally in app/layout.tsx (via the theme context registry) around the
 * whole ThemeShell, so the shell itself wraps no providers — same as before.
 *
 * Widgets: gilded historically mounted ONLY AnimateOnScroll, so MotionFX and
 * ScrollProgress stay off. No extraRoutes — every real page folder maps onto a
 * canonical known route.
 */
export default function ConditionalShell({ children }: { children: ReactNode }) {
  const brand = useBrand();

  return (
    <ThemeChrome
      brand={brand ?? null}
      classPrefix="gilded"
      header={
        <>
          <ContactBar />
          <Header />
        </>
      }
      footer={<Footer />}
      widgets={{ motionFx: false, scrollProgress: false }}
    >
      {children}
    </ThemeChrome>
  );
}
