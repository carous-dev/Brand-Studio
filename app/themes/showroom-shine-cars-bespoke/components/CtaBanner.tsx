'use client'

import Link from 'next/link'
import { ArrowUpRight, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './CtaBanner.module.css'

export default function CtaBanner() {
  const brand = useBrand()
  const city = (brand as any)?.location?.address?.city || (brand as any)?.location?.city || ''
  const phoneDisplay = String((brand as any)?.location?.phone || '').trim()
  const phoneTel = phoneDisplay.replace(/[^\d+]/g, '')

  return (
    <section className={`shr-section ${styles.section}`} data-aos="fade-up">
      <div className={styles.bgImage} aria-hidden />
      <div className={styles.overlay} aria-hidden />
      <div className={`mfx-glow-pulse ${styles.glow}`} aria-hidden />

      <div className="shr-container">
        <div className={styles.layout}>
          <div className={styles.left} data-aos="fade-right">
            <span className="shr-eyebrow">Looking for a used car?</span>
            <h2 className={styles.title}>
              Browse our latest stock{city ? ` in ${city}` : ''}.
            </h2>
            <p className={styles.lead}>
              Enquire on any vehicle that fits your needs, or speak to the team about
              sourcing the right car for you.
            </p>
            <div className={styles.actions}>
              <Link href="/used-cars" className={`shr-btn-primary mfx-shimmer ${styles.primary}`}>
                Browse stock
                <ArrowUpRight size={18} strokeWidth={2.4} />
              </Link>
              {phoneDisplay ? (
                <a href={`tel:${phoneTel}`} className={`shr-btn-ghost-dark ${styles.secondary}`}>
                  <Phone size={16} strokeWidth={2.4} aria-hidden />
                  {phoneDisplay}
                </a>
              ) : null}
            </div>
          </div>

          <div className={styles.right} data-aos="fade-left">
            <div className={styles.valuationCard}>
              <span className="shr-eyebrow">Want to sell your car?</span>
              <h3 className={styles.valuationTitle}>Free dealer valuation.</h3>
              <p className={styles.valuationLead}>
                Request a fair price and the team will be in touch with simple,
                straightforward next steps.
              </p>
              <Link href="/sell-my-car" className={styles.valuationCta}>
                Start valuation
                <ArrowUpRight size={16} strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
