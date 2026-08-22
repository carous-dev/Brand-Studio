import type { Metadata } from "next";
import {
  Phone,
  MessageCircle,
  ArrowRight,
  ScanLine,
  BadgePoundSterling,
  Banknote,
  FileCheck2,
  Repeat,
  ShieldCheck,
  Gauge,
  Check,
} from "lucide-react";
import { dealer } from "../../data/site-config";
import { SellYourCarMount } from "../../components/SellYourCarMount";
import { resolveText } from "../../lib/brand-text";
import type { ThemePageProps } from "../../../types";
import "./sell-your-car.css";

const BRAND = dealer.brandName;
const LEGAL = dealer.legalName;
const TOWN = dealer.address.town;
const COUNTY = dealer.address.county ?? "";
const POSTCODE = dealer.address.postcode ?? "";
const LINE1 = dealer.address.line1 ?? "";
const PHONE_DISPLAY = dealer.contact.phoneDisplay ?? "";
const PHONE_TEL = `tel:${(dealer.contact.phoneE164 ?? PHONE_DISPLAY).replace(/\s+/g, "")}`;
const WA_NUMBER = (dealer.contact.whatsappNumber ?? "").replace(/[^\d]/g, "");
const WA_HREF = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "Hi PMG, I'd like a valuation to sell my car.",
)}`;

export const metadata: Metadata = {
  title: `Sell Your Car in ${TOWN}`,
  description: `Get a free, no-obligation dealer valuation and sell your car to ${BRAND}. Enter your reg for an instant guide price, get a confirmed offer within 24 hours, and paid the same day — part-exchange or straight sale across ${COUNTY}.`,
  alternates: { canonical: `${dealer.siteUrl}/sell-your-car` },
  openGraph: {
    title: `Sell Your Car to ${BRAND}`,
    description: `Free dealer valuation — instant guide price, confirmed offer in 24 hours, paid same day in ${TOWN}, ${COUNTY}.`,
    url: `${dealer.siteUrl}/sell-your-car`,
    siteName: BRAND,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Sell Your Car to ${BRAND}`,
    description: `Free dealer valuation — instant guide price, confirmed offer in 24 hours, paid same day.`,
  },
};

const CHIPS = ["Free valuation", "No obligation", "Paid same day"];

const STEPS: Array<{ title: string; body: string; meta: string }> = [
  {
    title: "Enter your reg",
    body: "Pop in your registration and current mileage. We pull the vehicle details and an instant guide price straight away — no forms, no phone tag.",
    meta: "Takes 60 seconds",
  },
  {
    title: "We confirm the offer",
    body: "Add a few details about condition and history. Our buyers review it and come back with a firm, market-led offer — usually within 24 hours.",
    meta: "Within 24 hours",
  },
  {
    title: "Get paid same day",
    body: "Happy with the figure? We handle the paperwork, settle any outstanding finance and pay straight into your account the day we collect.",
    meta: "Fast bank transfer",
  },
];

