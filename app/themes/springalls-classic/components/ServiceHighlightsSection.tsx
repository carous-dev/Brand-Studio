'use client'

import Link from 'next/link'
import { BadgeCheck, ClipboardCheck, Handshake, MapPin, Play } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './ServiceHighlightsSection.module.css'

const FEATURES = [
  {
    title: 'Privately Bought Stock',
    description:
      'We meet the owners, check the vehicle, test drive, and review documents before we purchase.',
    icon: Handshake
  },
  {
    title: 'Checked & Tested',
    description:
      'Every car is inspected and tested so we can sell with confidence and total transparency.',
    icon: ClipboardCheck
  },
  {
    title: 'No Hidden Costs',
    description:
      'We deliver what we promise at the time of sale — no hidden costs or small print.',
    icon: BadgeCheck
  }
]

export default function ServiceHighlightsSection() {
  const brand = useBrand()
  const brandName = brand?.name || 'Springalls Car Sales Ltd'
  const shortName = brandName.replace(/\s*(Ltd|Limited|Car Sales)\.?$/i, '').trim() || brandName
  const city = brand?.location?.address?.city || 'Reading'
  const county = brand?.location?.address?.county || 'Berkshire'
  const postcode = brand?.location?.address?.postcode || 'RG2 6UB'

  return (
    <section className={styles.section} aria-labelledby="service-highlights-title" data-aos="fade-up">
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.topBarInner}>
            <h3 className={styles.topBarTitle}>{shortName} Service Promise</h3>
            <Link className={styles.topBarContact} href="/contact-us">
              <span className={styles.topBarIcon} aria-hidden="true">
                <MapPin size={22} strokeWidth={1.8} />
              </span>
              <div>
                <div className={styles.topBarLabel}>Visit Our Showroom</div>
                <div className={styles.topBarPhone}>
                  {city}{county ? `, ${county}` : ''}{postcode ? ` · ${postcode}` : ''}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardInner}>
          <div className={styles.content}>
            <p className={styles.contentEyebrow}>Service Promise</p>
            <h2 id="service-highlights-title" className={styles.contentTitle}>
              Why Choose {brandName}
            </h2>
            <p className={styles.contentLead}>
              At {brandName}, all our cars are privately bought, carefully checked, and prepared to a high standard
              before they reach the forecourt.
            </p>
            <div className={styles.divider} aria-hidden="true" />
            <ul className={styles.featureList}>
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <li key={feature.title} className={styles.feature}>
                    <span className={styles.featureIcon} aria-hidden="true">
                      <Icon size={22} strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className={styles.featureTitle}>{feature.title}</h3>
                      <p className={styles.featureText}>{feature.description}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className={styles.media} role="img" aria-label="Luxury service bay with a premium vehicle">
            <Link href="/services" className={styles.playButton} aria-label={`View ${shortName} services`}>
              <Play size={28} strokeWidth={2.2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
