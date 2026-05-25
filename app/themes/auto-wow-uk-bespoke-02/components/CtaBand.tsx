'use client'

import Link from 'next/link'
import { Phone, ArrowRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './CtaBand.module.css'

export default function CtaBand() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Autowow'

  return (
    <section className={`auto-section ${styles.band}`} aria-label="Get in touch">
      <div className={styles.imageLayer} aria-hidden="true" />
      <div className={styles.gridOverlay} aria-hidden="true" />
      <div className={`${styles.glow} mfx-glow-pulse auto-decor-mobile-hide`} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy} data-aos="fade-up">
          <span className={styles.eyebrow}>[ Ready to drive? ]</span>
          <h2 className={styles.title}>
            <span>Pick the car.</span>
            <span className={`${styles.titleAccent} mfx-text-glow`}>We&apos;ll do the rest.</span>
          </h2>
          <p className={styles.lead}>
            Walk in, call up, or message {brandName} from anywhere in the UK. We&apos;ll
            handle finance, part-exchange, prep, and delivery.
          </p>
        </div>

        <div className={styles.actions} data-aos="fade-left">
          <Link href="/used-cars" className={`auto-btn auto-btn--primary mfx-shimmer ${styles.primary}`}>
            Browse stock
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
          {contact.phoneTel ? (
            <a href={`tel:${contact.phoneTel}`} className={`auto-btn auto-btn--ghost-light ${styles.ghost}`}>
              <Phone size={16} strokeWidth={2} />
              {contact.phoneDisplay || 'Call the showroom'}
            </a>
          ) : (
            <Link href="/contact" className={`auto-btn auto-btn--ghost-light ${styles.ghost}`}>
              <Phone size={16} strokeWidth={2} />
              Get in touch
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
