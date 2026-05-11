import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import { getBrandContactInfo } from '../../lib/contact'
import styles from './page.module.css'

export function ChesterfieldPrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Chesterfield Motor Empire'
  const contact = getBrandContactInfo(brand)
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        lead="How we handle your personal data and what your rights are."
        variant="compact"
      />
      <article className={styles.article}>
        <p className={styles.intro}>
          {brandName} (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to protecting your personal data.
          This policy explains how we collect, use, store, and protect information you give us when you use our website
          or contact our showroom.
        </p>

        <h2 className={styles.h2}>1. Who we are</h2>
        <p>
          {brandName} is a family-run used-car dealership based in Shuttlewood, Chesterfield. We are the data controller for
          information collected via this website and our other sales channels.
        </p>

        <h2 className={styles.h2}>2. Information we collect</h2>
        <ul className={styles.list}>
          <li>Contact details (name, email, phone) when you submit an enquiry, valuation request, or finance application.</li>
          <li>Vehicle details (registration, mileage, condition) when you ask us to value a car.</li>
          <li>Browsing data (pages visited, device, referrer) collected through cookies for analytics — only with your consent.</li>
        </ul>

        <h2 className={styles.h2}>3. How we use it</h2>
        <ul className={styles.list}>
          <li>Responding to your enquiry and following up about vehicles or services you&rsquo;ve asked about.</li>
          <li>Processing finance applications via our FCA-regulated lender panel (only with your consent).</li>
          <li>Improving our website and the cars we source for our customers.</li>
        </ul>

        <h2 className={styles.h2}>4. Lawful basis</h2>
        <p>
          We rely on legitimate interest (responding to enquiries), contract (where we&rsquo;re processing a sale), and
          consent (for marketing emails and optional cookies). You can withdraw consent at any time.
        </p>

        <h2 className={styles.h2}>5. Sharing your data</h2>
        <p>
          We don&rsquo;t sell your data. We share it only with finance lenders you&rsquo;ve asked us to apply to, vehicle
          delivery providers if you&rsquo;ve booked transport, and authorities where legally required.
        </p>

        <h2 className={styles.h2}>6. How long we keep it</h2>
        <p>
          We keep enquiry data for 24 months and customer transaction records for 7 years (UK accounting requirement).
          You can request earlier deletion by emailing us.
        </p>

        <h2 className={styles.h2}>7. Your rights</h2>
        <ul className={styles.list}>
          <li>Access — request a copy of the data we hold about you.</li>
          <li>Rectification — correct inaccurate data.</li>
          <li>Erasure — request deletion (subject to legal retention).</li>
          <li>Objection — object to processing for marketing.</li>
          <li>Complaint — lodge a complaint with the UK Information Commissioner&rsquo;s Office (ico.org.uk).</li>
        </ul>

        <h2 className={styles.h2}>8. Contact us</h2>
        <p>
          For any privacy questions email{' '}
          {contact.email ? <a className={styles.inlineLink} href={`mailto:${contact.email}`}>{contact.email}</a> : 'the showroom'}{' '}
          {contact.phoneTel ? <>or call <a className={styles.inlineLink} href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a></> : null}.
          You can also visit us at our showroom — see <Link href="/contact" className={styles.inlineLink}>Contact us</Link> for the address.
        </p>

        <p className={styles.updated}>Last updated: 11 May 2026</p>
      </article>
    </>
  )
}

export default ChesterfieldPrivacyPolicyPage
