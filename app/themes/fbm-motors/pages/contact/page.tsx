import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { resolveText } from '../../lib/brand-text'
import { getBrandContactInfo } from '../../lib/contact'
import { contactImage as defaultContact } from '../../lib/cars'
import ContactFormClient from './ContactFormClient'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function FbmContactPage({ brand }: ThemePageProps) {
  const contact = getBrandContactInfo(brand)

  const heroBg = brand.images?.hero || brand.heroImage || defaultContact
  const heroEyebrow = resolveText(brand, 'contactHeroEyebrow')
  const heroTitle = resolveText(brand, 'contactHeroTitle')
  const heroLead = resolveText(brand, 'contactHeroLead')

  const formEyebrow = resolveText(brand, 'contactFormEyebrow')
  const formTitle = resolveText(brand, 'contactFormTitle')
  const formLead = resolveText(brand, 'contactFormLead')

  const hoursTitle = resolveText(brand, 'contactHoursTitle')
  const openingHours = resolveText(brand, 'footerOpeningHours')

  const mapTitle = resolveText(brand, 'contactMapTitle')
  const mapLead = resolveText(brand, 'contactMapLead')

  const address = (brand.location?.address || {}) as Record<string, string | undefined>
  const fullAddress = (brand.location as any)?.fullAddress ||
    [address.line1, address.line2, address.city, address.county, address.postcode].filter(Boolean).join(', ')

  const addressLine1 = address.line1 || (typeof fullAddress === 'string' ? fullAddress.split(',')[0] : '') || 'Showroom'
  const addressRest = fullAddress && address.line1
    ? [address.line2, address.city, address.county, address.postcode].filter(Boolean).join(', ')
    : (typeof fullAddress === 'string' ? fullAddress.split(',').slice(1).join(', ').trim() : '')

  const mapsQuery = fullAddress ? encodeURIComponent(fullAddress) : ''
  const brandMapEmbed =
    (brand as any)?.mapEmbed ||
    (brand?.location as any)?.mapEmbed ||
    (brand as any)?.googleMapsEmbed ||
    ''
  const mapEmbedSrc =
    typeof brandMapEmbed === 'string' && brandMapEmbed.trim()
      ? brandMapEmbed.trim()
      : mapsQuery
        ? `https://www.google.com/maps?q=${mapsQuery}&output=embed`
        : ''

  // Parse opening hours string into rows if it contains separators like "·" or "•" or " | ".
  // Fall back to the raw string as a single line.
  const hoursRows = openingHours
    ? openingHours.split(/\s*[·•|]\s*/).filter(Boolean)
    : []

  return (
    <main>
      {/* ─── Hero ─── */}
      <section className={styles.hero} aria-label="Contact hero">
        {heroBg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroBg} alt="" className={styles.heroImage} />
        )}
        <div className={styles.heroWash} aria-hidden />
        <div className={styles.heroTint} aria-hidden />
        <div className={styles.heroInner}>
          {heroEyebrow && (
            <span className={`fbm-eyebrow ${styles.heroEyebrow} fbm-animate-rise`}>{heroEyebrow}</span>
          )}
          <h1 className={`${styles.heroTitle} fbm-animate-rise`} style={{ animationDelay: '100ms' }}>{heroTitle}</h1>
          {heroLead && (
            <p className={`${styles.heroLead} fbm-animate-rise`} style={{ animationDelay: '180ms' }}>{heroLead}</p>
          )}
        </div>
      </section>

      {/* ─── Contact split — info cards + form ─── */}
      <section className={styles.split} aria-label="Contact options">
        <div className={styles.splitInner}>
          <div className={styles.detailsCol}>
            {contact.phoneDisplay && (
              <article className={styles.detailCard}>
                <span className={styles.detailIcon} aria-hidden>
                  <Phone size={20} strokeWidth={1.7} />
                </span>
                <div className={styles.detailBody}>
                  <p className={styles.detailLabel}>Call us</p>
                  <a
                    href={`tel:${contact.phoneTel || contact.phoneDisplay}`}
                    className={`${styles.detailValue} ${styles.detailValueLink}`}
                  >
                    {contact.phoneDisplay}
                  </a>
                  <p className={styles.detailSub}>Speak to the sales team direct</p>
                </div>
              </article>
            )}
            {contact.email && (
              <article className={styles.detailCard}>
                <span className={styles.detailIcon} aria-hidden>
                  <Mail size={20} strokeWidth={1.7} />
                </span>
                <div className={styles.detailBody}>
                  <p className={styles.detailLabel}>Email us</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className={`${styles.detailValue} ${styles.detailValueLink}`}
                  >
                    {contact.email}
                  </a>
                  <p className={styles.detailSub}>We reply within one working day</p>
                </div>
              </article>
            )}
            {(fullAddress || addressLine1) && (
              <article className={styles.detailCard}>
                <span className={styles.detailIcon} aria-hidden>
                  <MapPin size={20} strokeWidth={1.7} />
                </span>
                <div className={styles.detailBody}>
                  <p className={styles.detailLabel}>Visit us</p>
                  <p className={styles.detailValue}>{addressLine1}</p>
                  {addressRest && <p className={styles.detailSub}>{addressRest}</p>}
                </div>
              </article>
            )}

            {hoursRows.length > 0 && (
              <article className={styles.hoursCard}>
                <div className={styles.hoursHeader}>
                  <span className={styles.detailIcon} aria-hidden>
                    <Clock size={20} strokeWidth={1.7} />
                  </span>
                  <p className={styles.hoursTitle}>{hoursTitle}</p>
                </div>
                <ul className={styles.hoursList}>
                  {hoursRows.map((row) => (
                    <li key={row} className={styles.hoursRow}>{row}</li>
                  ))}
                </ul>
              </article>
            )}
          </div>

          <div className={styles.formCol}>
            <div className={styles.formHeading}>
              {formEyebrow && <p className={`fbm-eyebrow ${styles.formEyebrow}`}>{formEyebrow}</p>}
              <h2 className={styles.formTitle}>{formTitle}</h2>
              {formLead && <p className={styles.formLead}>{formLead}</p>}
            </div>
            <ContactFormClient />
          </div>
        </div>
      </section>

      {/* ─── Map band ─── */}
      <section className={styles.mapBand} aria-label="Find us">
        <div className={styles.mapInner}>
          <div className={styles.mapHeading}>
            <h2 className={styles.mapTitle}>{mapTitle}</h2>
            {mapLead && <p className={styles.mapLead}>{mapLead}</p>}
          </div>
          <div className={styles.mapFrameWrap}>
            {mapEmbedSrc ? (
              <iframe
                src={mapEmbedSrc}
                title={`${brand?.name || 'Showroom'} location map`}
                className={styles.mapFrame}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className={styles.mapPlaceholder}>
                <span className={styles.mapPinIcon} aria-hidden>
                  <MapPin size={22} strokeWidth={1.8} />
                </span>
                <p className={styles.mapPlaceholderHint}>Add a showroom address to display the map.</p>
              </div>
            )}
            {mapsQuery && mapEmbedSrc && (
              <a
                href={`https://maps.google.com/?q=${mapsQuery}`}
                target="_blank"
                rel="noreferrer"
                className={`fbm-btn-primary ${styles.mapDirections}`}
              >
                Get directions →
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default FbmContactPage
