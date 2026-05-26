'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import { SkeletonBar } from './Skeleton'
import styles from './Hero.module.css'

type LoadState = 'loading' | 'ready' | 'empty' | 'error'

function formatPrice(n: number) {
  if (!n || !Number.isFinite(n)) return 'POA'
  return `£${Math.round(n).toLocaleString('en-GB')}`
}

export default function Hero() {
  const brand = useBrand()
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [totalStock, setTotalStock] = useState<number | null>(null)

  // audit-ignore: data-useeffect-fetch — brand context client-side, hero composes server shell + client island
  useEffect(() => {
    const ctrl = new AbortController()
    const url = apiUrl(`/inventory?brand=${encodeURIComponent(brand?.slug || '')}&per_page=12&sort=newest`)
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        const items = Array.isArray(data) ? data : data.items || data.vehicles || []
        const normalized = items.map(normalizeInventoryItem).filter(Boolean) as InventoryVehicle[]
        setVehicles(normalized.slice(0, 12))
        setTotalStock(
          typeof data?.meta?.total === 'number'
            ? data.meta.total
            : Array.isArray(data)
            ? data.length
            : normalized.length,
        )
        setState(normalized.length > 0 ? 'ready' : 'empty')
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return
        setState('error')
      })
    return () => ctrl.abort()
  }, [brand?.slug])

  const marqueeTrack = vehicles.length > 0 ? [...vehicles, ...vehicles] : []

  return (
    <section className={styles.hero}>
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={`${styles.glow} mfx-glow-pulse`} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.eyebrow} data-aos="fade-up">
            <span className={`${styles.eyebrowDot} mfx-pulse-dot`} aria-hidden="true" />
            <span>
              {state === 'loading' ? (
                <SkeletonBar width={140} height={10} variant="dark" />
              ) : totalStock != null ? (
                <>
                  <strong>{totalStock}</strong> in stock · ready today
                </>
              ) : (
                'Live stock'
              )}
            </span>
          </span>

          <h1 className={styles.title} data-aos="fade-up" data-aos-delay="80">
            Better used cars,
            <br className={styles.titleBreak} />
            <span className={styles.titleAccent}>bought right.</span>
          </h1>

          <p className={styles.lead} data-aos="fade-up" data-aos-delay="160">
            Hand-picked stock, honest finance, and UK-wide delivery — from the team that picks up the phone.
          </p>

          <div className={styles.ctaRow} data-aos="fade-up" data-aos-delay="220">
            <Link href="/used-cars" className={`qb-btn qb-btn--gradient mfx-shimmer ${styles.primaryCta}`}>
              Browse the stock
            </Link>
            <Link href="/sell-my-car" className={`qb-btn qb-btn--ghost-on-dark ${styles.secondaryCta}`}>
              Sell your car
            </Link>
          </div>

          <div className={styles.assurance} data-aos="fade-up" data-aos-delay="280">
            <span className={styles.assuranceItem}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              40-point inspection
            </span>
            <span className={styles.assuranceSep} aria-hidden="true">·</span>
            <span className={styles.assuranceItem}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Finance from £148/mo
            </span>
            <span className={styles.assuranceSep} aria-hidden="true">·</span>
            <span className={styles.assuranceItem}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              UK-wide delivery
            </span>
          </div>
        </div>
      </div>

      {/* Thin live-stock marquee at the bottom — locks the signature */}
      <div className={styles.marqueeWrap} aria-label="Live stock ticker">
        <span className={styles.marqueeLabel} aria-hidden="true">
          <span className={`${styles.marqueeLabelDot} mfx-pulse-dot`} />
          STOCK · LIVE
        </span>
        <div className={styles.marqueeFade} aria-hidden="true" />
        {state === 'loading' && (
          <div className={styles.marqueeLoading} aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBar key={i} width={160} height={11} variant="dark" />
            ))}
          </div>
        )}
        {state === 'ready' && marqueeTrack.length > 0 && (
          <div className={styles.marqueeTrack}>
            {marqueeTrack.map((v, i) => (
              <span key={`${v.id}-${i}`} className={styles.marqueeItem}>
                <span className={styles.marqueeDot} aria-hidden="true" />
                <span className={styles.marqueeTitle}>{v.title}</span>
                <span className={styles.marqueePrice}>{formatPrice(v.price)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
