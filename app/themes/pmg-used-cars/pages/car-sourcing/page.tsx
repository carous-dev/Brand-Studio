import type { Metadata } from "next";
import {
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  Search,
  BadgeCheck,
  Truck,
  Wrench,
  Wallet,
  Repeat,
  FileSearch,
  Star,
  Check,
} from "lucide-react";
import { dealer } from "../../data/site-config";
import { resolveText } from "../../lib/brand-text";
import type { ThemePageProps } from "../../../types";
import "./car-sourcing.css";

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
  "Hi PMG, I'd like you to source a car for me.",
)}`;

export const metadata: Metadata = {
  title: `Car Sourcing in ${TOWN}`,
  description: `Can't find the right car? ${BRAND}'s Vehicle Procurement Service finds and buys it for you — give us the make, budget and must-haves and our ${COUNTY} team sources it, prepares it and delivers it. Refundable holding deposit, no obligation.`,
  alternates: { canonical: `${dealer.siteUrl}/car-sourcing` },
};

const CHIPS = ["Refundable deposit", "No obligation", "Part-ex welcome"];

const STEPS: Array<{ title: string; body: string; meta: string }> = [
  {
    title: "Share the brief",
    body: "Make, model, trim, mileage, colour, budget — as precise or as loose as you like. A two-minute call sharpens it if you're unsure.",
    meta: "Takes 2 minutes",
  },
  {
    title: "We work the trade",
    body: "Our buyers hunt the wider market — trade contacts, main-dealer part-exchanges and auction stock the public never sees — and check every candidate over.",
    meta: "The legwork is ours",
  },
  {
    title: "You approve it",
    body: "We send options with photos and the full history. A small refundable holding deposit reserves the one you like — only then do we buy it.",
    meta: "You stay in control",
  },
  {
    title: "Prepared & delivered",
    body: "Multi-point health check and full valet, warranty set up, then free delivery to your door within 30 miles — affordable rates beyond.",
    meta: "Ready to drive",
  },
];

const INCLUDES: Array<{ title: string; body: string; icon: React.ReactNode }> = [
  {
    title: "Full provenance check",
    body: "Every car we source is checked for outstanding finance, write-offs, theft markers and mileage discrepancies before you ever see it.",
    icon: <FileSearch aria-hidden="true" />,
  },
  {
    title: "Prepared to retail standard",
    body: "A multi-point health check and full valet on every car — sourced stock gets exactly the same preparation as the cars on our own pitch.",
    icon: <Wrench aria-hidden="true" />,
  },
  {
    title: "In-house warranty",
    body: "Drive away covered. Every sourced car comes with our own in-house warranty, with longer cover available on request.",
    icon: <ShieldCheck aria-hidden="true" />,
  },
  {
    title: "Finance options",
    body: "Spread the cost through our finance partners. We can arrange a decision in principle before the search even begins.",
    icon: <Wallet aria-hidden="true" />,
  },
  {
    title: "Part-exchange",
    body: "Put your current car towards the sourced one. We value it up front so the numbers are clear from the very start.",
    icon: <Repeat aria-hidden="true" />,
  },
  {
    title: "Free nationwide delivery",
    body: "Delivered to your door free within 30 miles of Dewsbury, with affordable rates for anywhere else in the UK.",
    icon: <Truck aria-hidden="true" />,
  },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What is the Vehicle Procurement Service?",
    a: `It's our bespoke sourcing service. Instead of you trawling listings, ${BRAND} sources and purchases a vehicle tailored to exactly what you need — saving you the time, effort and stress of the search while we handle checks, preparation and delivery.`,
  },
  {
    q: "How much does it cost to start?",
    a: "A refundable holding deposit reserves the car you approve — it comes straight off the price and is returned if the deal doesn't proceed. The figure we agree up front is the figure you pay for the car.",
  },
  {
    q: "Do I have to buy the car you find?",
    a: "No. We present options and you approve or pass. We only purchase a car once you've said yes to it, so there's never a vehicle bought on your behalf that you didn't choose.",
  },
  {
    q: "How long does sourcing usually take?",
    a: "Most briefs are matched within a couple of weeks. Rare specs or tight budgets can take a little longer — we'll be honest about that when we take the brief and keep you posted throughout.",
  },
  {
    q: "Can I part-exchange and use finance?",
    a: "Yes to both. We value your part-exchange at the start, and finance options are available on sourced cars just as they are on our forecourt stock — often with a decision in principle before the search begins.",
  },
  {
    q: "Do you deliver, and is there a warranty?",
    a: `Every sourced car is health-checked, valeted and comes with our in-house warranty. Delivery is free within 30 miles of ${TOWN}, with affordable rates nationwide.`,
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: `Vehicle Procurement Service by ${BRAND}`,
  serviceType: "Used-car sourcing / vehicle procurement",
  description: `${BRAND} sources and purchases used vehicles tailored to each customer — history-checked, prepared to retail standard, warranted and delivered from ${TOWN}, ${COUNTY}.`,
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
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GBP",
    description: "No obligation — a refundable holding deposit reserves your car and comes off the price.",
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

export default function CarSourcingPage({ brand }: ThemePageProps) {
  return (
    <main className="pmg-sourcing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── Hero ── */}
      <header className="ps-hero" aria-labelledby="ps-title">
        <div className="ps-hero-bg" aria-hidden="true" />
        <div className="pmg-shell">
          <div className="ps-hero-inner">
            <p className="ps-kicker">Vehicle Procurement · {TOWN}</p>
            <h1 id="ps-title" className="ps-title">
              {resolveText(brand, "csrcHeroTitleLead")} <span className="ps-accent">{resolveText(brand, "csrcHeroTitleAccent")}</span>
            </h1>
            <p className="ps-lead">{resolveText(brand, "csrcHeroLead")}</p>
            <ul className="ps-chips">
              {CHIPS.map((c) => (
                <li key={c}>
                  <Check aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
            <div className="ps-cta">
              {PHONE_DISPLAY ? (
                <a href={PHONE_TEL} className="pmg-btn pmg-btn-primary pmg-btn-lg">
                  <Phone aria-hidden="true" />
                  Call {PHONE_DISPLAY}
                </a>
              ) : null}
              {WA_NUMBER ? (
                <a
                  href={WA_HREF}
                  className="pmg-btn pmg-btn-lg ps-btn-wa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden="true" />
                  WhatsApp your brief
                </a>
              ) : null}
              <a href="/contact" className="pmg-btn pmg-btn-lg pmg-btn-outline-light">
                Send an enquiry
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats strip ── */}
      <section className="ps-stats" aria-label={resolveText(brand, "csrcStatsAria")}>
        <div className="pmg-shell">
          <dl className="ps-stats-inner">
            <div className="ps-stat">
              <dd>
                4.5 <span className="ps-stat-star">&#9733;</span>
              </dd>
              <dt>{resolveText(brand, "csrcFeefoLabel")}</dt>
            </div>
            <div className="ps-stat">
              <dd>&pound;0</dd>
              <dt>{resolveText(brand, "csrcStatObligation")}</dt>
            </div>
            <div className="ps-stat">
              <dd>30 mi</dd>
              <dt>{resolveText(brand, "csrcStatDelivery")}</dt>
            </div>
            <div className="ps-stat">
              <dd>Checked</dd>
              <dt>{resolveText(brand, "csrcStatChecked")}</dt>
            </div>
          </dl>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="ps-section ps-how" aria-labelledby="ps-how-title">
        <div className="pmg-shell">
          <div className="ps-head">
            <p className="ps-eyebrow">{resolveText(brand, "csrcHowEyebrow")}</p>
            <h2 className="ps-h2" id="ps-how-title">
              Four steps to the <em>right</em> car.
            </h2>
            <p className="ps-sub">{resolveText(brand, "csrcHowSub")}</p>
          </div>
          <ol className="ps-steps">
            {STEPS.map((s, i) => {
              const StepIcon = [ClipboardList, Search, BadgeCheck, Truck][i];
              return (
                <li key={s.title} className="ps-step">
                  <span className="ps-step-badge" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="ps-step-num">
                    <StepIcon aria-hidden="true" width={15} height={15} />
                    Step {i + 1}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <span className="ps-step-meta">{s.meta}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── What's included ── */}
      <section className="ps-section ps-inc-section" aria-labelledby="ps-inc-title">
        <div className="pmg-shell">
          <div className="ps-head">
            <p className="ps-eyebrow">{resolveText(brand, "csrcIncEyebrow")}</p>
            <h2 className="ps-h2" id="ps-inc-title">
              Sourced anywhere, prepared like our own.
            </h2>
            <p className="ps-sub">{resolveText(brand, "csrcIncSub")}</p>
          </div>
          <ul className="ps-inc-grid">
            {INCLUDES.map((item) => (
              <li key={item.title} className="ps-inc">
                <span className="ps-inc-ico" aria-hidden="true">
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

      {/* ── Proof ── */}
      <section className="ps-section ps-proof" aria-labelledby="ps-proof-title">
        <div className="pmg-shell">
          <div className="ps-proof-inner">
            <h2 id="ps-proof-title" className="ps-eyebrow">
              Trusted by buyers
            </h2>
            <div className="ps-stars" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} fill="currentColor" />
              ))}
            </div>
            <blockquote className="ps-quote">
              <p>
                &ldquo;They found exactly the car I&apos;d been chasing for weeks, sorted the finance
                and had it valeted and delivered to my door. Genuinely took all the stress out of
                it.&rdquo;
              </p>
              <footer>
                &mdash; <b>Verified {BRAND} customer</b>, Feefo review
              </footer>
            </blockquote>
            <div className="ps-proof-badges">
              <div>
                <span>{resolveText(brand, "csrcFeefoLabel")}</span>
                <b>
                  4.5 / 5 <span className="ps-stat-star">&#9733;</span>
                </b>
              </div>
              <div>
                <span>{resolveText(brand, "csrcReserveLabel")}</span>
                <b>{resolveText(brand, "csrcReserveValue")}</b>
              </div>
              <div>
                <span>{resolveText(brand, "csrcBackedLabel")}</span>
                <b>{resolveText(brand, "csrcBackedValue")}</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="ps-section" aria-labelledby="ps-faq-title">
        <div className="pmg-shell">
          <div className="ps-head">
            <p className="ps-eyebrow">{resolveText(brand, "csrcFaqEyebrow")}</p>
            <h2 className="ps-h2" id="ps-faq-title">
              The service, in plain English.
            </h2>
          </div>
          <div className="ps-faq">
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
      <section className="ps-section ps-closer" aria-labelledby="ps-closer-title">
        <div className="pmg-shell">
          <div className="ps-closer-inner">
            <p className="ps-eyebrow">{resolveText(brand, "csrcCloserEyebrow")}</p>
            <h2 id="ps-closer-title">{resolveText(brand, "csrcCloserTitle")}</h2>
            <p className="ps-closer-sub">{resolveText(brand, "csrcCloserSub")}</p>
            <div className="ps-cta">
              {PHONE_DISPLAY ? (
                <a href={PHONE_TEL} className="pmg-btn pmg-btn-dark pmg-btn-lg">
                  <Phone aria-hidden="true" />
                  Call {PHONE_DISPLAY}
                </a>
              ) : null}
              {WA_NUMBER ? (
                <a
                  href={WA_HREF}
                  className="pmg-btn pmg-btn-lg ps-btn-wa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden="true" />
                  WhatsApp us
                </a>
              ) : null}
              <a href="/contact" className="pmg-btn pmg-btn-lg pmg-btn-outline-light">
                Send an enquiry
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
