'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Fuel, Gauge, SlidersHorizontal } from 'lucide-react'
import { apiUrl } from '../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import { useBrand } from '../context/BrandClientWrapper'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import styles from './LatestArrivalsRail.module.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

export default function LatestArrivalsRail() {
  const brand = useBrand()
  const brandSlug = (brand?.slug || '').trim()
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // audit-ignore: data-useeffect-fetch — brand context is client-only on the homepage; this section is a client island composed inside a server-rendered home page
  useEffect(() => {
    let aborted = false
    const controller = new AbortController()

    async function load() {
      try {
        const params = new URLSearchParams()
        params.set('limit', '6')
        if (brandSlug) params.set('brand', brandSlug)
        const res = await fetch(apiUrl(`/featured-vehicles?${params.toString()}`), {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('fetch failed')
        const payload = await res.json()
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.vehicles)
              ? payload.vehicles
              : []
        if (aborted) return
        const normalized = items
          .map((item: any) => normalizeInventoryItem(item))
          .filter(Boolean) as InventoryVehicle[]
        setVehicles(normalized.slice(0, 6))
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError(true)
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    load()
    return () => {
      aborted = true
      controller.abort()
    }
  }, [brandSlug])

  return (
    <section className={styles.section} aria-labelledby="latest-arrivals-heading">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <div>
            <p className={styles.eyebrow}>Latest arrivals</p>
            <h2 id="latest-arrivals-heading" className={styles.heading}>
              Fresh stock on the forecourt.
            </h2>
          </div>
          <Link href="/used-cars" className={styles.viewAll}>
            View all stock
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </header>

        {loading ? (
          <div className={styles.skeletonRail}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonMedia} />
                <div className={styles.skeletonBody}>
                  <span className={`${styles.skeletonLine} ${styles.skeletonLineWide}`} />
                  <span className={styles.skeletonLine} />
                  <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && (error || !vehicles.length) ? (
          <div className={styles.emptyState}>
            <p>Stock list is refreshing. Drop in or call us — we&rsquo;ll talk you through what&rsquo;s arriving this week.</p>
            <Link href="/contact" className={styles.emptyCta}>
              Talk to the team
              <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </div>
        ) : null}

        {!loading && vehicles.length ? (
          <div className={styles.rail}>
            {vehicles.map((v, i) => (
              <Link
                key={v.id}
                href={buildVehiclePermalink({ slug: v.slug, reg: v.reg })}
                className={styles.card}
                data-aos="fade-up"
                data-aos-delay={String((i % 3) * 80)}
              >
                <div className={styles.media} style={{ backgroundImage: `url(${v.image})` }} role="img" aria-label={v.title}>
                  <span className={`${styles.stockTag} mfx-pulse-dot`}>
                    <span aria-hidden="true" className={styles.stockTagDot} />
                    In stock
                  </span>
                  {v.featured ? <span className={styles.featuredTag}>Featured</span> : null}
                </div>
                <div className={styles.body}>
                  <p className={styles.year}>{v.year}</p>
                  <h3 className={styles.title}>{v.title}</h3>
                  <p className={styles.price}>{formatPrice(v.price)}</p>
                  <ul className={styles.specs}>
                    <li>
                      <Gauge size={14} strokeWidth={1.8} aria-hidden="true" />
                      {v.mileage.toLocaleString()} mi
                    </li>
                    <li>
                      <Fuel size={14} strokeWidth={1.8} aria-hidden="true" />
                      {v.fuel}
                    </li>
                    <li>
                      <SlidersHorizontal size={14} strokeWidth={1.8} aria-hidden="true" />
                      {v.transmission}
                    </li>
                  </ul>
                  <span className={styles.viewLink}>
                    View vehicle
                    <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
