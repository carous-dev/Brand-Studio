'use client'

import Link from 'next/link'
import { ChevronRight, ShieldCheck, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { HeroBackdrop } from './HeroBackdrop'
import styles from './Hero.module.css'

export default function Hero() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const city = brand?.location?.address?.city || 'Barking'
  const county = brand?.location?.address?.county || 'Essex'

  return (
    <section className={styles.hero} data-mfx-scroll="parallax-slow">
      <HeroBackdrop className={styles.heroBackdrop} />
      <div className={styles.heroImage} aria-hidden="true" />
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={`mfx-glow-pulse ${styles.heroGlow}`} aria-hidden="true" />
      <div className={styles.heroGrid} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow} data-aos="fade-right">
            <span className="mfx-pulse-dot" aria-hidden="true" />
            Quality used cars · {city}, {county}
          </p>

          <h1 className={`mfx-text-glow ${styles.title}`} data-aos="fade-up" data-aos-duration="900">
            Built for the road,
            <br />
            <span className={styles.titleAccent}>backed for the long haul.</span>
          </h1>

          <p className={styles.lead} data-aos="fade-up" data-aos-delay="120">
            Hand-picked imports and main-dealer-sourced stock, prepared to a high retail standard
            and backed by a minimum 3-month warranty. Honest pricing, friendly aftercare.
          </p>

          <div className={styles.ctas} data-aos="fade-up" data-aos-delay="200">
            <Link href="/used-cars" className={`auto-btn auto-btn--primary mfx-shimmer ${styles.ctaPrimary}`}>
              Browse stock
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
            {contact.phoneTel && (
              <a href={`tel:${contact.phoneTel}`} className={`auto-btn auto-btn--ghost ${styles.ctaGhost}`}>
                <Phone size={16} aria-hidden="true" />
                Call now
              </a>
            )}
          </div>

          <ul className={styles.trustRow} role="list" data-aos="fade-up" data-aos-delay="300">
            <li>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>500+ vehicles available</span>
            </li>
            <li>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>HPI &amp; finance checked</span>
            </li>
            <li>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Nationwide delivery</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
