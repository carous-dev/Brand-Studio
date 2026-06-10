import { resolveText } from '../../lib/brand-text'
import { getBrandContactInfo } from '../../lib/contact'
import { PageHero } from '../../components/PageHero'
import { contactImage as defaultContact } from '../../lib/cars'
import ContactFormClient from './ContactFormClient'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function FbmContactPage({ brand }: ThemePageProps) {
  const contact = getBrandContactInfo(brand)

  const heroBg = brand.images?.hero || brand.heroImage || defaultContact
  const heroTitle = resolveText(brand, 'contactHeroTitle')
  const heroLead = resolveText(brand, 'contactHeroLead')

  const openingHours = resolveText(brand, 'footerOpeningHours')
  const address = (brand.location?.address || {}) as Record<string, string | undefined>
  const fullAddress = (brand.location as any)?.fullAddress

  return (
    <>
      <PageHero image={heroBg} title={heroTitle} lead={heroLead} />

      <section className={styles.wrap}>
        <div className={styles.detailsCol}>
          {contact.phoneDisplay && (
            <div className={styles.detailCard}>
              <p className={styles.detailLabel}>Call us</p>
              <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={`${styles.detailValue} ${styles.detailValueLink}`}>
                {contact.phoneDisplay}
              </a>
              {openingHours && <p className={styles.detailSub}>{openingHours}</p>}
            </div>
          )}
          {contact.email && (
            <div className={styles.detailCard}>
              <p className={styles.detailLabel}>Email us</p>
              <a href={`mailto:${contact.email}`} className={`${styles.detailValue} ${styles.detailValueLink}`}>
                {contact.email}
              </a>
              <p className={styles.detailSub}>We reply within one working day</p>
            </div>
          )}
          {(fullAddress || address.line1 || address.city) && (
            <div className={styles.detailCard}>
              <p className={styles.detailLabel}>Visit us</p>
              <p className={styles.detailValue}>{address.line1 || fullAddress?.split(',')[0] || 'Showroom'}</p>
              <p className={styles.detailSub}>
                {fullAddress ||
                  [address.line2, address.city, address.county, address.postcode].filter(Boolean).join(', ')}
              </p>
            </div>
          )}
          <div className={styles.calloutCard}>
            <p className={styles.calloutTitle}>Looking for your next car?</p>
            <p className={styles.calloutBody}>Chat with us in seconds — we&apos;re online during opening hours.</p>
          </div>
        </div>

        <ContactFormClient />
      </section>
    </>
  )
}

export default FbmContactPage
