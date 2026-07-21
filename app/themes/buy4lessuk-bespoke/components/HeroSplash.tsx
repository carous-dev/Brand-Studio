'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './HeroSplash.module.css'

export default function HeroSplash() {
  const brand = useBrand()
  const name = (brand?.name || 'Buy4Less UK').trim()
  const heading = (typeof brand?.tagline === 'string' && brand.tagline.trim())
    ? brand.tagline.trim()
    : 'Quality Used Cars With Finance Deals to Suit You'

  return (
    <section className={styles.hero} aria-label="Welcome">
      <div className={styles.bgImage} aria-hidden />
      <div className={styles.scrim} aria-hidden />
      <div className={styles.inner}>
        <span className={styles.eyebrow}>WELCOME TO {name.toUpperCase()}</span>
        <h1 className={styles.title}>{heading}</h1>
        <Link href="/about" className={styles.readMore}>
          Read more
        </Link>
      </div>
    </section>
  )
}
