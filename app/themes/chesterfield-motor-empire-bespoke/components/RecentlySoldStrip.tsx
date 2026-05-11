'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { apiUrl } from '../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './RecentlySoldStrip.module.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

export default function RecentlySoldStrip() {
  const brand = useBrand()
  const brandSlug = (brand?.slug || '').trim()
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>([])
  const [loading, setLoading] = useState(true)

  // audit-ignore: data-useeffect-fetch — brand slug is client-only
  useEffect(() => {
    let aborted = false
    const controller = new AbortController()
    async function load() {
      try {
        const params = new URLSearchParams()
        params.set('limit', '4')
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
        setVehicles(normalized.slice(0, 4))
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    load()
    return () => { aborted = true; controller.abort() }
  }, [brandSlug])

  if (!loading && !vehicles.length) return null

  return (
    <section className={styles.section} aria-labelledby="recently-sold-heading">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <div>
            <p className={styles.eyebrow}>Recently sold</p>
            <h2 id="recently-sold-heading" className={styles.heading}>
              Cars that have already found new homes.
            </h2>
          </div>
          <Link href="/recently-sold" className={styles.viewAll}>
            See sold history
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </header>

        <div className={styles.grid}>
          {(loading ? Array.from({ length: 4 }).map((_, i) => null) : vehicles).map((v, i) => {
            if (!v) {
              return (
                <div key={`skel-${i}`} className={styles.skel}>
                  <div className={styles.skelMedia} />
                  <div className={styles.skelBody}>
                    <span className={styles.skelLine} />
                    <span className={`${styles.skelLine} ${styles.skelLineShort}`} />
                  </div>
                </div>
              )
            }
            return (
              <article
                key={v.id}
                className={styles.card}
                data-aos="zoom-in"
                data-aos-delay={String((i % 4) * 60)}
              >
                <div className={styles.media} style={{ backgroundImage: `url(${v.image})` }} role="img" aria-label={v.title}>
                  <span className={styles.soldBanner} aria-hidden="true">Sold</span>
                </div>
                <div className={styles.body}>
                  <p className={styles.year}>{v.year}</p>
                  <p className={styles.title}>{v.title}</p>
                  <p className={styles.price}>
                    <span className={styles.priceWas}>was</span> {formatPrice(v.price)}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
