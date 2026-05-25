import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function AxisPrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Axis Autos'
  return (
    <main>
      <section className="axis-page-hero axis-page-hero--about" aria-label="Privacy policy hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">legal.privacy</span>
          <h1>Privacy policy</h1>
          <p>How {brandName} handles your data — plain English, no jargon.</p>
        </div>
      </section>

      <section className={`axis-section ${styles.body}`}>
        <article className={styles.article}>
          <h2>Who we are</h2>
          <p>
            {brandName} is an independent UK used-car dealer. When you contact
            us, apply for finance, or book a test drive, we collect and process
            personal data — this page explains what, why, and how.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>Identification — your name, contact details, and address.</li>
            <li>Vehicle interest — the cars you&apos;ve enquired about.</li>
            <li>Finance information — if you apply for finance via our panel.</li>
            <li>Communication — calls, messages, and email exchanges.</li>
          </ul>

          <h2>How we use it</h2>
          <p>
            To respond to enquiries, present finance quotes, deliver the car,
            handle warranty queries, and comply with anti-money-laundering, FCA
            regulations, and motor trader licensing.
          </p>

          <h2>Sharing</h2>
          <p>
            We share data with FCA-authorised finance lenders when you apply
            for finance, with delivery partners when you opt in for delivery,
            and with HMRC / DVSA / police where legally required. We do not
            sell data to third parties.
          </p>

          <h2>Your rights</h2>
          <p>
            Under UK GDPR you can access, correct, or delete your data,
            restrict processing, object to processing, and lodge a complaint
            with the ICO. Contact us to exercise any of these rights.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy queries, contact the showroom via our{' '}
            <a href="/contact">contact page</a>.
          </p>
        </article>
      </section>
    </main>
  )
}

export default AxisPrivacyPolicyPage
