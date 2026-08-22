import type { Metadata } from "next";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Truck,
  Repeat,
  Handshake,
  Eye,
  Wrench,
  CalendarClock,
  Sparkles,
  Search,
  Wallet,
  BadgeCheck,
  MapPin,
  Phone,
  ArrowRight,
  Home,
  Gauge,
} from "lucide-react";
import { dealer } from "../../data/site-config";
import { resolveText } from "../../lib/brand-text";
import type { ThemePageProps } from "../../../types";
import "./about.css";

export const metadata: Metadata = {
  title: "About",
  description:
    `${dealer.legalName} (${dealer.brandName}) is a privately owned dealership in ${dealer.address.town}, ${dealer.address.county} — hand-picked stock, transparent no-pressure buying, in-house warranty and honest advice, serving West Yorkshire and nationwide.`,
  alternates: { canonical: `${dealer.siteUrl}/about` },
};

const addressLine = [
  dealer.address.line1,
  dealer.address.town,
  dealer.address.county,
  dealer.address.postcode,
].filter(Boolean).join(", ");

const stats = [
  { icon: Star, big: "4.5", small: "/ 5", label: "Feefo rated", note: "Verified buyer reviews" },
  { icon: ShieldCheck, big: "In-house", small: "warranty", label: "Peace of mind", note: "Cover included as standard" },
  { icon: Truck, big: "30mi", small: "free", label: "Nationwide delivery", note: "Affordable beyond 30 miles" },
  { icon: Repeat, big: "Part-ex", small: "welcome", label: "Trade-in", note: "Fair, transparent valuations" },
];

const values = [
  {
    icon: Handshake,
    title: "No-pressure buying",
    body: "Honest advice, straight answers and time to decide. We match the car to you — never the other way round.",
  },
  {
    icon: BadgeCheck,
    title: "Hand-picked stock",
    body: "Every vehicle is chosen on merit and prepared to a high standard, with a multi-point health check before it reaches you.",
  },
  {
    icon: ShieldCheck,
    title: "Cover that lasts",
    body: "In-house warranty as standard, plus full after-sales support through trusted garages long after the warranty ends.",
  },
  {
    icon: Sparkles,
    title: "Prepared with care",
    body: "Professional valeting and thorough preparation mean each car looks and drives its best on the day you collect it.",
  },
];

const services = [
  { icon: ShieldCheck, title: "In-house warranty", body: "Cover included on our stock, with clear terms and no hidden clauses." },
  { icon: Wrench, title: "Full after-sales support", body: "Ongoing help through trusted garages — even after your warranty ends." },
  { icon: Search, title: "Vehicle sourcing", body: "Can't see the exact car? We'll procure it to your spec and budget." },
  { icon: Wallet, title: "Finance options", body: "Flexible funding to suit your circumstances, arranged with minimal fuss." },
  { icon: Truck, title: "Home & nationwide delivery", body: "Free delivery up to 30 miles, affordable rates beyond — brought to your door." },
  { icon: Eye, title: "Live video viewing", body: "A real-time walkaround before you travel, so you buy with confidence." },
  { icon: CalendarClock, title: "Rapid appointments", body: "Fast, flexible scheduling — including a refundable holding deposit to reserve." },
  { icon: Gauge, title: "Multi-point health checks", body: "Every car inspected against a thorough checklist before it's offered for sale." },
];

const reasons = [
  {
    title: "Bought right, not just cheap",
    body: "We buy carefully so you don't inherit someone else's problem — quality over volume, every time.",
  },
  {
    title: "Transparent from first message",
    body: "Clear pricing, honest descriptions and a refundable holding deposit to secure the car while you decide.",
  },
  {
    title: "Flexible however you buy",
    body: "Visit us by appointment, take a live video walkaround, or have your car delivered to your door nationwide.",
  },
  {
    title: "We're here after handover",
    body: "In-house warranty plus continued after-sales support means the relationship doesn't end at the sale.",
  },
];

