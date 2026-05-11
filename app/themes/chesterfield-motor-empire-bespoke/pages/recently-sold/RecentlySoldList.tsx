'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, Gauge, Fuel } from 'lucide-react'
import { apiUrl } from '../../lib/api'
import { useBrand } from '../../context/BrandClientWrapper'
import { normalizeInventoryItem, type InventoryVehicle } from '../../lib/inventory'
import styles from './page.module.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

export default function RecentlySoldList() {
  const brand = useBrand()
  const brandSlug = (brand?.slug || '').trim()
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>([])
  const [loading, setLoading] = useState(true)

  // audit-ignore: data-useeffect-fetch — brand slug is client-only on this page
  useEffect(() => {
    let aborted = false
    const controller = new AbortController()
    async function load() {
      try {
        const params = new URLSearchParams()
        params.set('limit', '24')
        if (brandSlug) params.set('brand', brandSlug)
        const res = await fetch(apiUrl(`/recently-sold?${params.toString()}`), {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('fetch failed')
        const payload = await res.json()
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : []
        if (aborted) return
        const normalized = items
          .map((item: any) => normalizeInventoryItem(item))
          .filter(Boolean) as InventoryVehicle[]
        setVehicles(normalized)
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    load()
    return () => { aborted = true; controller.abort() }
  }, [brandSlug])

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {loading ? (
          <ul className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={`skel-${i}`} className={styles.skelCard}>
                <span className={styles.skelMedia} />
                <div className={styles.skelBody}>
                  <span className={`${styles.skelLine} ${styles.skelLineShort}`} />
                  <span className={styles.skelLine} />
                  <span className={styles.skelLine} />
                </div>
              </li>
            ))}
          </ul>
        ) : vehicles.length === 0 ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>Sold history coming soon</h2>
            <p className={styles.emptyBody}>
              Once cars have moved on from our showroom, they&rsquo;ll show up here. In the meantime
              browse current stock — there&rsquo;s a fresh selection on the forecourt.
            </p>
            <Link href="/used-cars" className={styles.emptyCta}>
              Browse current stock
              <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            <header className={styles.header} data-aos="fade-up">
              <p className={styles.eyebrow}>{vehicles.length} sold {vehicles.length === 1 ? 'vehicle' : 'vehicles'}</p>
              <h2 className={styles.heading}>Cars from our forecourt that have moved on.</h2>
            </header>
            <ul className={styles.grid}>
              {vehicles.map((v, i) => (
                <li
                  key={v.id}
                  className={styles.card}
                  data-aos="fade-up"
                  data-aos-delay={String((i % 3) * 60)}
                >
                  <div
                    className={styles.media}
                    style={{ backgroundImage: `url(${v.image})` }}
                    role="img"
                    aria-label={v.title}
                  >
                    <span className={styles.soldBanner} aria-hidden="true">SOLD</span>
                    <span className={styles.mediaShade} aria-hidden="true" />
                  </div>
                  <div className={styles.body}>
                    <p className={styles.year}>{v.year}</p>
                    <p className={styles.title}>{v.title}</p>
                    <p className={styles.price}>
                      <span className={styles.priceLabel}>was</span>
                      <span className={styles.priceValue}>{formatPrice(v.price)}</span>
                    </p>
                    <ul className={styles.specs}>
                      <li><Calendar size={13} strokeWidth={2} aria-hidden="true" /> {v.year}</li>
                      <li><Gauge size={13} strokeWidth={2} aria-hidden="true" /> {v.mileage.toLocaleString()} mi</li>
                      <li><Fuel size={13} strokeWidth={2} aria-hidden="true" /> {v.fuel}</li>
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
            <div className={styles.afterStrip}>
              <p className={styles.afterCopy}>Looking for something similar? Browse our current stock.</p>
              <Link href="/used-cars" className={styles.afterCta}>
                See current stock
                <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
