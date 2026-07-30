'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import { resolveText } from '../lib/brand-text'
import { themeImageCss } from '@/app/themes/lib/theme-images'
import imageRecipe from '../recipes/image-recipe.json'
import CanvasFX from '@/app/widgets/CanvasFX/CanvasFX'
import styles from './Hero.module.css'

/**
 * Home hero — split layout with a claret-matted framed photo (the theme's
 * locked signature move: NO sibling theme frames its hero photo).
 *
 * Text never sits on the photograph, so the hero needs no scrim and survives
 * any brand palette. Simplicity caps (build-rules §6): 1 eyebrow, 1 h1
 * (sentence-case, ≤2 lines), 1 lead, ≤2 CTAs, zero search/chip/stat clusters —
 * credentials belong to the proof-ledger below, not the hero.
 *
 * Photo source resolves through the image contract (recipes/image-recipe.json,
 * slot "hero"): brand.images.hero → brand.heroImage → the slot's theme default.
 * When every tier is absent the frame shows its `--color-surface` fallback + a
 * muted placeholder line so the empty state reads as an intentional matted
 * panel, not a broken box. No hardcoded image path lives here.
 */
export default function Hero() {
  const brand = useBrand()

  const eyebrow = resolveText(brand, 'hero.eyebrow')
  const title = resolveText(brand, 'hero.title')
  const lead = resolveText(brand, 'hero.lead')
  const ctaPrimary = resolveText(brand, 'hero.cta_primary')
  const ctaSecondary = resolveText(brand, 'hero.cta_secondary')

  // Photo via the image contract — resolves override → hero tier → theme
  // default → `none` (which reveals the framed surface fallback).
  const photoStyle = { backgroundImage: themeImageCss(imageRecipe, brand, 'hero') }

  return (
    <section className={styles.hero} aria-label="Welcome">
      {/* Furnishing (luxury→refined): soft brand-light canvas behind the split.
          Self-guards — static token wash under reduced-motion / ≤640px. */}
      <CanvasFX variant="aurora-light" density={0.8} className={styles.aurora} />
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.eyebrow} data-aos="fade-up">{eyebrow}</p>

          <h1 className={styles.title} data-aos="fade-up" data-aos-delay="60">
            {title}
          </h1>

          <p className={styles.lead} data-aos="fade-up" data-aos-delay="120">
            {lead}
          </p>

          <div className={styles.ctaRow} data-aos="fade-up" data-aos-delay="180">
            <Link href="/used-cars" className={styles.primaryCta}>
              {ctaPrimary}
            </Link>
            <Link href="/contact" className={styles.ghostCta}>
              {ctaSecondary}
            </Link>
          </div>
        </div>

        <figure className={styles.figure} data-aos="fade-up" data-aos-delay="120">
          <span className={styles.mat} aria-hidden="true" />
          <div className={`${styles.frame} mfx-spotlight`}>
            <span className={styles.placeholder} aria-hidden="true">{eyebrow}</span>
            <div className={styles.photo} role="img" aria-label={eyebrow} style={photoStyle} />
          </div>
        </figure>
      </div>
    </section>
  )
}
