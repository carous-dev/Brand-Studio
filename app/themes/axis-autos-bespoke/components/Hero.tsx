'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Hero.module.css'

/**
 * Hero — typography-only-hero pattern.
 *
 * Per oneBigMove=decorative-density-minimum: ZERO decorative layers. No
 * background photo, no grid overlay, no glow blob, no scan line, no corner
 * reticles. Pure type on a clean light surface.
 *
 * Per feedback_hero_simplicity_balance.md: 1 eyebrow + 1 headline (≤2 lines,
 * sentence case in IBM Plex Mono) + 1 lead + 1 primary CTA + ≤1 secondary
 * (phone link if available). No chip row, no search card, no stat strip.
 */
export default function Hero({ featuredCount }: { featuredCount?: number }) {
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
      <div className={styles.inner}>
        <p className={styles.eyebrow} data-aos="fade-up">
          <span className={styles.eyebrowMark}>{'> '}</span>
          {stockLabel} · {locationLabel}
        </p>

        <h1 className={styles.title} data-aos="fade-up" data-aos-delay="80">
          Used cars,<br />
          <span className={styles.titleAccent}>sold straight.</span>
        </h1>

        <p className={styles.lead} data-aos="fade-up" data-aos-delay="160">
          Independent specialists. One forecourt. Finance, part-exchange and
          nationwide delivery built in — no surprises, no theatre.
        </p>

        <div className={styles.ctaRow}>
          <Link href="/used-cars" className={`axis-btn axis-btn--primary ${styles.primaryCta}`}>
            Browse stock
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
          {contact.phoneTel ? (
            <a href={`tel:${contact.phoneTel}`} className={`axis-btn axis-btn--ghost-dark ${styles.phoneCta}`}>
              <Phone size={16} strokeWidth={2} />
              {contact.phoneDisplay}
            </a>
          ) : (
            <Link href="/finance" className={`axis-btn axis-btn--ghost-dark ${styles.phoneCta}`}>
              Get a finance quote
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
