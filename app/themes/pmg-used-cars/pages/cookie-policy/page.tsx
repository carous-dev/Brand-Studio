import type { Metadata } from "next";
import Link from "next/link";
import { dealer } from "../../data/site-config";
import { resolveText } from "../../lib/brand-text";
import type { ThemePageProps } from "../../../types";
import "../legal.css";

const PHONE_DISPLAY = dealer.contact.phoneDisplay ?? "";
const PHONE_TEL = `tel:${(dealer.contact.phoneE164 ?? PHONE_DISPLAY).replace(/\s+/g, "")}`;
const EMAIL = dealer.contact.email ?? "";
const UPDATED = "August 2026";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${dealer.brandName} uses cookies and how you can manage your preferences.`,
  alternates: { canonical: `${dealer.siteUrl}/cookie-policy` },
  robots: { index: true, follow: true },
};

const IconCookie = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z" />
    <path d="M8.5 8.5v.01M16 15.5v.01M12 12v.01M11 17v.01M7 14v.01" />
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

export default function CookiePolicyPage({ brand }: ThemePageProps) {
  return (
    <>
      <header className="legal-hero">
        <div className="legal-head">
          <p className="legal-kicker">{resolveText(brand, "cookieKicker")}</p>
          <h1>{resolveText(brand, "cookieTitle")}</h1>
          <p className="legal-lead">
            {resolveText(brand, "cookieLeadPre")}
            {dealer.legalName ?? dealer.brandName}
            {resolveText(brand, "cookieLeadPost")}
          </p>
          <span className="legal-meta">
            <IconCookie /> {resolveText(brand, "cookieUpdatedLabel")} {UPDATED}
          </span>
        </div>
      </header>

      <section className="pmg-legal">
      <div className="legal-body">
        <h2>{resolveText(brand, "cookieWhatTitle")}</h2>
        <p>{resolveText(brand, "cookieWhatBody")}</p>

        <h2>{resolveText(brand, "cookieHowTitle")}</h2>
        <ul>
          <li>
            <strong>{resolveText(brand, "cookieNecessaryLabel")}</strong>
            {resolveText(brand, "cookieNecessaryBody")}
          </li>
          <li>
            <strong>{resolveText(brand, "cookieAnalyticsLabel")}</strong>
            {resolveText(brand, "cookieAnalyticsBody")}
          </li>
          <li>
            <strong>{resolveText(brand, "cookieMarketingLabel")}</strong>
            {resolveText(brand, "cookieMarketingBody")}
          </li>
        </ul>

        <h2>{resolveText(brand, "cookieThirdPartyTitle")}</h2>
        <p>{resolveText(brand, "cookieThirdPartyBody")}</p>

        <h2>{resolveText(brand, "cookieManagingTitle")}</h2>
        <p>{resolveText(brand, "cookieManagingBody")}</p>

        <h2>{resolveText(brand, "cookieMoreTitle")}</h2>
        <p>
          {resolveText(brand, "cookieMoreBody")}
          <Link href="/privacy-policy">{resolveText(brand, "cookiePrivacyLink")}</Link>.
        </p>

        <div className="legal-callout">
          <h2>{resolveText(brand, "cookieQuestionsTitle")}</h2>
          <p>{resolveText(brand, "cookieQuestionsBody")}</p>
          <div className="legal-actions">
            {PHONE_DISPLAY ? (
              <a href={PHONE_TEL} className="pmg-btn pmg-btn-primary">
                <IconPhone /> {resolveText(brand, "cookieCallLabel")} {PHONE_DISPLAY}
              </a>
            ) : null}
            {EMAIL ? (
              <a href={`mailto:${EMAIL}`} className="pmg-btn pmg-btn-outline-dark">
                <IconMail /> {resolveText(brand, "cookieEmailLabel")}
              </a>
            ) : null}
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
