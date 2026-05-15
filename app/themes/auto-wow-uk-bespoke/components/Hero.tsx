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
  const city = brand?.location?.address?.city || ''
  const county = brand?.location?.address?.county || ''
  const cityLine = [city, county].filter(Boolean).join(', ')
  const brandName = brand?.name || 'this dealership'
  const title = typeof brand?.tagline === 'string' && brand.tagline.trim()
    ? brand.tagline.trim()
    : 'Quality used cars, honestly sold.'
  const lead = typeof brand?.aboutUs?.description === 'string' && brand.aboutUs.description.trim()
    ? brand.aboutUs.description.trim()
    : `Browse carefully presented used cars from ${brandName}. Enquire online, ask about finance and part exchange, and speak to the team before you visit.`
  const hasLocation = Boolean(cityLine)
  const hasPhone = Boolean(contact.phoneTel)
  const trustItems = [
    hasLocation ? `Based in ${cityLine}` : '',
    'Vehicle details checked',
    'Finance and part exchange support',
  ].filter(Boolean)
  const density = trustItems.length >= 3 && hasPhone ? 'full' : trustItems.length > 1 || hasPhone ? 'balanced' : 'compact'

  return (
    <section className={styles.hero} data-density={density} data-mfx-scroll="parallax-slow">
      <HeroBackdrop className={styles.heroBackdrop} />
      <div className={styles.heroImage} aria-hidden="true" />
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={`mfx-glow-pulse ${styles.heroGlow}`} aria-hidden="true" />
      <div className={styles.heroGrid} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow} data-aos="fade-right">
            <span className="mfx-pulse-dot" aria-hidden="true" />
            {hasLocation ? `${cityLine} · Quality stock` : 'Quality used-car stock'}
          </p>

          <h1 className={`mfx-text-glow ${styles.title}`} data-aos="fade-up" data-aos-duration="900">
            {title}
          </h1>

          <p className={styles.lead} data-aos="fade-up" data-aos-delay="120">
            {lead}
          </p>

          <div className={styles.ctas} data-aos="fade-up" data-aos-delay="200">
            <Link href="/used-cars" className={`auto-btn auto-btn--primary mfx-shimmer ${styles.ctaPrimary}`}>
              Browse stock
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
            {hasPhone ? (
              <a href={`tel:${contact.phoneTel}`} className={`auto-btn auto-btn--ghost ${styles.ctaGhost}`}>
                <Phone size={16} aria-hidden="true" />
                Call now
              </a>
            ) : null}
          </div>

          {trustItems.length > 0 ? (
            <ul className={styles.trustRow} role="list" data-aos="fade-up" data-aos-delay="300">
              {trustItems.map((item) => (
                <li key={item}>
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}
