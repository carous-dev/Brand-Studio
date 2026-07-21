import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function AxisPrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Axis Autos'
  const email = (brand as any)?.location?.email || ''

  return (
    <>
      <section className="axis-page-hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">Legal</span>
          <h1 className="axis-page-hero-title">Privacy policy.</h1>
          <p className="axis-page-hero-lead">
            How {brandName} collects, uses, and protects your personal data — in plain English.
          </p>
        </div>
      </section>

      <section className="axis-section">
        <div className="axis-shell">
          <article className={styles.prose}>
            <h2>1. Who we are</h2>
            <p>
              {brandName} is the data controller for any personal data we collect through this website,
              our showroom, or by phone and email. {email ? <>If you have questions about this policy you can reach us at <a href={`mailto:${email}`}>{email}</a>.</> : 'Contact details are on the Contact page.'}
            </p>

            <h2>2. What we collect</h2>
            <ul>
              <li>Contact details you provide (name, email, phone, address)</li>
              <li>Vehicle details where you submit a valuation or part-exchange enquiry</li>
              <li>Finance application information (only when you apply through us)</li>
              <li>Analytics and cookie data — see our cookie policy</li>
            </ul>

            <h2>3. How we use your data</h2>
            <p>
              We use the information you give us to respond to your enquiry, provide a quote, and complete a sale.
              We do not sell your data. Finance applications are shared only with the lenders you choose to apply to.
            </p>

            <h2>4. How long we keep it</h2>
            <p>
              Enquiry data is kept for 24 months. Sales records are kept for 6 years to satisfy HMRC requirements.
              Marketing data is kept until you ask us to remove it.
            </p>

            <h2>5. Your rights</h2>
            <p>
              You have the right to access, correct, or delete the personal data we hold about you, and to object
              to processing. Email us and we'll respond within one calendar month.
            </p>

            <h2>6. Complaints</h2>
            <p>
              You can complain to the Information Commissioner's Office (ICO) at any time. We'd rather you talked to us first
              — we'll do our best to put it right.
            </p>

            <p className={styles.updated}>This policy was last updated {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
          </article>
        </div>
      </section>
    </>
  )
}

export default AxisPrivacyPolicyPage
