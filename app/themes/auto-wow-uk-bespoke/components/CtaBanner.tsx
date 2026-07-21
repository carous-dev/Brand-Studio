'use client'

import Link from 'next/link'
import { Phone, Car } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
import styles from './CtaBanner.module.css'

export default function CtaBanner() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)

  return (
    <section className={styles.banner} aria-labelledby="cta-title" data-aos="fade-up">
      <div className={styles.media} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={`mfx-glow-pulse ${styles.glow}`} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Looking for a used car?</p>
          <h2 id="cta-title" className={styles.title}>
            Browse the forecourt or talk to a real person.
          </h2>
          <p className={styles.lead}>
            Tell us what you&rsquo;re after &mdash; finance, family, work-day. We&rsquo;ll line up
            options and set up a viewing whenever suits you. Same-day callbacks are normal.
          </p>
        </div>

        <div className={styles.actions}>
          <Link href="/used-cars" className={`auto-btn auto-btn--primary mfx-shimmer ${styles.cta}`}>
            <Car size={16} aria-hidden="true" />
            Browse stock
          </Link>
          {contact.phoneTel && (
            <a href={`tel:${contact.phoneTel}`} className={`auto-btn auto-btn--ghost ${styles.cta}`}>
              <Phone size={16} aria-hidden="true" />
              {contact.phoneDisplay}
            </a>
          )}
          {contact.whatsappUrl && (
            <a
              href={contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`auto-btn auto-btn--ghost ${styles.cta}`}
            >
              <WhatsAppIcon size={16} />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
