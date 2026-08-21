import type { Metadata } from "next";
import Link from "next/link";
import { dealer } from "../../data/site-config";
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

export default function CookiePolicyPage() {
  return (
    <>
      <header className="legal-hero">
        <div className="legal-head">
          <p className="legal-kicker">How this site works</p>
          <h1>Cookie Policy</h1>
          <p className="legal-lead">
            This policy explains how {dealer.legalName ?? dealer.brandName} uses cookies and similar
            technologies on this website, and the choices available to you.
          </p>
          <span className="legal-meta">
            <IconCookie /> Last updated {UPDATED}
          </span>
        </div>
      </header>

      <section className="pmg-legal">
      <div className="legal-body">
        <h2>What cookies are</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website. They help the
          site work, remember your preferences, and let us understand how the site is used so we can
          improve it.
        </p>

        <h2>How we use them</h2>
        <ul>
          <li>
            <strong>Necessary cookies</strong> — required for the site to function (page navigation,
            security, remembering your cookie choice, and keeping your saved/compared vehicles). These
            are always on.
          </li>
          <li>
            <strong>Analytics cookies</strong> — help us understand which pages and vehicles are
            viewed so we can improve the site. Only set if you accept.
          </li>
          <li>
            <strong>Marketing cookies</strong> — used to make advertising more relevant to you and to
            measure how our campaigns perform. Only set if you accept.
          </li>
        </ul>

        <h2>Third-party cookies</h2>
        <p>
          Some cookies are set by third-party services we use — for example embedded Google Maps on
          our contact page, our enquiry and WhatsApp widgets, and analytics providers. These providers
          set their own cookies subject to their own policies.
        </p>

        <h2>Managing your choice</h2>
        <p>
          When you first visit, we ask whether to accept all cookies or necessary cookies only. Your
          choice is stored in your browser and remembered on future visits. You can change it at any
          time by clearing this site&apos;s data in your browser settings, which will prompt the cookie
          notice again. Most browsers also let you block or delete cookies through their settings —
          note that blocking necessary cookies may stop parts of the site working.
        </p>

        <h2>More about your data</h2>
        <p>
          For how we handle the personal data we collect — including through cookies — please see our{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>

        <div className="legal-callout">
          <h2>Questions about cookies?</h2>
          <p>We&apos;re happy to help — get in touch and we&apos;ll talk you through it.</p>
          <div className="legal-actions">
            {PHONE_DISPLAY ? (
              <a href={PHONE_TEL} className="pmg-btn pmg-btn-primary">
                <IconPhone /> Call {PHONE_DISPLAY}
              </a>
            ) : null}
            {EMAIL ? (
              <a href={`mailto:${EMAIL}`} className="pmg-btn pmg-btn-outline-dark">
                <IconMail /> Email us
              </a>
            ) : null}
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
