import type { ThemePageProps } from '../../../types'
import { getBrandContactInfo } from '../../lib/contact'
import styles from './page.module.css'

export function QueensburyPrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Queensbury Cars'
  const contact = getBrandContactInfo(brand)

  return (
    <>
      <section className="qb-page-hero qb-page-hero--plain" data-aos="fade-up">
        <div className="qb-page-hero__inner">
          <span className="qb-page-hero__eyebrow">Legal</span>
          <h1 className="qb-page-hero__title">Privacy policy</h1>
          <p className="qb-page-hero__lead">
            How {brandName} handles your data, in plain English. Last reviewed in 2026.
          </p>
        </div>
      </section>

      <section className="qb-section">
        <div className={`qb-container ${styles.legal}`}>
          <h2>Who we are</h2>
          <p>
            {brandName} is a UK-registered used car dealer. We collect and process personal data when you enquire,
            apply for finance, sell us a vehicle, or interact with the site. We are the data controller for that
            data unless explicitly stated otherwise.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>Contact details you submit through enquiry, finance, sell-your-car, and contact forms.</li>
            <li>Vehicle interest (which cars you wishlist or compare) — stored locally in your browser only.</li>
            <li>Site-usage analytics (anonymised) if you consent to analytics cookies.</li>
            <li>Marketing preferences if you consent to marketing cookies.</li>
          </ul>

          <h2>Why we collect it</h2>
          <ul>
            <li><strong>To respond to your enquiry.</strong> Contact data goes to the buyer handling your case.</li>
            <li><strong>To process finance.</strong> Finance applications share data with the lender(s) on our panel.</li>
            <li><strong>To improve the site.</strong> Anonymised analytics help us spot bugs and improve UX.</li>
            <li><strong>To meet legal obligations.</strong> Anti-money-laundering and FCA introducer obligations.</li>
          </ul>

          <h2>Who we share it with</h2>
          <ul>
            <li>Lenders on our finance panel — only if you choose to apply for finance.</li>
            <li>Couriers and trade contacts — only when needed for delivery / sourcing.</li>
            <li>Carous Limited (platform host) for infrastructure operation.</li>
          </ul>
          <p>We never sell your data to third parties. We never share it for unrelated marketing.</p>

          <h2>How long we keep it</h2>
          <p>
            Enquiry data is kept for 24 months from last contact. Finance applications are retained for 6 years
            (FCA requirement). Sold-vehicle records are retained for 6 years for warranty obligations.
          </p>

          <h2>Your rights</h2>
          <ul>
            <li>Request a copy of the data we hold on you.</li>
            <li>Correct anything inaccurate.</li>
            <li>Ask us to delete data we no longer need.</li>
            <li>Withdraw consent at any time.</li>
            <li>Lodge a complaint with the ICO (ico.org.uk).</li>
          </ul>

          <h2>Get in touch</h2>
          <p>
            For data requests, complaints, or any privacy question, contact us at{' '}
            {contact.email ? (
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            ) : (
              'the email on the contact page'
            )}{' '}
            or phone{' '}
            {contact.phoneDisplay ? <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a> : 'us on the line listed in the footer'}.
          </p>
        </div>
      </section>
    </>
  )
}

export default QueensburyPrivacyPolicyPage
