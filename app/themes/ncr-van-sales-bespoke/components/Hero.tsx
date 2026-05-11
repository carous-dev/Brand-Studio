'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck, Truck, Wallet, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Hero.module.css'

export default function Hero() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'NCR Van Sales Ltd'

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroImage} aria-hidden="true" data-mfx-scroll="parallax-slow" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.gridPattern} aria-hidden="true" />
      <div className={`${styles.glowOrb} ${styles.glowOrbLeft} mfx-glow-orbit`} aria-hidden="true" />
      <div className={`${styles.glowOrb} ${styles.glowOrbRight} mfx-glow-pulse`} aria-hidden="true" />
      <div className={styles.cornerBracketTL} aria-hidden="true" />
      <div className={styles.cornerBracketBR} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.statusRow} data-aos="fade-down" data-aos-duration="700">
          <span className={styles.statusChip}>
            <span className={`${styles.statusDot} mfx-pulse-dot`} aria-hidden="true" />
            Live stock
          </span>
          <span className={styles.statusChipMuted}>Finance available</span>
          <span className={styles.statusChipMuted}>Nationwide delivery</span>
        </div>

        <p className={styles.eyebrow} data-aos="fade-up" data-aos-delay="80">
          UK Commercial Van Specialists
        </p>

        <h1 id="hero-title" className={styles.title} data-aos="fade-up" data-aos-delay="120" data-aos-duration="900">
          Vans built for the <span className={`${styles.titleAccent} mfx-text-glow`}>trade.</span>
        </h1>

        <p className={styles.lead} data-aos="fade-up" data-aos-delay="240" data-aos-duration="900">
          Inspected, prepared and ready to work. From panel vans to Lutons, {brandName} sources commercial vehicles that earn their keep — backed by transparent pricing, finance options and a 7-day exchange promise.
        </p>

        <div className={styles.ctaRow} data-aos="fade-up" data-aos-delay="360">
          <Link href="/used-cars" className={`${styles.ctaPrimary} mfx-shimmer`}>
            Browse the fleet
            <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </Link>
          <Link href="/sell-my-car" className={styles.ctaSecondary}>
            Sell your van
          </Link>
        </div>

        <ul className={styles.tile} data-aos="fade-up" data-aos-delay="480">
          <li>
            <ShieldCheck size={20} strokeWidth={2} aria-hidden="true" />
            <div>
              <strong>Workshop checked</strong>
              <span>Every van inspected before sale</span>
            </div>
          </li>
          <li>
            <Truck size={20} strokeWidth={2} aria-hidden="true" />
            <div>
              <strong>UK-wide delivery</strong>
              <span>Direct to your yard</span>
            </div>
          </li>
          <li>
            <Wallet size={20} strokeWidth={2} aria-hidden="true" />
            <div>
              <strong>Finance options</strong>
              <span>Tailored to trade buyers</span>
            </div>
          </li>
          {contact.phoneDisplay ? (
            <li>
              <Phone size={20} strokeWidth={2} aria-hidden="true" />
              <div>
                <strong>{contact.phoneDisplay}</strong>
                <span>Speak to the team direct</span>
              </div>
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  )
}
