'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBrand } from '../../context/BrandClientWrapper'
import { apiUrl } from '../../lib/api'
import styles from './CtaBand.module.css'

export default function CtaBand() {
  const brand = useBrand()
  const slug = brand?.slug || 'default'
  const [hasBikes, setHasBikes] = useState<boolean | null>(null)

  // audit-ignore: data-useeffect-fetch — brand context client-side, decorative copy-adapter
  useEffect(() => {
    let cancelled = false
    const probe = async () => {
      try {
        const res = await fetch(apiUrl(`/inventory?brand=${slug}&per_page=200&light=1`))
        const data = await res.json()
        const items: any[] = Array.isArray(data?.items) ? data.items : []
        const found = items.some((v) => {
          const t = String(v?.type ?? v?.vehicleType ?? '').toLowerCase()
          return t === 'bike' || t === 'motorcycle' || t === 'motorbike'
        })
        if (!cancelled) setHasBikes(found)
      } catch {
        if (!cancelled) setHasBikes(false)
      }
    }
    probe()
    return () => { cancelled = true }
  }, [slug])

  const dualMode = hasBikes !== false

  return (
    <section className={styles.band} aria-label="Sell to us">
      <div className={styles.bandImage} aria-hidden="true" />
      <div className={styles.bandOverlay} aria-hidden="true" />
      <div className={styles.bandGlow} aria-hidden="true" />

      <div className={`${styles.bandInner} dual-container`}>
        <div className={styles.copy} data-aos="fade-right">
          <span className={styles.eyebrow}>Selling up?</span>
          <h2 className={styles.title}>
            We buy <span className={styles.titleAccent}>{dualMode ? 'cars and bikes' : 'your vehicle'}</span> outright.
          </h2>
          <p className={styles.lead}>
            Get an instant guide price online, free collection across the UK, and bank-transferred payment the same day.
          </p>
        </div>

        <div className={styles.cards} data-aos="fade-left">
          <Link href="/sell-my-car?type=car" className={`${styles.cardCta} ${styles.cardCtaCar}`}>
            <span className={styles.cardCtaLabel}>Sell my car</span>
            <span className={styles.cardCtaSub}>Saloon · SUV · 4×4 · hatch · estate</span>
            <span className={styles.cardCtaArrow}>→</span>
          </Link>
          {dualMode && (
            <Link href="/sell-my-car?type=bike" className={`${styles.cardCta} ${styles.cardCtaBike}`}>
              <span className={styles.cardCtaLabel}>Sell my bike</span>
              <span className={styles.cardCtaSub}>Sport · cruiser · adventure · scooter</span>
              <span className={styles.cardCtaArrow}>→</span>
            </Link>
          )}
          {!dualMode && (
            <Link href="/part-exchange" className={`${styles.cardCta}`}>
              <span className={styles.cardCtaLabel}>Part exchange</span>
              <span className={styles.cardCtaSub}>Trade in against any of our stock</span>
              <span className={styles.cardCtaArrow}>→</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
