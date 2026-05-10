'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './Hero.module.css'

/**
 * Columbus Vehicles — Hero (rugged archetype)
 * Designed fresh per docs/theme-archetype-specs.md → "rugged":
 *   - Dark-mode full-bleed photo at 80vh desktop
 *   - Condensed-bold uppercase headline (Oswald)
 *   - Two CTA buttons with sharp 4px corners (NOT pills)
 *   - No floating search; the dealer-signage feel calls for direct CTAs
 *   - Status pills below CTAs reinforce the "specialist" positioning
 *
 * Brand-token discipline: every color via var(--color-*) or var(--brand-image-*),
 * never hardcoded. Mobile-first; min-width breakpoints only.
 */
export default function Hero() {
  const brand = useBrand()
  const dealerName = brand?.name || 'Columbus Vehicles'
  const tagline = (brand as any)?.tagline || "We're the quality used 4×4 specialists."
  const asString = (v: unknown): string | null => (typeof v === 'string' && v ? v : null)
  const lead =
    asString(brand?.aboutUs?.description) ||
    `${dealerName} — the UK's #1 4×4 dealer for five consecutive years. Hand-picked Jeep Wranglers, Land Rover Defenders and rugged off-road vehicles, with flexible finance and expert staff consultation.`

  return (
    <section className={styles.hero} aria-labelledby="hero-headline">
      <div className={styles.heroPhoto} aria-hidden="true" />
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={styles.heroInner}>
        <p className={styles.eyebrow}>UK&apos;s #1 4×4 specialist · 5 years running</p>
        <h1 id="hero-headline" className={styles.headline}>
          {tagline}
        </h1>
        <p className={styles.lead}>{lead}</p>
        <div className={styles.ctaRow}>
          <Link href="/used-cars" className={styles.ctaPrimary}>
            Browse current 4×4 stock
            <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </Link>
          <Link href="/contact" className={styles.ctaSecondary}>
            <Phone size={16} strokeWidth={2} aria-hidden="true" />
            Speak to the team
          </Link>
        </div>
        <ul className={styles.statusPills} role="list">
          <li className={styles.statusPill}>Quality assured</li>
          <li className={styles.statusPill}>Finance available</li>
          <li className={styles.statusPill}>Nationwide delivery</li>
        </ul>
      </div>
    </section>
  )
}
