'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck, BadgeCheck, Truck, Star } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './EditorialIntro.module.css'

const TRUST_POINTS: Array<{ Icon: typeof ShieldCheck; label: string }> = [
  { Icon: ShieldCheck, label: 'Independently inspected' },
  { Icon: BadgeCheck, label: 'No-pressure pricing' },
  { Icon: Truck, label: 'UK-wide delivery' },
]

export default function EditorialIntro() {
  const brand = useBrand()
  const brandName = brand?.name || 'Autowow'
  const address = (brand as any)?.location?.address || {}
  const locationLabel = [address.city, address.county].filter(Boolean).join(', ') || 'across the UK'
  const heroImage =
    (brand as any)?.images?.about
    || (brand as any)?.aboutImage
    || (brand as any)?.heroImage
    || '/themes/auto-wow-uk-bespoke-02/images/about.jpg'

  return (
    <section className={`auto-section ${styles.section}`} aria-label="About the showroom">
      <span className={styles.cornerMark} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.media} data-aos="fade-up">
          <div
            className={styles.mediaFrame}
            style={{ backgroundImage: `url(${heroImage})` }}
            role="img"
            aria-label={`Inside the ${brandName} showroom`}
          />
          <div className={styles.statBadge} aria-hidden="true">
            <span className={styles.statNumber}>12<span className={styles.statPlus}>+</span></span>
            <span className={styles.statLabel}>Years on the forecourt</span>
          </div>
          <div className={styles.ratingChip} aria-label="Google reviews rating">
            <span className={styles.ratingStars}>
              <Star size={14} fill="currentColor" strokeWidth={0} />
              <Star size={14} fill="currentColor" strokeWidth={0} />
              <Star size={14} fill="currentColor" strokeWidth={0} />
              <Star size={14} fill="currentColor" strokeWidth={0} />
              <Star size={14} fill="currentColor" strokeWidth={0} />
            </span>
            <span className={styles.ratingMeta}>4.9 · Google reviewed</span>
          </div>
        </div>

        <div className={styles.body} data-aos="fade-up" data-aos-delay="80">
          <span className={styles.eyebrow}>Who we are</span>
          <h2 className={styles.title}>
            Honest cars,{' '}
            <span className={styles.titleAccent}>priced to move.</span>
          </h2>
          <p className={styles.copy}>
            {brandName} is an independent retailer in {locationLabel}. Every vehicle on
            the floor has been inspected, prepped, and is ready to drive — no theatre,
            no upsell, no hidden fees at handover.
          </p>

          <ul className={styles.trust} role="list">
            {TRUST_POINTS.map(({ Icon, label }) => (
              <li key={label} className={styles.trustItem}>
                <span className={styles.trustIcon}>
                  <Icon size={16} strokeWidth={2} />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className={styles.ctaRow}>
            <Link href="/about" className={styles.primaryCta}>
              How we work
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link href="/contact" className={styles.ghostCta}>
              Visit the showroom
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
