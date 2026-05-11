'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './CtaBanner.module.css'

export default function CtaBanner() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)

  return (
    <section className={styles.section} aria-labelledby="cta-title">
      <div className={styles.bgImage} aria-hidden="true" data-mfx-scroll="parallax-medium" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={`${styles.glowOrb} mfx-glow-orbit`} aria-hidden="true" />
      <div className={`${styles.glowOrbSmall} mfx-glow-pulse`} aria-hidden="true" />

      <div className={styles.inner}>
        <p className={styles.eyebrow} data-aos="fade-up">Need a van today?</p>
        <h2 id="cta-title" className={styles.title} data-aos="fade-up" data-aos-delay="80">
          Talk to the team. <span className={styles.titleAccent}>We'll find the right one.</span>
        </h2>
        <p className={styles.lead} data-aos="fade-up" data-aos-delay="160">
          Tell us what you do and we'll match you to a van that earns its keep — finance and delivery sorted.
        </p>
        <div className={styles.ctaRow} data-aos="fade-up" data-aos-delay="240">
          <Link href="/used-cars" className={`${styles.ctaPrimary} mfx-shimmer`}>
            Browse the fleet
            <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </Link>
          {contact.phoneDisplay ? (
            <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={styles.ctaSecondary}>
              <Phone size={18} strokeWidth={2.2} aria-hidden="true" />
              {contact.phoneDisplay}
            </a>
          ) : (
            <Link href="/contact" className={styles.ctaSecondary}>
              Get in touch
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
