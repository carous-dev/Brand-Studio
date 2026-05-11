'use client'

// audit-ignore-file: data-useeffect-fetch — brand context is client-side; home is a server shell composed of client islands.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Fuel, Gauge, Calendar } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import styles from './LatestArrivalsSection.module.css'

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

const formatMileage = (n: number) =>
  new Intl.NumberFormat('en-GB').format(n)

export default function LatestArrivalsSection() {
  const brand = useBrand()
  const [items, setItems] = useState<InventoryVehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const slug = (brand?.slug || '').trim()
    // audit-ignore: data-useeffect-fetch — useBrand is client-side; home page is a server shell with client island sections.
    const params = new URLSearchParams({ limit: '4', sort: 'newest', light: '1', vehicle_type: 'car', stock_status: 'in_stock' })
    if (slug) params.set('brand', slug)
    fetch(apiUrl(`/featured-vehicles?${params.toString()}`), { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
        setItems(list.map(normalizeInventoryItem).filter(Boolean).slice(0, 4))
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [brand?.slug])

  return (
    <section className={`auto-section ${styles.section}`} aria-labelledby="latest-arrivals-title">
      <div className="auto-container">
        <header className={styles.header}>
          <div>
            <p className="auto-eyebrow" data-aos="fade-right">Latest arrivals</p>
            <h2 id="latest-arrivals-title" className="auto-section-title" data-aos="fade-up">
              Fresh in. Forecourt-ready.
            </h2>
          </div>
          <Link href="/used-cars" className={`auto-cta-link ${styles.viewAll}`} data-aos="fade-left">
            View all stock
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </header>

        {loading && (
          <ul className={styles.grid} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className={`${styles.card} ${styles.skeleton}`} />
            ))}
          </ul>
        )}

        {!loading && items.length === 0 && (
          <p className={styles.empty}>
            New stock listing soon &mdash; in the meantime, request a sourcing brief.
          </p>
        )}

        {items.length > 0 && (
          <ul className={styles.grid}>
            {items.map((v, i) => {
              const href = buildVehiclePermalink(v as any) || `/used-cars/${v.id}`
              const stockNo = String(v.id).slice(-4).toUpperCase()
              return (
                <li
                  key={v.id}
                  className={styles.card}
                  data-aos="fade-up"
                  data-aos-delay={i * 80}
                >
                  <Link href={href} className={styles.cardLink}>
                    <div className={styles.media}>
                      {v.image ? (
                        <img src={v.image} alt={v.title} loading="lazy" />
                      ) : (
                        <div className={styles.mediaPlaceholder} aria-hidden="true" />
                      )}
                      <span className={styles.stockChip}>Stock #{stockNo}</span>
                    </div>
                    <div className={styles.cardBody}>
                      <p className={styles.cardTitle}>{v.title}</p>
                      <p className={styles.cardPrice}>{formatPrice(v.price)}</p>
                      <ul className={styles.specs}>
                        <li>
                          <Calendar size={14} aria-hidden="true" />
                          <span>{v.year || '—'}</span>
                        </li>
                        <li>
                          <Gauge size={14} aria-hidden="true" />
                          <span>{formatMileage(v.mileage)} mi</span>
                        </li>
                        <li>
                          <Fuel size={14} aria-hidden="true" />
                          <span>{v.fuel}</span>
                        </li>
                      </ul>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
