'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './HeroSplash.module.css'

export default function HeroSplash() {
  const brand = useBrand()
  const name = (brand?.name || 'Buy4Less UK').trim()
  const heading = (typeof brand?.tagline === 'string' && brand.tagline.trim())
    ? brand.tagline.trim()
    : 'Quality used cars, engineered finance.'

  return (
    <section className={styles.hero} aria-label="Welcome">
      <div className={styles.bgImage} aria-hidden />
      <div className={styles.scrim} aria-hidden />
      <div className={styles.grid} aria-hidden />
      <span className={styles.bracketTL} aria-hidden />
      <span className={styles.bracketBR} aria-hidden />

      <div className={styles.inner}>
        <span className={styles.eyebrow}>
          <span className={styles.pulse} aria-hidden />
          {name.toUpperCase()} · SHOWROOM ONLINE
        </span>
        <h1 className={styles.title}>{heading}</h1>
        <p className={styles.lead}>
          Hand-selected stock, transparent pricing and finance built around your
          budget — all in one place.
        </p>
        <div className={styles.actions}>
          <Link href="/used-cars" className={styles.cta}>
            Browse the showroom
            <ArrowRight size={16} strokeWidth={2.6} aria-hidden />
          </Link>
          <Link href="/finance" className={styles.ctaGhost}>
            Finance in 60 seconds
          </Link>
        </div>
      </div>

      <div className={styles.assurance} aria-hidden>
        <span>0% deposit options</span>
        <span className={styles.sep} />
        <span>Nationwide delivery</span>
        <span className={styles.sep} />
        <span>Every car HPI checked</span>
      </div>
    </section>
  )
}
