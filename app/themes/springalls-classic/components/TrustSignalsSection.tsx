'use client'

import { BadgeCheck, CheckCircle2, Handshake, Truck } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './TrustSignalsSection.module.css'

const SIGNALS = [
  {
    title: 'Privately Bought Stock',
    description: 'Every vehicle is sourced directly and vetted before purchase.',
    icon: Handshake
  },
  {
    title: 'Checked & Tested',
    description: 'We inspect and test-drive each car for total confidence.',
    icon: BadgeCheck
  },
  {
    title: 'Nationwide Delivery',
    description: 'Flexible delivery options across the UK.',
    icon: Truck
  },
  {
    title: 'No Hidden Costs',
    description: 'Clear pricing with no small print or surprises.',
    icon: CheckCircle2
  }
]

export default function TrustSignalsSection() {
  const brand = useBrand()
  const name = brand?.name || 'Springalls Car Sales Ltd'
  const city = brand?.location?.address?.city || 'Reading'
  const county = brand?.location?.address?.county || 'Berkshire'

  return (
    <section className={styles.section} aria-labelledby="trust-signals-title" data-aos="fade-up">
      <div className={styles.inner}>
        <p id="trust-signals-title" className={styles.lead}>
          All our stock is privately bought, checked, and tested so you can buy with confidence from {name} in {city}
          {county ? `, ${county}` : ''}.
        </p>
        <div className={styles.grid}>
          {SIGNALS.map((signal) => {
            const Icon = signal.icon
            return (
              <article key={signal.title} className={styles.card}>
                <div className={styles.iconWrap} aria-hidden="true">
                  <Icon size={30} strokeWidth={1.8} />
                </div>
                <h3 className={styles.cardTitle}>{signal.title}</h3>
                <p className={styles.cardText}>{signal.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
