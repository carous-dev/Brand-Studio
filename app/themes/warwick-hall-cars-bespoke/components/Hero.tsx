'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './Hero.module.css'

/**
 * Warwick Hall Cars — Home hero.
 *
 * Photo-chrome full-bleed showroom hero matching the dealer's existing site:
 * single dominant photograph, uniform dark scrim, condensed-bold uppercase
 * white headline with a brand-tinted brush-stroke ornament, single white
 * pill CTA pointing at the showroom inventory. Mobile-first responsive.
 */
export default function Hero() {
  const brand = useBrand()
  const title =
    typeof brand?.tagline === 'string' && brand.tagline.trim()
      ? brand.tagline.trim()
      : 'Quality used cars'

  return (
    <section className={styles.hero} aria-labelledby="warwick-hero-title">
      <div className={styles.heroImage} aria-hidden="true" />
      <div className={styles.heroOverlay} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className={styles.titleWrap}>
          <h1 id="warwick-hero-title" className={styles.title} data-aos="fade-up">
            {title}
          </h1>
          <BrushStroke className={styles.brushStroke} />
        </div>

        <div className={styles.ctas} data-aos="fade-up" data-aos-delay="120">
          <Link href="/used-cars" className={styles.ctaPrimary}>
            View Showroom
            <ArrowRight size={18} aria-hidden="true" className={styles.ctaArrow} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function BrushStroke({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 18"
      preserveAspectRatio="none"
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M6 11 C 70 4, 150 14, 232 7 S 300 10, 314 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}
