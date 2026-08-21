import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Star,
} from "lucide-react";
import { dealer } from "../../data/site-config";
import "./contact.css";

const fullAddress = [
  dealer.address.line1,
  dealer.address.town,
  dealer.address.county,
  dealer.address.postcode,
]
  .filter(Boolean)
  .join(", ");

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${dealer.brandName} — call, WhatsApp or email us, or visit the showroom at ${fullAddress}. Viewings by appointment.`,
  alternates: {
    canonical: `${dealer.siteUrl}/contact`,
  },
};

// openingHours is keyed 1..7 (Mon..Sun) with "HH:MM-HH:MM" strings.
const DAYS: { key: 1 | 2 | 3 | 4 | 5 | 6 | 7; label: string; schema: string }[] = [
  { key: 1, label: "Monday", schema: "Monday" },
  { key: 2, label: "Tuesday", schema: "Tuesday" },
  { key: 3, label: "Wednesday", schema: "Wednesday" },
  { key: 4, label: "Thursday", schema: "Thursday" },
  { key: 5, label: "Friday", schema: "Friday" },
  { key: 6, label: "Saturday", schema: "Saturday" },
  { key: 7, label: "Sunday", schema: "Sunday" },
];

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

function fmt(hhmm: string): string {
  return hhmm; // 24h "HH:MM" is fine for UK display
}

export default function ContactPage() {
  const hours = dealer.openingHours ?? {};

  // Derive "today" + open-now in Europe/London so the highlight is correct
  // regardless of server timezone. Computed once at render — no client state.
  const londonNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/London" }),
  );
  const jsDay = londonNow.getDay(); // 0=Sun..6=Sat
  const todayKey = (jsDay === 0 ? 7 : jsDay) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const nowMinutes = londonNow.getHours() * 60 + londonNow.getMinutes();

  const todayRange = hours[todayKey];
  let isOpenNow = false;
  if (todayRange) {
    const [open, close] = todayRange.split("-");
    if (open && close) {
      isOpenNow = nowMinutes >= toMinutes(open) && nowMinutes < toMinutes(close);
    }
  }

  const phoneDisplay = dealer.contact.phoneDisplay ?? dealer.contact.phoneE164 ?? "";
  const phoneHref = `tel:${(dealer.contact.phoneE164 ?? phoneDisplay).replace(/\s+/g, "")}`;
  const email = dealer.contact.email ?? "";
  const emailHref = `mailto:${email}`;
  const waDigits = (dealer.contact.whatsappNumber ?? dealer.contact.phoneE164 ?? "").replace(
    /[^\d]/g,
    "",
  );
  const waHref = `https://wa.me/${waDigits}`;

  const mapQuery = [dealer.brandName, fullAddress].filter(Boolean).join(", ");
  const mapSrc = `https://www.google.com/maps?hl=en&q=${encodeURIComponent(mapQuery)}&z=16&output=embed`;
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: dealer.brandName,
    legalName: dealer.legalName ?? dealer.brandName,
    url: `${dealer.siteUrl}/contact`,
    image: `${dealer.siteUrl}${dealer.logoPath}`,
    logo: `${dealer.siteUrl}${dealer.logoPath}`,
    telephone: dealer.contact.phoneE164 ?? phoneDisplay,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: dealer.address.line1,
      addressLocality: dealer.address.town,
      addressRegion: dealer.address.county,
      postalCode: dealer.address.postcode,
      addressCountry: dealer.address.country ?? "GB",
    },
    openingHoursSpecification: DAYS.filter((d) => hours[d.key]).map((d) => {
      const [opens, closes] = (hours[d.key] as string).split("-");
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${d.schema}`,
        opens,
        closes,
      };
    }),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <div className="pmg-contact">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="ct-hero">
        <div className="pmg-shell ct-hero-inner">
          <span className="ct-kicker">Get in touch</span>
          <h1 className="ct-hero-title">
            Talk to <span className="ct-accent">{dealer.brandName}</span>
          </h1>
          <p className="ct-hero-lead">
            Ask about a vehicle, book a viewing, or arrange part-exchange. Call or message the
            team direct, or drop by the showroom in {dealer.address.town} — viewings by
            appointment.
          </p>

          <div className="ct-chips">
            <a href={phoneHref} className="ct-chip">
              <Phone aria-hidden="true" />
              <span>{phoneDisplay}</span>
            </a>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="ct-chip">
              <MessageCircle aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
            <a href={emailHref} className="ct-chip">
              <Mail aria-hidden="true" />
              <span>Email</span>
            </a>
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ct-chip"
            >
              <Navigation aria-hidden="true" />
              <span>Directions</span>
            </a>
          </div>

          <div className="ct-hero-meta">
            <span className="ct-rating">
              <Star aria-hidden="true" />
              Feefo <b>4.5</b> / 5
            </span>
            <span className={`ct-status ${isOpenNow ? "is-open" : "is-closed"}`}>
              <span className="ct-dot" aria-hidden="true" />
              {isOpenNow ? "Open now" : "Closed now"}
            </span>
          </div>
        </div>
      </section>

      {/* ── Overview cards ───────────────────────────────────────────────── */}
      <section className="ct-overview pmg-shell">
        <div className="ct-cards">
          {/* Call */}
          <article className="ct-card">
            <div className="ct-ico" aria-hidden="true">
              <Phone />
            </div>
            <h2 className="ct-card-title">Call the showroom</h2>
            <a href={phoneHref} className="ct-bignum">
              {phoneDisplay}
            </a>
            <p className="ct-card-note">
              The quickest way to reach us. Ask about stock, finance or booking a test drive.
            </p>
            <a href={phoneHref} className="pmg-btn pmg-btn-primary ct-card-cta">
              <Phone aria-hidden="true" />
              Call now
            </a>
          </article>

          {/* Message */}
          <article className="ct-card">
            <div className="ct-ico" aria-hidden="true">
              <MessageCircle />
            </div>
            <h2 className="ct-card-title">Message us</h2>
            <p className="ct-card-note">
              Prefer to type? Send a WhatsApp for a fast reply, or email your enquiry and we
              will get back to you during opening hours.
            </p>
            <div className="ct-card-actions">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="pmg-btn pmg-btn-primary"
              >
                <MessageCircle aria-hidden="true" />
                WhatsApp
              </a>
              <a href={emailHref} className="pmg-btn pmg-btn-outline-dark">
                <Mail aria-hidden="true" />
                Email
              </a>
            </div>
            <a href={emailHref} className="ct-email">
              {email}
            </a>
          </article>

          {/* Opening hours */}
          <article className="ct-card ct-card-hours">
            <div className="ct-card-head">
              <div className="ct-ico" aria-hidden="true">
                <Clock />
              </div>
              <span className={`ct-status ${isOpenNow ? "is-open" : "is-closed"}`}>
                <span className="ct-dot" aria-hidden="true" />
                {isOpenNow ? "Open" : "Closed"}
              </span>
            </div>
            <h2 className="ct-card-title">Opening hours</h2>
            <ul className="ct-hours">
              {DAYS.map((d) => {
                const range = hours[d.key];
                const isToday = d.key === todayKey;
                return (
                  <li key={d.key} className={isToday ? "is-today" : undefined}>
                    <span className="ct-hours-day">
                      {d.label}
                      {isToday ? <em>Today</em> : null}
                    </span>
                    <span className="ct-hours-time">
                      {range ? `${fmt(range.split("-")[0])} – ${fmt(range.split("-")[1])}` : "Closed"}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="ct-card-note ct-appt">Viewings by appointment.</p>
          </article>
        </div>
      </section>

      {/* ── Location + map ───────────────────────────────────────────────── */}
      <section className="ct-location pmg-shell">
        <div className="ct-location-grid">
          <article className="ct-location-card">
            <span className="ct-kicker ct-kicker-dark">Visit the showroom</span>
            <h2 className="ct-section-title">
              Find us in {dealer.address.town}
            </h2>
            <div className="ct-address">
              <MapPin aria-hidden="true" />
              <address>
                {dealer.address.line1}
                <br />
                {dealer.address.town}, {dealer.address.county}
                <br />
                {dealer.address.postcode}
              </address>
            </div>
            <div className="ct-location-actions">
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="pmg-btn pmg-btn-primary"
              >
                <Navigation aria-hidden="true" />
                Get directions
              </a>
              <Link href="/used-cars" className="pmg-btn pmg-btn-outline-dark">
                <Car aria-hidden="true" />
                Browse stock
              </Link>
            </div>
            <p className="ct-location-note">
              Free on-site parking. Pop in during opening hours or call ahead to reserve a
              viewing slot.
            </p>
          </article>

          <div className="ct-map-card">
            <iframe
              className="ct-map"
              src={mapSrc}
              title={`${dealer.brandName} location map — ${fullAddress}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="ct-map-foot">
              <span>{fullAddress}</span>
              <a href={directionsHref} target="_blank" rel="noopener noreferrer">
                Open in Google Maps
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Enquiry ──────────────────────────────────────────────────────── */}
      <section className="ct-enquiry pmg-shell">
        <div className="ct-enquiry-head">
          <span className="ct-kicker ct-kicker-dark">Send an enquiry</span>
          <h2 className="ct-section-title">Tell us what you are looking for</h2>
          <p className="ct-section-lead">
            Fill in the form and we will be in touch, or use one of the direct options below —
            whatever suits you best.
          </p>
        </div>

        <div className="ct-enquiry-grid">
          <article className="ct-form-card">
            <div className="ct-direct">
              <a href={phoneHref} className="pmg-btn pmg-btn-primary">
                <Phone aria-hidden="true" />
                Call
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="pmg-btn pmg-btn-outline-dark"
              >
                <MessageCircle aria-hidden="true" />
                WhatsApp
              </a>
              <a href={emailHref} className="pmg-btn pmg-btn-outline-dark">
                <Mail aria-hidden="true" />
                Email
              </a>
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="pmg-btn pmg-btn-outline-dark"
              >
                <Navigation aria-hidden="true" />
                Directions
              </a>
            </div>
            {/* Fleet-standard mount point — the Carous enquiry widget hydrates here. */}
            <div id="contact-form-widget" />
          </article>

          <aside className="ct-side-card">
            <h3 className="ct-side-title">What to include</h3>
            <ul className="ct-side-list">
              <li>
                <CheckCircle2 aria-hidden="true" />
                <span>The vehicle registration or stock reference, if you have one.</span>
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" />
                <span>Whether you are part-exchanging, and your current vehicle details.</span>
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" />
                <span>A good time to call you back, plus your preferred contact method.</span>
              </li>
            </ul>
            <div className="ct-side-foot">
              <Star aria-hidden="true" />
              <p>
                Rated <b>4.5 / 5</b> on Feefo by customers across {dealer.address.county}.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
