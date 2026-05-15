import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function AutoPrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'this dealership'
  const address = (brand?.location as any)?.fullAddress || 'Contact the showroom for location details'
  const email = (brand?.location as any)?.email || ''

  return (
    <>
      <section className="auto-page-hero">
        <div className="auto-page-hero-inner">
          <p className="auto-page-hero-crumb">Legal</p>
          <h1>Privacy policy</h1>
          <p>How {brandName} collects, uses and protects your personal data.</p>
        </div>
      </section>

      <article className={`auto-section ${styles.policy}`}>
        <div className={`auto-container ${styles.prose}`}>
          <p className={styles.last}>Last updated: 11 May 2026</p>

          <h2>1. Who we are</h2>
          <p>
            {brandName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is registered at{' '}
            {address}. We&rsquo;re the data controller for the personal information you provide.
            For any data-protection questions please contact us {email ? <>at <a href={`mailto:${email}`}>{email}</a></> : 'via the contact page'}.
          </p>

          <h2>2. What information we collect</h2>
          <ul>
            <li><strong>Contact details</strong> &mdash; name, email, phone, address when you make an enquiry.</li>
            <li><strong>Vehicle details</strong> &mdash; when you request a valuation or part-exchange (reg, mileage).</li>
            <li><strong>Finance details</strong> &mdash; if you apply for finance through us (passed to FCA-regulated lenders only).</li>
            <li><strong>Site usage</strong> &mdash; anonymous analytics if you accept analytics cookies.</li>
          </ul>

          <h2>3. How we use your information</h2>
          <p>
            We use your data to respond to enquiries, arrange viewings, process finance applications
            through partner lenders, complete sales paperwork, provide aftercare, and (where you opt
            in) send relevant offers.
          </p>

          <h2>4. Who we share information with</h2>
          <ul>
            <li>FCA-regulated finance providers (only if you apply).</li>
            <li>HM Revenue &amp; Customs and DVLA for vehicle ownership transfer.</li>
            <li>Technology service providers operating our website &amp; CRM under data-processing agreements.</li>
          </ul>
          <p>We do <strong>not</strong> sell your data to advertisers.</p>

          <h2>5. How long we keep it</h2>
          <p>
            Enquiry data: up to 24 months. Sale records: 6 years (tax compliance). Finance application
            data: per the lender&rsquo;s retention policy.
          </p>

          <h2>6. Your rights under UK GDPR</h2>
          <p>You have the right to access, correct, delete, restrict processing, port, or object to
          processing of your personal data. Email us to exercise any of these rights.</p>

          <h2>7. Cookies</h2>
          <p>
            We use a small number of cookies on this site &mdash; see our{' '}
            <Link href="/cookie-policy">cookie policy</Link> for the full list and how to manage them.
          </p>

          <h2>8. Complaints</h2>
          <p>
            If you&rsquo;re not happy with how we&rsquo;ve handled your data, contact us first.
            You can also complain to the Information Commissioner&rsquo;s Office (ICO) at{' '}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
          </p>
        </div>
      </article>
    </>
  )
}

export default AutoPrivacyPolicyPage
