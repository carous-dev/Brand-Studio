'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './HomeHero.module.css'

export default function HomeHero() {
  const brand = useBrand()
  const eyebrow = (typeof brand?.tagline === 'string' && brand.tagline.trim())
    ? brand.tagline.trim()
    : 'Quality vehicles. Premium experience.'

  return (
    <section className={styles.hero} aria-label="Welcome">
      <div className={styles.bgImage} aria-hidden />
      <div className={styles.wash} aria-hidden />

      <div className={styles.inner}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>
          Drive Excellence.
          <br />
          <span className={styles.titleEmph}>Drive Home Today.</span>
        </h1>
        <p className={styles.lead}>
          Shop our wide selection of quality pre-owned vehicles and find the
          perfect car for your lifestyle.
        </p>
        <div className={styles.actions}>
          <Link href="/used-cars" className={styles.cta}>
            Browse Inventory
          </Link>
          <Link href="/finance" className={styles.ctaGhost}>
            Get Pre-Approved
          </Link>
        </div>
      </div>
    </section>
  )
}
