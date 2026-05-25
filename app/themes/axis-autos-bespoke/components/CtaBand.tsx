'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './CtaBand.module.css'

export default function CtaBand() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Axis Autos'

  return (
    <section className={`axis-section ${styles.band}`} aria-label="Get in touch">
      <div className={styles.inner}>
        <div className={styles.copy} data-aos="fade-up">
          <span className={styles.eyebrow}>{'> '}ready.to-drive</span>
          <h2 className={styles.title}>
            Pick the car. <span className={styles.titleAccent}>{brandName} handles the rest.</span>
          </h2>
          <p className={styles.lead}>
            Walk in, call up, or message us from anywhere in the UK. Finance,
            part-exchange, prep and delivery — same team, same week.
          </p>
        </div>

        <div className={styles.actions} data-aos="fade-left">
          <Link href="/used-cars" className={`axis-btn axis-btn--primary ${styles.primary}`}>
            Browse stock
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
          {contact.phoneTel ? (
            <a href={`tel:${contact.phoneTel}`} className={`axis-btn axis-btn--ghost-dark ${styles.ghost}`}>
              <Phone size={16} strokeWidth={2} />
              {contact.phoneDisplay || 'Call the showroom'}
            </a>
          ) : (
            <Link href="/contact" className={`axis-btn axis-btn--ghost-dark ${styles.ghost}`}>
              <Phone size={16} strokeWidth={2} />
              Get in touch
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
