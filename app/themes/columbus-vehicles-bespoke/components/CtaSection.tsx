'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './CtaSection.module.css'

/**
 * Columbus Vehicles — Mid-page CTA (rugged archetype)
 * Full-bleed image background with strong charcoal overlay; two CTAs
 * (primary "Browse stock" + secondary phone). Uses
 * --brand-image-finance so dashboard edits to that slot reflow here.
 */
export default function CtaSection() {
  const brand = useBrand()
  const phone = (brand as any)?.location?.phone || '+44 (0) 7000 000000'
  const phoneTel = phone.replace(/\D/g, '').replace(/^/, '+')

  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Ready when you are</p>
        <h2 id="cta-heading" className={styles.heading}>
          Find your next 4×4 today.
        </h2>
        <p className={styles.lead}>
          Hand-picked stock, finance arranged in minutes, nationwide delivery.
          Speak to the team or browse current vehicles right now.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/used-cars" className={styles.ctaPrimary}>
            Browse 4×4 stock
            <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </Link>
          <a href={`tel:${phoneTel}`} className={styles.ctaSecondary}>
            <Phone size={16} strokeWidth={2.2} aria-hidden="true" />
            Call {phone}
          </a>
        </div>
      </div>
    </section>
  )
}
