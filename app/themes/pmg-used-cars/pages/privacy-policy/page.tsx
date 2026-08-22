import type { Metadata } from "next";
import Link from "next/link";
import { dealer } from "../../data/site-config";
import { resolveText } from "../../lib/brand-text";
import type { ThemePageProps } from "../../../types";
import "../legal.css";

const CONTROLLER = `${dealer.legalName ?? dealer.brandName} of ${[
  dealer.address.line1,
  dealer.address.town,
  dealer.address.county,
  dealer.address.postcode,
]
  .filter(Boolean)
  .join(", ")}`;
const EMAIL = dealer.contact.email ?? "";
const PHONE_DISPLAY = dealer.contact.phoneDisplay ?? "";
const PHONE_TEL = `tel:${(dealer.contact.phoneE164 ?? PHONE_DISPLAY).replace(/\s+/g, "")}`;
const UPDATED = "August 2026";

const DESCRIPTION = `How ${dealer.brandName} collects, uses, stores and protects your personal data, and the rights you have under UK data protection law.`;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: DESCRIPTION,
  alternates: { canonical: `${dealer.siteUrl}/privacy-policy` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${dealer.siteUrl}/privacy-policy`,
    siteName: dealer.brandName,
    title: `Privacy Policy — ${dealer.brandName}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `Privacy Policy — ${dealer.brandName}`,
    description: DESCRIPTION,
  },
};

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function PrivacyPolicyPage({ brand }: ThemePageProps) {
  return (
    <>
      <header className="legal-hero">
        <div className="legal-head">
          <p className="legal-kicker">{resolveText(brand, "privacyKicker")}</p>
          <h1>{resolveText(brand, "privacyTitle")}</h1>
          <p className="legal-lead">{resolveText(brand, "privacyLead")}</p>
          <span className="legal-meta">
            <IconShield /> {resolveText(brand, "privacyUpdatedLabel")} {UPDATED}
          </span>
        </div>
      </header>

      <section className="pmg-legal">
      <div className="legal-body">
        <p>{resolveText(brand, "privacyIntro")}</p>
        <p>
          {resolveText(brand, "privacyControllerIntro")}{CONTROLLER}. {dealer.brandName}
          {resolveText(brand, "privacyTradingName")}{dealer.legalName ?? dealer.brandName}.
        </p>

        <h2>{resolveText(brand, "privacyCollectTitle")}</h2>
        <p>{resolveText(brand, "privacyCollectIntro")}</p>

        <h3>{resolveText(brand, "privacyGiveTitle")}</h3>
        <p>{resolveText(brand, "privacyGiveBody")}</p>

        <h3>{resolveText(brand, "privacyAutoTitle")}</h3>
        <p>{resolveText(brand, "privacyAutoIntro")}</p>
        <ul>
          <li>{resolveText(brand, "privacyAutoTech")}</li>
          <li>{resolveText(brand, "privacyAutoVisit")}</li>
        </ul>

        <h3>{resolveText(brand, "privacyOtherTitle")}</h3>
        <p>{resolveText(brand, "privacyOtherBody")}</p>

        <h2>{resolveText(brand, "privacyCookiesTitle")}</h2>
        <p>
          {resolveText(brand, "privacyCookiesBody")}
          <Link href="/cookie-policy">{resolveText(brand, "privacyCookieLink")}</Link>.
        </p>

        <h2>{resolveText(brand, "privacyUseTitle")}</h2>
        <p>{resolveText(brand, "privacyUseIntro")}</p>
        <ul>
          <li>{resolveText(brand, "privacyUseRespond")}</li>
          <li>{resolveText(brand, "privacyUseFinance")}</li>
          <li>{resolveText(brand, "privacyUsePartEx")}</li>
          <li>{resolveText(brand, "privacyUseDelivery")}</li>
          <li>{resolveText(brand, "privacyUseNotify")}</li>
          <li>{resolveText(brand, "privacyUseMarketing")}</li>
        </ul>

        <h2>{resolveText(brand, "privacyLawfulTitle")}</h2>
        <p>{resolveText(brand, "privacyLawfulBody")}</p>

        <h2>{resolveText(brand, "privacyShareTitle")}</h2>
        <p>{resolveText(brand, "privacyShareIntro")}</p>
        <ul>
          <li>{resolveText(brand, "privacyShareFinance")}</li>
          <li>{resolveText(brand, "privacyShareSuppliers")}</li>
          <li>{resolveText(brand, "privacyShareAnalytics")}</li>
          <li>{resolveText(brand, "privacyShareLaw")}</li>
        </ul>
        <p>{resolveText(brand, "privacyShareNoSell")}</p>

        <h2>{resolveText(brand, "privacyStoreTitle")}</h2>
        <p>{resolveText(brand, "privacyStoreBody")}</p>

        <h2>{resolveText(brand, "privacyRetentionTitle")}</h2>
        <p>{resolveText(brand, "privacyRetentionBody")}</p>

        <h2>{resolveText(brand, "privacyRightsTitle")}</h2>
        <p>{resolveText(brand, "privacyRightsIntro")}</p>
        <ul>
          <li>{resolveText(brand, "privacyRightsAccess")}</li>
          <li>{resolveText(brand, "privacyRightsCorrect")}</li>
          <li>{resolveText(brand, "privacyRightsErase")}</li>
          <li>{resolveText(brand, "privacyRightsObject")}</li>
          <li>{resolveText(brand, "privacyRightsWithdraw")}</li>
          <li>{resolveText(brand, "privacyRightsPortability")}</li>
        </ul>
        <p>
          {resolveText(brand, "privacyRightsContactPre")}
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>
          {resolveText(brand, "privacyRightsContactPost")}
        </p>

        <h2>{resolveText(brand, "privacyLinksTitle")}</h2>
        <p>{resolveText(brand, "privacyLinksBody")}</p>

        <h2>{resolveText(brand, "privacyChangesTitle")}</h2>
        <p>{resolveText(brand, "privacyChangesBody")}</p>

        <div className="legal-callout">
          <h2>{resolveText(brand, "privacyContactTitle")}</h2>
          <p>
            {resolveText(brand, "privacyContactBody")}{CONTROLLER}
            {EMAIL ? <>{resolveText(brand, "privacyContactEmailPhrase")}<a href={`mailto:${EMAIL}`}>{EMAIL}</a></> : null}.
          </p>
          <div className="legal-actions">
            {PHONE_DISPLAY ? (
              <a href={PHONE_TEL} className="pmg-btn pmg-btn-primary">
                <IconPhone /> {resolveText(brand, "privacyCallLabel")} {PHONE_DISPLAY}
              </a>
            ) : null}
            {EMAIL ? (
              <a href={`mailto:${EMAIL}`} className="pmg-btn pmg-btn-outline-dark">
                <IconMail /> {resolveText(brand, "privacyEmailLabel")}
              </a>
            ) : null}
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
