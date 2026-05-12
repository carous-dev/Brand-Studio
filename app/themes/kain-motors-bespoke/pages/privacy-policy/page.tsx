import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import { getBrandContactInfo } from '../../lib/contact'
import styles from './page.module.css'

export function KainPrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'The showroom'
  const contact = getBrandContactInfo(brand)
  const registeredAddress = contact.showroomAddress || '(address available on request)'
  return (
    <>
      <PageHero
        variant="about"
        eyebrow="Legal"
        title="Privacy policy"
        lead="How we collect, store and use the personal information you share with the showroom."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy' }]}
      />

      <section className={`kain-section ${styles.section}`}>
        <article className={`${styles.article} kain-prose`}>
          <p className={styles.lastUpdated}>Last updated: April 2026</p>

          <h2>1. Who we are</h2>
          <p>
            {brandName} is the data controller for the personal information we hold about you. Our registered
            address is {registeredAddress}. You can reach the team via{' '}
            {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : 'our contact page'}
            {contact.phoneTel ? <> or on <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay || contact.phoneTel}</a></> : null}.
          </p>

          <h2>2. What information we collect</h2>
          <ul>
            <li>Identity data — name, address, phone number, email address.</li>
            <li>Vehicle-related data — registration, mileage, condition you provide for valuations or finance applications.</li>
            <li>Financial data — limited information required by lenders for finance applications (we don’t store full bank details).</li>
            <li>Technical data — IP address, browser, device and usage statistics (cookies; see our <Link href="/cookie-policy">cookie policy</Link>).</li>
          </ul>

          <h2>3. How we use it</h2>
          <p>
            We use your information to respond to enquiries, prepare valuations, process finance applications via
            FCA-regulated brokers, deliver after-sales support, and meet our legal obligations (e.g. anti-money-laundering
            checks where applicable).
          </p>

          <h2>4. Who we share it with</h2>
          <p>
            Finance applications are shared with FCA-regulated lenders you have consented to apply to. Trade-in
            settlements involve sharing limited details with the existing finance house. We do not sell your data.
          </p>

          <h2>5. How long we keep it</h2>
          <p>
            Sales records: 7 years (HMRC requirement). Enquiry data: 24 months unless you ask us to remove it sooner.
            Finance application data: as required by the lender and relevant regulators.
          </p>

          <h2>6. Your rights</h2>
          <p>
            Under UK GDPR you have the right to access, correct, erase, restrict, port and object to our processing
            of your data. You can also withdraw consent at any time. To exercise these rights, contact us using the
            details above.
          </p>

          <h2>7. Complaints</h2>
          <p>
            If you’re unhappy with how we’ve handled your information, please contact us first and we’ll do our best
            to put it right. You can also complain to the Information Commissioner’s Office (
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>).
          </p>
        </article>
      </section>
    </>
  )
}

export default KainPrivacyPolicyPage
