"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitCompareArrows, Heart } from "lucide-react";
import { countSaved, subscribeSaved } from "@/app/themes/pmg-used-cars/lib/vendor/garage";
import { dealer } from "../data/site-config";
import { useBrand } from "../context/BrandClientWrapper";
import WhatsAppIcon from "./WhatsAppIcon";

const phoneHref = `tel:${(dealer.contact.phoneE164 ?? dealer.contact.phoneDisplay ?? "").replace(/\s+/g, "")}`;
const phoneDisplay = dealer.contact.phoneDisplay ?? "";
const addressText = [
  dealer.address.line1,
  dealer.address.town,
  dealer.address.county,
  dealer.address.postcode,
]
  .filter(Boolean)
  .join(", ");
const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(addressText)}`;

const NAV = [
  { href: "/", label: "Home" },
  { href: "/used-cars", label: "Used Cars", dropdown: true },
  { href: "/car-sourcing", label: "Car Sourcing", badge: true },
  { href: "/sell-my-car", label: "Sell Your Car" },
] as const;

// Body-type quick links for the "Used Cars" dropdown. `body` must match the
// feed's body_type values (Hatchback/SUV/Saloon/Estate/Coupe/MPV/Convertible);
// the /inventory API filters on it case-insensitively, and /used-cars hydrates
// the `body` query param into the filter drawer on load.
const BODY_TYPES: { label: string; body: string }[] = [
  { label: "Hatchbacks", body: "Hatchback" },
  { label: "SUVs & 4x4s", body: "SUV" },
  { label: "Saloons", body: "Saloon" },
  { label: "Estates", body: "Estate" },
  { label: "Coupes", body: "Coupe" },
  { label: "MPVs", body: "MPV" },
];

const bodyHref = (body: string) => `/used-cars?body=${encodeURIComponent(body)}`;

/** Today's opening hours for the utility bar. */
function todayHours() {
  const oh = dealer.openingHours;
  if (!oh) return null;
  const jsDay = new Date().getDay(); // 0 = Sun … 6 = Sat
  const iso = (jsDay === 0 ? 7 : jsDay) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const value = oh[iso];
  if (!value) return { open: false as const };
  const [opens, closes] = value.split("-");
  return { open: true as const, range: `${opens} – ${closes}` };
}

const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const IconCar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 17h2v-3.3a2 2 0 0 0-.5-1.3L18 9h-3" />
    <path d="M2 9.5V12h13V6H5.8a2 2 0 0 0-1.7.9L2 9.5Z" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M9 17h6" />
  </svg>
);
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" x2="20" y1="7" y2="7" />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="17" y2="17" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [compareCount, setCompareCount] = useState(0);
  const pathname = usePathname();
  const hours = todayHours();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // Logo is dashboard-editable: brand.logo (Brand Assets upload) wins, with the
  // theme's shipped PMG mark as the fallback.
  const brand = useBrand() as { logo?: string } | null;
  const logoSrc = (brand?.logo && brand.logo.trim()) || dealer.logoPath;

  // The homepage has a full-height dark hero, so the header floats transparently
  // over it. It is NOT fixed/sticky — it scrolls away with the page (no
  // scroll-condense). Other (light) pages use the solid static header.
  const overlay = pathname === "/";

  // Live wishlist + compare counts from the shared @/app/themes/pmg-used-cars/lib/vendor/garage store
  // (localStorage-backed, fleet-standard `vp-` keys). Kept in the global header
  // so the shortlist is reachable from every page, not just the inventory list.
  useEffect(() => {
    const sync = () => {
      setWishlistCount(countSaved("wishlist"));
      setCompareCount(countSaved("compare"));
    };
    sync();
    const offWish = subscribeSaved("wishlist", sync);
    const offComp = subscribeSaved("compare", sync);
    return () => {
      offWish();
      offComp();
    };
  }, []);

  const chromeMod = overlay ? " is-overlay" : "";
  const wishLabel = wishlistCount > 0 ? `Wishlist — ${wishlistCount} saved` : "Wishlist";
  const compareLabel = compareCount > 0 ? `Compare — ${compareCount} saved` : "Compare";

  return (
    <>
      {/* Utility bar */}
      <div className={`pmg-util${chromeMod}`}>
        <div className="pmg-shell">
          <a className="u-addr" href={mapsHref} target="_blank" rel="noopener">
            <IconPin />
            <span className="u-addr-text">{addressText}</span>
          </a>
          {phoneDisplay ? (
            <a href={phoneHref} className="u-phone">
              <IconPhone /> {phoneDisplay}
            </a>
          ) : null}
          <div className="u-right">
            {hours ? (
              <span className="u-hours">
                <IconClock />{" "}
                {hours.open ? (
                  <>
                    <span className="u-open">Open today</span> · <b>{hours.range}</b>
                  </>
                ) : (
                  <b>By appointment</b>
                )}
              </span>
            ) : null}
            <span className="u-divider" />
            <div className="u-social">
              <a href="#" aria-label="Facebook"><IconFacebook /></a>
              <a href="#" aria-label="Instagram"><IconInstagram /></a>
              <a href="#" aria-label="WhatsApp"><WhatsAppIcon /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Header / nav */}
      <header className={`pmg-header${chromeMod}`}>
        <div className="pmg-shell">
          <div className="nav">
            <Link href="/" className="brand" aria-label={`${dealer.brandName} — home`}>
              <img src={logoSrc} alt={dealer.brandName} />
            </Link>
            <nav className="nav-links" aria-label="Primary">
              {NAV.map((item) =>
                "dropdown" in item && item.dropdown ? (
                  <div className="drop" key={item.href}>
                    <Link href={item.href} className={isActive(item.href) ? "nav-item-active" : undefined} aria-haspopup="true">
                      {item.label} <IconChevron />
                    </Link>
                    <div className="dropdown">
                      {BODY_TYPES.map((bt) => (
                        <Link href={bodyHref(bt.body)} key={bt.body} onClick={() => setDrawerOpen(false)}>
                          <IconCar /> {bt.label}
                        </Link>
                      ))}
                      <Link href="/used-cars" className="dropdown-all">
                        <IconCar /> View all used cars
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link href={item.href} key={item.href} className={isActive(item.href) ? "nav-item-active" : undefined}>
                    {item.label}
                    {"badge" in item && item.badge ? <span className="nav-badge">New</span> : null}
                  </Link>
                ),
              )}
            </nav>
            <div className="nav-cta">
              <Link
                href="/compare"
                className={`wishlink${compareCount > 0 ? " is-active" : ""}`}
                aria-label={compareLabel}
                title={compareLabel}
              >
                <GitCompareArrows size={18} aria-hidden="true" />
                <strong className="wishlink-count">{compareCount > 99 ? "99+" : compareCount}</strong>
              </Link>
              <Link
                href="/wishlist"
                className={`wishlink${wishlistCount > 0 ? " is-active" : ""}`}
                aria-label={wishLabel}
                title={wishLabel}
              >
                <Heart size={18} aria-hidden="true" />
                <strong className="wishlink-count">{wishlistCount > 99 ? "99+" : wishlistCount}</strong>
              </Link>
              {phoneDisplay ? (
                <a href={phoneHref} className="pmg-btn pmg-btn-primary" title={`Call ${dealer.brandName} on ${phoneDisplay}`}>
                  <IconPhone /> Call Us Today!
                </a>
              ) : null}
              <button className="burger" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
                <IconMenu />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {/* audit-ignore: a11y-div-as-button — modal backdrop; close is also reachable via the in-drawer × button + Escape/nav links */}
      <div className={`pmg-drawer-bg${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`pmg-drawer${drawerOpen ? " open" : ""}`}>
        <div className="drawer-top">
          <img src={logoSrc} alt={dealer.brandName} />
          <button className="x" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <IconX />
          </button>
        </div>
        <nav>
          {NAV.map((item) => (
            <div key={item.href} className="drawer-group">
              <Link href={item.href} onClick={() => setDrawerOpen(false)}>
                {item.label}
                {"badge" in item && item.badge ? <span className="nav-badge">New</span> : null}
              </Link>
              {"dropdown" in item && item.dropdown ? (
                <div className="drawer-sub">
                  {BODY_TYPES.map((bt) => (
                    <Link href={bodyHref(bt.body)} key={bt.body} onClick={() => setDrawerOpen(false)}>
                      {bt.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <Link href="/wishlist" className="drawer-wish" onClick={() => setDrawerOpen(false)}>
            <span className="drawer-wish-label">
              <Heart size={17} aria-hidden="true" /> Wishlist
            </span>
            {wishlistCount > 0 ? <span className="nav-badge">{wishlistCount > 99 ? "99+" : wishlistCount}</span> : null}
          </Link>
          <Link href="/compare" className="drawer-wish" onClick={() => setDrawerOpen(false)}>
            <span className="drawer-wish-label">
              <GitCompareArrows size={17} aria-hidden="true" /> Compare
            </span>
            {compareCount > 0 ? <span className="nav-badge">{compareCount > 99 ? "99+" : compareCount}</span> : null}
          </Link>
        </nav>
        {phoneDisplay ? (
          <a href={phoneHref} className="pmg-btn pmg-btn-primary pmg-btn-lg">
            <IconPhone /> Call {phoneDisplay}
          </a>
        ) : null}
      </aside>
    </>
  );
}
