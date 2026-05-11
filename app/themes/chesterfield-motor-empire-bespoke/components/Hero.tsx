'use client'

import Link from 'next/link'
import { Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Hero.module.css'

export default function Hero() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const town =
    (brand?.location?.address as any)?.city ||
    (brand?.location?.address as any)?.town ||
    'Chesterfield'

  const tagline = brand?.tagline || 'Quality used cars in Chesterfield'
  const subTagline =
    (brand?.aboutUs as any)?.headline ||
    'Family-run dealership. Privately sourced stock. Dealer-backed warranty on every vehicle.'

  return (
    <section className={styles.hero} aria-label="Showroom hero">
      <div
        className={styles.heroBg}
        style={{ backgroundImage: 'var(--brand-image-hero)' }}
        aria-hidden="true"
      />
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={styles.heroGrid} aria-hidden="true" />

      <div className={styles.glowField} aria-hidden="true">
        <span className={`${styles.glowOrb} ${styles.glowOrbA} mfx-glow-pulse`} />
        <span className={`${styles.glowOrb} ${styles.glowOrbB} mfx-glow-orbit`} />
      </div>

      <div className={styles.cornerBracket} data-pos="tl" aria-hidden="true" />
      <div className={styles.cornerBracket} data-pos="tr" aria-hidden="true" />
      <div className={styles.cornerBracket} data-pos="bl" aria-hidden="true" />
      <div className={styles.cornerBracket} data-pos="br" aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className={styles.heroLeft}>
          <p className={styles.eyebrow} data-aos="fade-up">
            <span className={`${styles.statusDot} mfx-pulse-dot`} aria-hidden="true" />
            <span>Live stock · {town}, Derbyshire</span>
          </p>

          <h1 className={styles.title} data-aos="fade-up" data-aos-delay="80">
            <span className={styles.titleLine}>Built for the road,</span>
            <span className={styles.titleLine}>
              <span className={`${styles.titleHighlight} mfx-text-glow`}>backed for the long haul</span>.
            </span>
          </h1>

          <p className={styles.lead} data-aos="fade-up" data-aos-delay="160">
            {subTagline}
          </p>

          <div className={styles.actions} data-aos="fade-up" data-aos-delay="220">
            <Link href="/used-cars" className={`${styles.ctaPrimary} mfx-shimmer`}>
              Browse stock
              <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
            </Link>
            {contact.phoneTel ? (
              <a className={styles.ctaSecondary} href={`tel:${contact.phoneTel}`}>
                <Phone size={16} strokeWidth={2.4} aria-hidden="true" />
                {contact.phoneDisplay}
              </a>
            ) : null}
          </div>

          <ul className={styles.trustList} data-aos="fade-up" data-aos-delay="300">
            <li>
              <ShieldCheck size={14} strokeWidth={2} aria-hidden="true" />
              3-month warranty included
            </li>
            <li>
              <Sparkles size={14} strokeWidth={2} aria-hidden="true" />
              HPI &amp; finance checked
            </li>
          </ul>
        </div>

        <aside className={styles.heroRight} data-aos="fade-left" data-aos-delay="200" aria-label="Quick-pick category cards">
          <p className={styles.heroRightHeading}>Search by body type</p>
          <div className={styles.categoryGrid}>
            <Link href="/used-cars?body=Hatchback" className={styles.categoryCard}>
              <span className={styles.categoryCardName}>Hatchback</span>
              <span className={styles.categoryCardArrow}>→</span>
            </Link>
            <Link href="/used-cars?body=Saloon" className={styles.categoryCard}>
              <span className={styles.categoryCardName}>Saloon</span>
              <span className={styles.categoryCardArrow}>→</span>
            </Link>
            <Link href="/used-cars?body=SUV" className={styles.categoryCard}>
              <span className={styles.categoryCardName}>SUV</span>
              <span className={styles.categoryCardArrow}>→</span>
            </Link>
            <Link href="/used-cars?body=Estate" className={styles.categoryCard}>
              <span className={styles.categoryCardName}>Estate</span>
              <span className={styles.categoryCardArrow}>→</span>
            </Link>
            <Link href="/used-cars?body=Coupe" className={styles.categoryCard}>
              <span className={styles.categoryCardName}>Coupe</span>
              <span className={styles.categoryCardArrow}>→</span>
            </Link>
            <Link href="/used-cars?body=Convertible" className={styles.categoryCard}>
              <span className={styles.categoryCardName}>Convertible</span>
              <span className={styles.categoryCardArrow}>→</span>
            </Link>
          </div>
          <Link href="/used-cars" className={styles.viewAll}>
            View all stock
            <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </section>
  )
}
