'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Hero.module.css'

/**
 * Simple, balanced hero — single focal area, one primary CTA + one phone link.
 *
 * Per feedback_hero_simplicity_balance.md: heroes ship as overcomplicated when
 * they stack search forms, chip rows, stat strips, and dual CTAs. Caps:
 *   - 1 eyebrow chip
 *   - 1 headline (short, ≤ 2 lines)
 *   - 1 lead paragraph
 *   - 1 primary CTA + ≤ 1 secondary (phone/tel only here)
 *   - 0 chip row, 0 search form, 0 stat strip (those live in downstream bands)
 *   - ≤ 2 decorative layers (grid overlay + brand glow blob)
 *
 * Props are kept for backward-compat with pages/home/page.tsx. featuredCount
 * is optionally surfaced in the eyebrow; availableMakes/Bodies are ignored
 * (the inventory search lives on /used-cars, not in the hero).
 */
export default function Hero({
  featuredCount,
}: {
  featuredCount?: number
  availableMakes?: string[]
  availableBodies?: string[]
}) {
  const brand = useBrand()
  const hours = useWorkingHours((brand as any)?.openingHours)
  const contact = getBrandContactInfo(brand)
  const address = (brand as any)?.location?.address || {}
  const locationLabel = [address.city, address.county].filter(Boolean).join(', ') || 'across the UK'

  const stockLabel =
    typeof featuredCount === 'number' && featuredCount > 0
      ? `${featuredCount}+ cars in stock`
      : hours?.isOnline
      ? 'Showroom open now'
      : 'Browsing 24/7'

  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.bgLayer} aria-hidden="true" />
      <div className={styles.gridOverlay} aria-hidden="true" />
      <div className={`${styles.glowBlob} mfx-glow-pulse auto-decor-mobile-hide`} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.eyebrow} data-aos="fade-down">
          <span
            className={`mfx-pulse-dot ${styles.eyeDot} ${hours?.isOnline ? styles.openDot : styles.closedDot}`}
            aria-hidden="true"
          />
          <span>{stockLabel} · {locationLabel}</span>
        </div>

        <h1 className={styles.title} data-aos="fade-up" data-aos-delay="80">
          <span className={styles.titleWord}>Stock.</span>{' '}
          <span className={styles.titleWord}>Finance.</span>{' '}
          <span className={styles.titleWord}>Drive.</span>
        </h1>

        <span className={styles.accentRule} data-aos="fade-up" data-aos-delay="120" aria-hidden="true" />

        <p className={styles.lead} data-aos="fade-up" data-aos-delay="160">
          Independent. Honest. Ready. Used cars sold straight from the showroom
          floor, with finance, part-exchange and nationwide delivery built in.
        </p>

        <div className={styles.ctaRow} data-aos="fade-up" data-aos-delay="220">
          <Link href="/used-cars" className={`auto-btn auto-btn--primary mfx-shimmer ${styles.primaryCta}`}>
            Browse stock
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
          {contact.phoneTel ? (
            <a href={`tel:${contact.phoneTel}`} className={`auto-btn auto-btn--ghost-light ${styles.phoneCta}`}>
              <Phone size={16} strokeWidth={2} />
              {contact.phoneDisplay}
            </a>
          ) : (
            <Link href="/finance" className={`auto-btn auto-btn--ghost-light ${styles.phoneCta}`}>
              Get a finance quote
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
