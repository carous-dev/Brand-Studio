'use client'

import Link from 'next/link'
import { Phone, ArrowRight, BadgePoundSterling, Repeat2, Truck } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './CtaBand.module.css'

const TRUST_CHIPS: Array<{ Icon: typeof BadgePoundSterling; label: string }> = [
  { Icon: BadgePoundSterling, label: 'Finance available' },
  { Icon: Repeat2, label: 'Part-exchange welcome' },
  { Icon: Truck, label: 'UK-wide delivery' },
]

export default function CtaBand() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Autowow'

  return (
    <section className={`auto-section ${styles.band}`} aria-label="Get in touch" data-aos="fade-up">
      <div className={styles.imageLayer} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />
      <div className={`${styles.glow} mfx-glow-pulse auto-decor-mobile-hide`} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.panel}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>Ready when you are</span>
            <h2 className={styles.title}>
              Pick the car.<br />
              <span className={styles.titleAccent}>We&rsquo;ll do the rest.</span>
            </h2>
            <p className={styles.lead}>
              Walk in, call up, or message {brandName} from anywhere in the UK — finance,
              part-exchange, prep and delivery handled end-to-end.
            </p>

            <ul className={styles.chips} role="list">
              {TRUST_CHIPS.map(({ Icon, label }) => (
                <li key={label} className={styles.chip}>
                  <Icon size={14} strokeWidth={2} />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.actions}>
            <Link href="/used-cars" className={styles.primaryBtn}>
              Browse stock
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
            {contact.phoneTel ? (
              <a href={`tel:${contact.phoneTel}`} className={styles.ghostBtn}>
                <Phone size={16} strokeWidth={2} />
                {contact.phoneDisplay || 'Call the showroom'}
              </a>
            ) : (
              <Link href="/contact" className={styles.ghostBtn}>
                <Phone size={16} strokeWidth={2} />
                Get in touch
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
