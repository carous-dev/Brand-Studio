import type { Metadata } from "next";
import Link from "next/link";
import { dealer } from "../../data/site-config";
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

export default function PrivacyPolicyPage() {
  return (
    <>
      <header className="legal-hero">
        <div className="legal-head">
          <p className="legal-kicker">Your data, protected</p>
          <h1>Privacy Policy</h1>
          <p className="legal-lead">
            {dealer.brandName} is committed to protecting and respecting your privacy. This policy
            explains what personal data we collect, why we collect it, how we use and store it, and
            the rights you have over it.
          </p>
          <span className="legal-meta">
            <IconShield /> Last updated {UPDATED}
          </span>
        </div>
      </header>

      <section className="pmg-legal">
      <div className="legal-body">
        <p>
          This policy (together with our terms of use and any other documents referred to on it) sets
          out the basis on which any personal data we collect from you, or that you provide to us,
          will be processed by us. Please read it carefully to understand our views and practices
          regarding your personal data and how we will treat it.
        </p>
        <p>
          For the purpose of the UK General Data Protection Regulation (UK GDPR) and the Data
          Protection Act 2018, the data controller is {CONTROLLER}. {dealer.brandName} is a trading
          name of {dealer.legalName ?? dealer.brandName}.
        </p>

        <h2>Information we collect from you</h2>
        <p>We collect and process the following data about you:</p>

        <h3>Information you give us</h3>
        <p>
          This is information you give us by filling in forms or enquiry widgets on this website, or
          by corresponding with us by phone, WhatsApp, email or in person at our Dewsbury showroom. It
          includes details you provide when you make an enquiry, request a vehicle valuation, reserve
          a car, apply for finance, ask us to source a vehicle, or report a problem with the site.
          This may include your name, address, email address and phone number, driving-licence and
          proof-of-address details for identity checks, part-exchange vehicle details, and — where you
          apply for finance — the information required by our lending partners.
        </p>

        <h3>Information we collect about you automatically</h3>
        <p>With regard to each of your visits to this site we may automatically collect:</p>
        <ul>
          <li>
            technical information, including the IP address used to connect your device to the
            internet, browser type and version, time-zone setting, operating system and platform;
          </li>
          <li>
            information about your visit, including the pages and vehicles you viewed or searched for,
            page response times, how you reached and left the site, and how you interacted with it.
          </li>
        </ul>

        <h3>Information we receive from other sources</h3>
        <p>
          We work with third parties — including finance brokers and lenders, credit-reference and
          fraud-prevention agencies, our vehicle-history providers, and analytics providers — and may
          receive information about you from them. Where we do, we will use it only for the purposes
          set out in this policy.
        </p>

        <h2>Cookies</h2>
        <p>
          Our website uses cookies to distinguish you from other users, to help the site work, and to
          let us improve it. For detailed information on the cookies we use and how to manage them,
          please see our <Link href="/cookie-policy">Cookie Policy</Link>.
        </p>

        <h2>How we use your information</h2>
        <p>We use the information we hold about you to:</p>
        <ul>
          <li>
            respond to your enquiries, arrange viewings and test drives, reserve vehicles, and carry
            out our obligations under any contract between you and us;
          </li>
          <li>
            process finance applications and identity/affordability checks with your consent, through
            our regulated lending partners;
          </li>
          <li>value your part-exchange and source a vehicle to your specification when you ask us to;</li>
          <li>
            arrange delivery, warranty, valeting and after-sales support in connection with your
            purchase;
          </li>
          <li>notify you about changes to our service, and keep our site safe and secure;</li>
          <li>
            where you have consented, send you information about vehicles or offers that may interest
            you — you can withdraw that consent at any time (see “Your rights” below).
          </li>
        </ul>

        <h2>Lawful bases for processing</h2>
        <p>
          We only process your personal data where we have a lawful basis to do so: to perform a
          contract with you (or take steps at your request before entering one); to comply with a
          legal obligation; where you have given consent (for example, marketing); or where it is in
          our legitimate interests to do so and those interests are not overridden by your rights.
        </p>

        <h2>Sharing your information</h2>
        <p>We may share your personal data with:</p>
        <ul>
          <li>
            finance brokers and lenders, where you ask us to arrange finance, and credit-reference and
            fraud-prevention agencies for the associated checks;
          </li>
          <li>
            suppliers and sub-contractors who help us deliver our service — for example vehicle
            transport/delivery, warranty administrators, payment processors and IT providers;
          </li>
          <li>analytics providers who help us improve the site;</li>
          <li>
            law-enforcement, regulators or other authorities where we are under a legal duty to
            disclose or share your data.
          </li>
        </ul>
        <p>
          We will not sell your personal data, and we will not share it with third parties for their
          own marketing purposes without your consent.
        </p>

        <h2>Where we store your data</h2>
        <p>
          All information you provide is stored on secure servers. Where a supplier processes data
          outside the UK or European Economic Area, we take steps to ensure it is protected to a
          standard equivalent to UK data protection law. Unfortunately the transmission of information
          over the internet is never completely secure; while we do our best to protect your data, any
          transmission is at your own risk.
        </p>

        <h2>How long we keep your data</h2>
        <p>
          We keep personal data only for as long as necessary for the purposes for which it was
          collected. Where you have purchased a vehicle, obtained finance or a warranty through us, we
          typically retain the associated records for up to 7 years to meet our legal and financial
          obligations. Enquiry data where no purchase is made is held for a shorter period and then
          securely deleted. We review the data we hold regularly.
        </p>

        <h2>Your rights</h2>
        <p>Under UK data protection law you have the right to:</p>
        <ul>
          <li>ask for a copy of the personal data we hold about you;</li>
          <li>ask us to correct data that is inaccurate or incomplete;</li>
          <li>ask us to erase your data, or restrict how we use it, in certain circumstances;</li>
          <li>object to processing that we carry out on the basis of legitimate interests;</li>
          <li>withdraw consent for marketing at any time;</li>
          <li>
            ask us to provide your data in a structured, machine-readable form, or transfer it to
            another organisation, where technically feasible.
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us using the details below. You also have the right
          to complain to the Information Commissioner’s Office (ICO) at{" "}
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>, though
          we would appreciate the chance to resolve your concern first.
        </p>

        <h2>Links to other websites</h2>
        <p>
          Our site may contain links to third-party websites (for example finance partners or social
          media). Those sites have their own privacy policies and we do not accept responsibility for
          them. Please check their policies before submitting any personal data.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          Any changes we make to this policy will be posted on this page. Please check back
          occasionally to stay informed of any updates.
        </p>

        <div className="legal-callout">
          <h2>Contact us about your data</h2>
          <p>
            Questions, requests or complaints about this policy or how we handle your data are welcome
            and should be addressed to {CONTROLLER}
            {EMAIL ? <> or by email to <a href={`mailto:${EMAIL}`}>{EMAIL}</a></> : null}.
          </p>
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
