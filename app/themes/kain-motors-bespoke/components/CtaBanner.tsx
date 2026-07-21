'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
import styles from './CtaBanner.module.css'

export default function CtaBanner() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)

  return (
    <section className={styles.section} aria-label="Get in touch" data-aos="fade-up">
      <div className={styles.media} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.column} data-aos="fade-up">
          <p className={styles.eyebrow}>Concierge · Appointment-only</p>
          <h2 className={styles.title}>Ready to view? <em>We’ll have the car prepped for your arrival.</em></h2>
          <p className={styles.lead}>
            Book your viewing slot and we’ll have the car ready — fueled, valeted, documents to hand.
            Most buyers reach a decision the same day.
          </p>
          <div className={styles.actionRow}>
            <Link href="/contact" className={`kain-btn kain-btn--gold mfx-shimmer`}>Book a viewing</Link>
            {contact.phoneTel && (
              <a href={`tel:${contact.phoneTel}`} className="kain-btn kain-btn--ghost-dark">
                Call {contact.phoneDisplay || contact.phoneTel}
              </a>
            )}
            {contact.whatsappUrl && (
              <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsappLink}>
                <WhatsAppIcon size={18} />
                <span>WhatsApp the showroom</span>
              </a>
            )}
          </div>
        </div>

        <aside className={styles.sidecard} data-aos="fade-left" data-aos-delay="120">
          <p className={styles.sideEyebrow}>Showroom hours</p>
          <dl className={styles.hours}>
            <div><dt>Mon — Fri</dt><dd>09:30 – 17:30</dd></div>
            <div><dt>Saturday</dt><dd>09:30 – 17:30</dd></div>
            <div><dt>Sunday</dt><dd className={styles.closed}>Closed</dd></div>
          </dl>
          <p className={styles.sideNote}>
            Out-of-hours? Drop a WhatsApp and we’ll confirm the next available slot.
          </p>
        </aside>
      </div>
    </section>
  )
}
