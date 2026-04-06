"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { PreviewBanner } from "./PreviewBanner";
import { Header } from "./Header";
import ServicesCta from "./ServicesCta";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";
import SupportWidget from "./SupportWidget";
import "../styles/header.css";
import "../styles/footer.css";

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  // Treat dashboard routes and the public login page as areas that provide
  // their own chrome (do not render the global header/footer/support UI)
  const isAuthArea = pathname.startsWith("/dashboard") || pathname === "/login";

  if (isAuthArea) {
    return <main id="content" role="main" className="classic-theme">{children}</main>;
  }

  // Otherwise render the normal public site chrome
  return (
    <div className="classic-theme">
      <PreviewBanner />
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main id="content" role="main">{children}</main>
      <ServicesCta />
      <Footer />
      <CookieBanner />
      <SupportWidget />
    </div>
  );
}
