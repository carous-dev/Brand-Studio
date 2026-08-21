"use client";

import Link from "next/link";
import { dealer } from "../data/site-config";
import { useBrand } from "../context/BrandClientWrapper";
import { areasServed, popularMakes } from "../lib/areas";

// SEO internal-linking band. brandstudio's router has no per-theme /make/<slug>
// or /used-cars-in/<town> dynamic routes, so these link to the native
// /used-cars inventory filter (?make=) instead of the source app's hub pages.
const FOOTER_AREAS = areasServed.slice(0, 10);
const buildMakePath = (make: string) => `/used-cars?make=${encodeURIComponent(make)}`;
const buildLocationPath = (_town: string) => `/used-cars`;

const addressText = [
  dealer.address.line1,
  dealer.address.town,
  dealer.address.county,
  dealer.address.postcode,
]
  .filter(Boolean)
  .join(", ");
const phoneHref = `tel:${(dealer.contact.phoneE164 ?? dealer.contact.phoneDisplay ?? "").replace(/\s+/g, "")}`;

const fmt = (v?: string | null) => (v ? v.replace("-", " – ") : "Closed");

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
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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
const IconTikTok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 2v3.2a5 5 0 0 0 4 4.9V13a8 8 0 0 1-4-1.1v5.6A6.5 6.5 0 1 1 9.5 11v3.3A3.2 3.2 0 1 0 12 17.4V2z" />
  </svg>
);

export function Footer() {
  const oh = dealer.openingHours;
  const year = new Date().getFullYear();
  // Dashboard-editable logo: brand.logo (Brand Assets upload) → theme default.
  const brand = useBrand() as { logo?: string } | null;
  const logoSrc = (brand?.logo && brand.logo.trim()) || dealer.logoPath;

  return (
    <footer className="pmg-footer" id="footer">
      <div className="pmg-shell">
        <div className="cols">
          <div className="fbrand">
            <img src={logoSrc} alt={dealer.brandName} />
            <p>
              A privately owned dealership in {dealer.address.town}, supplying quality used cars with
              honest, no-pressure service. Drive away with confidence.
            </p>
            <div className="fsocial">
              <a href="#" aria-label="Facebook"><IconFacebook /></a>
              <a href="#" aria-label="Instagram"><IconInstagram /></a>
              <a href="#" aria-label="TikTok"><IconTikTok /></a>
            </div>
          </div>

          <div>
            <h5>Quick links</h5>
            <ul>
              <li><Link href="/used-cars">Used cars</Link></li>
              <li><Link href="/car-sourcing">Car sourcing</Link></li>
              <li><Link href="/sell-my-car">Sell your car</Link></li>
              <li><Link href="/about">About us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h5>Get in touch</h5>
            <ul className="contact">
              <li><IconPin /> {addressText}</li>
              {dealer.contact.phoneDisplay ? (
                <li><IconPhone /> <a href={phoneHref}>{dealer.contact.phoneDisplay}</a></li>
              ) : null}
              {dealer.contact.email ? (
                <li><IconMail /> <a href={`mailto:${dealer.contact.email}`}>{dealer.contact.email}</a></li>
              ) : null}
            </ul>
          </div>

          <div>
            <h5>Opening hours</h5>
            {oh ? (
              <>
                <div className="hours-row"><span>Mon – Fri</span><b>{fmt(oh[1])}</b></div>
                <div className="hours-row"><span>Saturday</span><b>{fmt(oh[6])}</b></div>
                <div className="hours-row"><span>Sunday</span><b>{fmt(oh[7])}</b></div>
              </>
            ) : null}
            <p className="appt">Viewings by appointment — call ahead and we&apos;ll have your car ready.</p>
          </div>
        </div>

        <nav className="fseo" aria-label="Popular searches">
          <div className="fseo-row">
            <span className="fseo-label">Areas we cover</span>
            <ul className="fseo-list">
              {FOOTER_AREAS.map((area) => (
                <li key={area.town}>
                  <Link href={buildLocationPath(area.town)}>Used cars in {area.town}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="fseo-row">
            <span className="fseo-label">Browse by make</span>
            <ul className="fseo-list">
              {popularMakes.map((make) => (
                <li key={make}>
                  <Link href={buildMakePath(make)}>{make}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <p className="disclaimer">
          {dealer.brandName} is a trading name of {dealer.legalName ?? dealer.brandName}. Finance is
          subject to status and affordability; terms and conditions apply. {dealer.brandName} is a
          credit broker, not a lender, and can introduce you to a limited number of finance providers.
        </p>

        <div className="legal">
          <span>© {year} {dealer.brandName}. All rights reserved.</span>
          <div className="ll">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/cookie-policy">Cookies</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </div>
          <span className="built">
            Built with{" "}
            <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">
              Carous Limited
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