export default function AboutPage({ brand }: ThemePageProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${dealer.brandName}`,
    url: `${dealer.siteUrl}/about`,
    mainEntity: {
      "@type": "AutoDealer",
      name: dealer.brandName,
      legalName: dealer.legalName,
      url: dealer.siteUrl,
      telephone: dealer.contact.phoneE164,
      email: dealer.contact.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: dealer.address.line1,
        addressLocality: dealer.address.town,
        addressRegion: dealer.address.county,
        postalCode: dealer.address.postcode,
        addressCountry: dealer.address.country,
      },
      areaServed: [
        { "@type": "AdministrativeArea", name: "West Yorkshire" },
        { "@type": "Country", name: "United Kingdom" },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5",
        bestRating: "5",
        ratingCount: "1",
      },
    },
  };

  return (
    <div className="pmg-about">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="ab-hero">
        <div className="ab-hero-glow" aria-hidden="true" />
        <div className="pmg-shell ab-hero-inner">
          <span className="ab-eyebrow">About {dealer.brandName}</span>
          <h1 className="ab-hero-title">
            A dealership built on <em>trust</em>, not the hard sell.
          </h1>
          <p className="ab-hero-lead">{resolveText(brand, "aboutHeroLead")}</p>
          <div className="ab-hero-btns">
            <Link href="/used-cars" className="pmg-btn pmg-btn-primary pmg-btn-lg">
              Browse our cars <ArrowRight />
            </Link>
            <Link href="/contact" className="pmg-btn pmg-btn-outline-light pmg-btn-lg">
              Talk to the team
            </Link>
          </div>
          <div className="ab-hero-meta">
            <span><MapPin /> {dealer.address.town}, {dealer.address.postcode}</span>
            <span><Phone /> {dealer.contact.phoneDisplay}</span>
            <span><Star /> Feefo 4.5 / 5</span>
          </div>
        </div>
      </section>

      {/* ── Stat / trust strip ───────────────────────────────── */}
      <section className="ab-stats" aria-label={resolveText(brand, "aboutStatsAria")}>
        <div className="pmg-shell ab-stats-grid">
          {stats.map((s) => (
            <div className="ab-stat" key={s.label}>
              <div className="ab-stat-ico" aria-hidden="true"><s.icon /></div>
              <div className="ab-stat-num">
                {s.big} <span>{s.small}</span>
              </div>
              <div className="ab-stat-label">{s.label}</div>
              <p className="ab-stat-note">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Story / who we are ───────────────────────────────── */}
      <section className="ab-story">
        <div className="pmg-shell ab-story-grid">
          <div className="ab-story-main">
            <span className="ab-eyebrow ab-eyebrow-dark">{resolveText(brand, "aboutStoryEyebrow")}</span>
            <h2 className="ab-h2">{resolveText(brand, "aboutStoryTitle")}</h2>
            <p>{resolveText(brand, "aboutStoryBody1")}</p>
            <p>{resolveText(brand, "aboutStoryBody2")}</p>
            <p>{resolveText(brand, "aboutStoryBody3")}</p>
          </div>

          <aside className="ab-story-panel" aria-label={resolveText(brand, "aboutVisitAria")}>
            <h3>{resolveText(brand, "aboutVisitTitle")}</h3>
            <ul className="ab-panel-list">
              <li><MapPin /> <span>{addressLine}</span></li>
              <li><Phone /> <span><a href={`tel:${dealer.contact.phoneE164}`}>{dealer.contact.phoneDisplay}</a></span></li>
              <li><BadgeCheck /> <span>{resolveText(brand, "aboutVisitAppointment")}</span></li>
            </ul>
            <div className="ab-panel-hours">
              <div className="ab-hours-row"><span>{resolveText(brand, "aboutHoursWeekdayLabel")}</span><b>10:00 – 17:00</b></div>
              <div className="ab-hours-row"><span>Saturday</span><b>10:00 – 16:30</b></div>
              <div className="ab-hours-row"><span>Sunday</span><b>11:00 – 15:00</b></div>
            </div>
            <Link href="/contact" className="pmg-btn pmg-btn-primary ab-panel-cta">
              Book a viewing <ArrowRight />
            </Link>
          </aside>
        </div>
      </section>

      {/* ── Values grid (hairline on jet) ────────────────────── */}
      <section className="ab-values">
        <div className="ab-values-glow" aria-hidden="true" />
        <div className="pmg-shell">
          <div className="ab-sec-head">
            <span className="ab-eyebrow">{resolveText(brand, "aboutValuesEyebrow")}</span>
            <h2 className="ab-h2 ab-h2-light">{resolveText(brand, "aboutValuesTitle")}</h2>
            <p className="ab-sec-sub">{resolveText(brand, "aboutValuesSub")}</p>
          </div>
          <div className="ab-values-grid">
            {values.map((v, i) => (
              <article className="ab-value-card" key={v.title}>
                <span className="ab-value-idx">{String(i + 1).padStart(2, "0")}</span>
                <div className="ab-value-ico" aria-hidden="true"><v.icon /></div>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="ab-services">
        <div className="pmg-shell">
          <div className="ab-sec-head">
            <span className="ab-eyebrow ab-eyebrow-dark">{resolveText(brand, "aboutServicesEyebrow")}</span>
            <h2 className="ab-h2">{resolveText(brand, "aboutServicesTitle")}</h2>
            <p className="ab-sec-sub ab-sub-muted">{resolveText(brand, "aboutServicesSub")}</p>
          </div>
          <div className="ab-svc-grid">
            {services.map((s) => (
              <div className="ab-svc-item" key={s.title}>
                <div className="ab-svc-ico" aria-hidden="true"><s.icon /></div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why buy — numbered reasons ───────────────────────── */}
      <section className="ab-why">
        <div className="pmg-shell ab-why-grid">
          <div className="ab-why-intro">
            <span className="ab-eyebrow">{resolveText(brand, "aboutWhyEyebrow")}</span>
            <h2 className="ab-h2 ab-h2-light">{resolveText(brand, "aboutWhyTitle")}</h2>
            <p className="ab-sec-sub">{resolveText(brand, "aboutWhySub")}</p>
            <Link href="/used-cars" className="pmg-btn pmg-btn-primary pmg-btn-lg ab-why-cta">
              See what's in stock <ArrowRight />
            </Link>
          </div>
          <ol className="ab-why-list">
            {reasons.map((r, i) => (
              <li className="ab-why-item" key={r.title}>
                <span className="ab-why-num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Closing CTA band ─────────────────────────────────── */}
      <section className="ab-cta">
        <div className="pmg-shell ab-cta-inner">
          <div className="ab-cta-text">
            <span className="ab-eyebrow ab-eyebrow-onred">{resolveText(brand, "aboutCtaEyebrow")}</span>
            <h2>{resolveText(brand, "aboutCtaTitle")}</h2>
            <p>{resolveText(brand, "aboutCtaBody")}</p>
          </div>
          <div className="ab-cta-btns">
            <Link href="/used-cars" className="pmg-btn pmg-btn-dark pmg-btn-lg">
              <Home /> Browse cars
            </Link>
            <Link href="/car-sourcing" className="pmg-btn pmg-btn-outline-light pmg-btn-lg">
              <Search /> Source a car
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