const REASONS: Array<{ title: string; body: string; icon: React.ReactNode }> = [
  {
    title: "Fair, market-led offers",
    body: "Guide prices are drawn from live market data, then confirmed by our buyers. No lowball tactics — just an honest figure for your car.",
    icon: <BadgePoundSterling aria-hidden="true" />,
  },
  {
    title: "Paid the same day",
    body: "Accept the offer and the money is with you the day we collect — a fast, secure bank transfer, no waiting around for a cheque to clear.",
    icon: <Banknote aria-hidden="true" />,
  },
  {
    title: "Outstanding finance settled",
    body: "Still paying the car off? No problem. We settle the finance directly with your lender and pay you any balance over the settlement figure.",
    icon: <ShieldCheck aria-hidden="true" />,
  },
  {
    title: "Paperwork handled for you",
    body: "V5C, notification to the DVLA and the sale documents are all taken care of by our team, so there is nothing for you to chase afterwards.",
    icon: <FileCheck2 aria-hidden="true" />,
  },
  {
    title: "Part-exchange welcome",
    body: "Selling because you are upgrading? Put the value straight towards anything on our pitch and drive away in one visit.",
    icon: <Repeat aria-hidden="true" />,
  },
  {
    title: "Any make, any mileage",
    body: "Prestige or runabout, low miles or high, petrol, diesel, hybrid or electric — we buy across the board and value every car on its merits.",
    icon: <Gauge aria-hidden="true" />,
  },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How is my valuation worked out?",
    a: `The instant figure is a guide price based on your registration, mileage and current market data. Our buyers then confirm a firm offer once they have reviewed the condition, service history and specification — usually within 24 hours.`,
  },
  {
    q: "Is the instant valuation a guaranteed offer?",
    a: "The online figure is an indicative guide, not a binding offer. It gives you a realistic ballpark up front; the confirmed offer comes from our team after a quick review and is the price you are actually paid.",
  },
  {
    q: "Can I sell if I still have finance on the car?",
    a: `Yes. Tell us on the form and we will obtain your settlement figure, pay the lender directly and hand you any balance above it. ${BRAND} handles the whole process for you.`,
  },
  {
    q: "Do I have to buy a car from you to sell mine?",
    a: "Not at all. You can sell to us outright with no obligation to buy anything back. If you do fancy an upgrade, we are happy to put your car's value towards part-exchange instead.",
  },
  {
    q: "How quickly do I get paid?",
    a: "Once you accept the offer and we have the car and paperwork, payment goes out by secure bank transfer the same day — typically reaching your account within a couple of hours.",
  },
  {
    q: "What do I need to bring or have ready?",
    a: "Your V5C logbook, service history if you have it, both sets of keys and a form of ID. If there is outstanding finance, the lender's details help us get your settlement figure quickly.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: `Sell your car to ${BRAND}`,
  serviceType: "Used car purchasing and free dealer valuation",
  description: `${BRAND} buys used cars from the public — free, no-obligation valuations, confirmed offers within 24 hours and same-day payment from ${TOWN}, ${COUNTY}. Part-exchange or outright sale, outstanding finance settled.`,
  provider: {
    "@type": "AutoDealer",
    name: BRAND,
    legalName: LEGAL,
    url: dealer.siteUrl,
    telephone: dealer.contact.phoneE164 ?? PHONE_DISPLAY,
    email: dealer.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: LINE1,
      addressLocality: TOWN,
      addressRegion: COUNTY,
      postalCode: POSTCODE,
      addressCountry: "GB",
    },
  },
  areaServed: [
    { "@type": "City", name: TOWN },
    { "@type": "AdministrativeArea", name: COUNTY },
    { "@type": "Country", name: "United Kingdom" },
  ],
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: `${dealer.siteUrl}/sell-your-car`,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GBP",
    description: "Free dealer valuation — no obligation.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function SellYourCarPage({ brand }: ThemePageProps) {
  return (
    <main className="pmg-syc">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── Hero — jet banner, red glow. Standalone: the valuation widget lives
             in its own light section directly below (not floated on the dark). ── */}
      <header className="syc-hero" aria-labelledby="syc-title">
        <div className="syc-hero-bg" aria-hidden="true" />
        <div className="pmg-shell">
          <div className="syc-hero-copy">
            <p className="syc-kicker">{resolveText(brand, "sellHeroKicker")}</p>
            <h1 id="syc-title" className="syc-title">
              {resolveText(brand, "sellHeroTitleLead")}{" "}
              <span className="syc-accent">{resolveText(brand, "sellHeroTitleAccent")}</span>
            </h1>
            <p className="syc-lead">{resolveText(brand, "sellHeroLead")}</p>
            <ul className="syc-chips">
              {CHIPS.map((c) => (
                <li key={c}>
                  <Check aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
            <dl className="syc-hero-stats">
              <div>
                <dd>
                  4.5 <span className="syc-star">&#9733;</span>
                </dd>
                <dt>{resolveText(brand, "sellStatRatingLabel")}</dt>
              </div>
              <div>
                <dd>24 hrs</dd>
                <dt>{resolveText(brand, "sellStatOfferLabel")}</dt>
              </div>
              <div>
                <dd>{resolveText(brand, "sellStatPaidValue")}</dd>
                <dt>{resolveText(brand, "sellStatPaidLabel")}</dt>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {/* ── Valuation widget — its own light section, pulled up to meet the hero ── */}
      <section className="syc-valuation" aria-label={resolveText(brand, "sellValuationAriaLabel")}>
        <div className="pmg-shell">
          <div className="syc-form-panel">
            <span className="syc-form-flag" aria-hidden="true">
              <ScanLine aria-hidden="true" />
              Instant guide price
            </span>
            <SellYourCarMount />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="syc-section syc-how" aria-labelledby="syc-how-title">
        <div className="pmg-shell">
          <div className="syc-head">
            <p className="syc-eyebrow">{resolveText(brand, "sellHowEyebrow")}</p>
            <h2 className="syc-h2" id="syc-how-title">
              From reg to <em>paid</em> in three steps.
            </h2>
            <p className="syc-sub">{resolveText(brand, "sellHowSub")}</p>
          </div>
          <ol className="syc-steps">
            {STEPS.map((s, i) => {
              const StepIcon = [ScanLine, BadgePoundSterling, Banknote][i];
              return (
                <li key={s.title} className="syc-step">
                  <span className="syc-step-badge" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="syc-step-num">
                    <StepIcon aria-hidden="true" width={15} height={15} />
                    Step {i + 1}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <span className="syc-step-meta">{s.meta}</span>
                </li>
              );
            })}
          </ol>
          <div className="syc-how-cta">
            <a href="#sell-form" className="pmg-btn pmg-btn-dark pmg-btn-lg">
              Value my car
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Why sell to PMG ── */}
      <section className="syc-section syc-why-section" aria-labelledby="syc-why-title">
        <div className="pmg-shell">
          <div className="syc-head">
            <p className="syc-eyebrow">{resolveText(brand, "sellWhyEyebrow")}</p>
            <h2 className="syc-h2" id="syc-why-title">
              A fair price, and none of the hassle.
            </h2>
            <p className="syc-sub">{resolveText(brand, "sellWhySub")}</p>
          </div>
          <ul className="syc-why-grid">
            {REASONS.map((item) => (
              <li key={item.title} className="syc-why">
                <span className="syc-why-ico" aria-hidden="true">
                  {item.icon}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="syc-section" aria-labelledby="syc-faq-title">
        <div className="pmg-shell">
          <div className="syc-head">
            <p className="syc-eyebrow">{resolveText(brand, "sellFaqEyebrow")}</p>
            <h2 className="syc-h2" id="syc-faq-title">
              Selling to us, in plain English.
            </h2>
          </div>
          <div className="syc-faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closer ── */}
      <section className="syc-section syc-closer" aria-labelledby="syc-closer-title">
        <div className="pmg-shell">
          <div className="syc-closer-inner">
            <p className="syc-eyebrow">{resolveText(brand, "sellCloserEyebrow")}</p>
            <h2 id="syc-closer-title">{resolveText(brand, "sellCloserTitle")}</h2>
            <p className="syc-closer-sub">{resolveText(brand, "sellCloserSub")}</p>
            <div className="syc-cta">
              <a href="#sell-form" className="pmg-btn pmg-btn-dark pmg-btn-lg">
                Get my free valuation
                <ArrowRight aria-hidden="true" />
              </a>
              {PHONE_DISPLAY ? (
                <a href={PHONE_TEL} className="pmg-btn pmg-btn-lg syc-btn-ghost">
                  <Phone aria-hidden="true" />
                  Call {PHONE_DISPLAY}
                </a>
              ) : null}
              {WA_NUMBER ? (
                <a
                  href={WA_HREF}
                  className="pmg-btn pmg-btn-lg syc-btn-ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden="true" />
                  WhatsApp us
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
