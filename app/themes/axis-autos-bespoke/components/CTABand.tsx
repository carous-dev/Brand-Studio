'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './CTABand.module.css'

export default function CTABand() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Axis Autos'
  const address = (brand as any)?.location?.address || {}
  const city = address.city || 'the showroom'

  return (
    <section className={`axis-section axis-section--brand ${styles.cta}`} aria-label="Get in touch" data-aos="fade-up">
      <div className="axis-shell">
        <div className={styles.inner}>
          <div className={styles.text}>
            <span className={styles.eyebrow}>Visit us</span>
            <h2 className={styles.title}>
              Drop by {city} — or talk to us first.
            </h2>
            <p className={styles.lead}>
              Most of our cars sell within a fortnight. Reserve online or get in touch and we'll hold one for you.
            </p>
          </div>
          <div className={styles.actions}>
            <Link href="/used-cars" className={`axis-btn axis-btn--on-brand ${styles.primary}`}>
              Browse stock
              <ArrowRight size={18} strokeWidth={1.8} />
            </Link>
            {contact.phoneTel ? (
              <a href={`tel:${contact.phoneTel}`} className={`axis-btn axis-btn--ghost-on-brand ${styles.secondary}`}>
                <Phone size={16} strokeWidth={1.8} />
                {contact.phoneDisplay}
              </a>
            ) : (
              <Link href="/contact" className={`axis-btn axis-btn--ghost-on-brand ${styles.secondary}`}>
                Get in touch
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
