"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { PreviewBanner } from "./PreviewBanner";
import ContactBar from "./ContactBar";
import Header from "./Header";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";
import SupportWidget from "./SupportWidget";
import "../styles/base.css";
import "../styles/header.css";
import "../styles/footer.css";

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  // Known routes that should have full site chrome
  const knownRoutes = [
    "/",
    "/about",
    "/car-service",
    "/contact",
    "/cookie-policy",
    "/finance",
    "/in",
    "/privacy-policy",
    "/reviews",
    "/sell-your-car",
    "/services",
    "/terms",
    "/used-cars",
    "/warranty"
  ];

  // Check if pathname starts with known dynamic routes
  const isKnownRoute = knownRoutes.includes(pathname) ||
                      pathname.startsWith("/used-cars/") ||
                      pathname.startsWith("/dashboard") ||
                      pathname === "/login";

  // Treat dashboard routes, login page, and unknown routes (404s) as areas that provide
  // their own chrome (do not render the global header/footer/support UI)
  const isSpecialArea = pathname.startsWith("/dashboard") || pathname === "/login" || !isKnownRoute;

  if (isSpecialArea) {
    return <main id="content" role="main" className="main-dashboard">{children}</main>;
  }

  // Otherwise render the normal public site chrome
  return (
    <>
      <PreviewBanner />
      <ContactBar />
      <Header />
      <main id="content" role="main">{children}</main>
      <Footer />
      <CookieBanner />
      <SupportWidget />
    </>
  );
}
