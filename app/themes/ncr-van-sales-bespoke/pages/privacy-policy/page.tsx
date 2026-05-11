import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

export function NcrPrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'NCR Van Sales Ltd'
  const updated = '2026-01-01'

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy."
        lead={`How ${brandName} collects, uses and protects your personal information.`}
        imageSlot="hero"
      />

      <article className={styles.article}>
        <p className={styles.updated} data-aos="fade-up">Last updated: {updated}</p>

        <section data-aos="fade-up">
          <h2>1. Who we are</h2>
          <p>
            {brandName} is a UK-registered company selling commercial vehicles to trade and retail buyers.
            For the purposes of UK GDPR we are the data controller for personal information we collect through this website, by phone, by email or at our forecourt.
          </p>
        </section>

        <section data-aos="fade-up">
          <h2>2. What we collect</h2>
          <ul>
            <li><strong>Identity and contact data</strong> — name, email, phone, postal address.</li>
            <li><strong>Vehicle data</strong> — registration, mileage, condition and finance status when you submit a part-exchange or valuation request.</li>
            <li><strong>Finance data</strong> — only what's needed for soft-search eligibility checks when you apply for finance through us.</li>
            <li><strong>Usage data</strong> — anonymous analytics about how you use our website (only if you've consented to analytics cookies).</li>
          </ul>
        </section>

        <section data-aos="fade-up">
          <h2>3. Why we collect it</h2>
          <ul>
            <li>To respond to your enquiry and arrange a viewing, valuation or delivery.</li>
            <li>To process finance applications with our regulated partner lenders.</li>
            <li>To improve our website and the service we offer (where you've consented to analytics).</li>
            <li>To meet legal obligations (HMRC, FCA, anti-money-laundering checks).</li>
          </ul>
        </section>

        <section data-aos="fade-up">
          <h2>4. Who we share it with</h2>
          <p>
            We don't sell your data. We share it only with: (a) the partner finance houses we use to source competitive finance for you, (b) regulated transport providers if you've asked us to arrange delivery, (c) HMRC and law enforcement where legally required.
          </p>
        </section>

        <section data-aos="fade-up">
          <h2>5. How long we keep it</h2>
          <p>
            We keep enquiry data for 12 months from your last interaction. Sales records are retained for 6 years to meet HMRC requirements. Finance application data is retained for the duration required by the relevant lender (typically 6 years).
          </p>
        </section>

        <section data-aos="fade-up">
          <h2>6. Your rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request a copy of the personal data we hold about you.</li>
            <li>Ask us to correct anything that's wrong.</li>
            <li>Ask us to delete data we no longer need to hold.</li>
            <li>Withdraw consent to marketing or analytics at any time.</li>
            <li>Lodge a complaint with the Information Commissioner's Office (ico.org.uk).</li>
          </ul>
          <p>Contact us through the <a href="/contact">contact page</a> to exercise any of these rights.</p>
        </section>

        <section data-aos="fade-up">
          <h2>7. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be flagged on the site for 30 days. Continued use of the site after the update counts as acceptance of the revised policy.
          </p>
        </section>
      </article>
    </>
  )
}

export default NcrPrivacyPolicyPage
