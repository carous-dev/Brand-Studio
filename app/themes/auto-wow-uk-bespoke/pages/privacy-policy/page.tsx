import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import { getBrandContactInfo } from '../../lib/contact'
import styles from './page.module.css'

export function AutoPrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'AUTOWOW UK'
  const contact = getBrandContactInfo(brand)

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy."
        lead={`How ${brandName} collects, stores and uses your personal data — written plainly, kept compliant.`}
        imageSlot="hero"
      />

      <section className={styles.legal} data-aos="fade-up">
        <article className={styles.legalInner} data-aos="fade-up" data-aos-delay="100">
          <h2>What information we collect</h2>
          <p>
            When you enquire about a vehicle, request a valuation, or apply for
            finance, we collect the personal information you provide — name,
            email, phone number, vehicle details, and (for finance) basic
            employment data.
          </p>

          <h2>How we use it</h2>
          <p>
            We use your information solely to respond to your enquiry, process
            your transaction, and (with your consent) keep you updated about
            stock that matches what you&apos;ve told us you&apos;re after.
          </p>

          <h2>Who we share it with</h2>
          <p>
            We share details with finance lenders only when you&apos;ve applied
            for finance, with insurance providers only when you&apos;ve asked
            for a quote, and with delivery agents when you&apos;ve agreed to
            home delivery. We never sell your information to third parties.
          </p>

          <h2>How long we keep it</h2>
          <p>
            We retain enquiry records for 2 years, transaction records for 7
            years (HMRC requirement), and finance application records for 6
            years (FCA requirement). After those periods, your personal data
            is permanently deleted.
          </p>

          <h2>Your rights</h2>
          <p>
            Under UK GDPR you can request access to, correction of, or deletion
            of your personal data at any time. Email{' '}
            {contact.email ? (
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            ) : (
              'us'
            )}{' '}
            and we&apos;ll respond within one calendar month.
          </p>

          <h2>How to contact us</h2>
          <p>
            {brandName} is the data controller. You can reach us by phone on{' '}
            {contact.phoneDisplay ? (
              <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a>
            ) : (
              'the number on our contact page'
            )}{' '}
            or in writing at our showroom address.
          </p>

          <p className={styles.footer}>Last updated: 2026-05-11.</p>
        </article>
      </section>
    </>
  )
}

export default AutoPrivacyPolicyPage
