'use client'

import Link from 'next/link'
import { ArrowRight, Phone, Award, MapPin } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Hero.module.css'

/**
 * Split-screen-photo-left hero. Photo anchors the left half, content lives
 * right. Sentence-case display title, refined supporting strip below the lead.
 *
 * Caps per feedback_hero_simplicity_balance:
 *   - 1 eyebrow chip
 *   - 1 sentence-case headline
 *   - 1 lead paragraph
 *   - 1 primary CTA + 1 secondary (phone)
 *   - 0 chip row, 0 search form, 0 stat strip in hero
 *   - decorative-density-minimum: a thin brand-accent rule above the title is
 *     the only ornament; everything else is typography + whitespace
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
  const city = address.city || ''
  const locationLabel = city ? `In ${city}` : 'Across the UK'

  const stockLabel =
    typeof featuredCount === 'number' && featuredCount > 0
      ? `${featuredCount}+ cars in stock`
      : hours?.isOnline
      ? 'Showroom open today'
      : 'Browse 24/7 online'

  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.grid}>
        <div className={styles.media} aria-hidden="true">
          <div className={styles.mediaImage} role="presentation" />
          <span className={styles.mediaCorner} aria-hidden="true" />
        </div>

        <div className={styles.content}>
          <span className={styles.eyebrow} data-aos="fade-up">
            <span className={styles.eyeRule} aria-hidden="true" />
            <span className={styles.eyeText}>{stockLabel} · {locationLabel}</span>
          </span>

          <h1 className={styles.title} data-aos="fade-up" data-aos-delay="80">
            Used cars, chosen carefully
            <br />
            and sold honestly.
          </h1>

          <p className={styles.lead} data-aos="fade-up" data-aos-delay="160">
            Every vehicle in our showroom is hand-picked, inspected, and priced fairly.
            Finance, part-exchange, and nationwide delivery all arranged in one place.
          </p>

          <div className={styles.ctaRow} data-aos="fade-up" data-aos-delay="220">
            <Link href="/used-cars" className={`axis-btn axis-btn--primary ${styles.primaryCta}`}>
              Browse the stock
              <ArrowRight size={18} strokeWidth={1.8} />
            </Link>
            {contact.phoneTel ? (
              <a href={`tel:${contact.phoneTel}`} className={`axis-btn axis-btn--ghost ${styles.secondaryCta}`}>
                <Phone size={16} strokeWidth={1.8} />
                {contact.phoneDisplay}
              </a>
            ) : (
              <Link href="/contact" className={`axis-btn axis-btn--ghost ${styles.secondaryCta}`}>
                Talk to us
              </Link>
            )}
          </div>

          <ul className={styles.assurance} data-aos="fade-up" data-aos-delay="280">
            <li>
              <Award size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>100-point inspection</span>
            </li>
            <li>
              <MapPin size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>Nationwide delivery</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
