'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, Gauge } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import styles from './RecentlySoldPreview.module.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

export default function RecentlySoldPreview() {
  const brand = useBrand()
  const slug = (brand?.slug || '').trim()
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>([])
  const [loading, setLoading] = useState(true)

  // audit-ignore: data-useeffect-fetch — brand context only available client-side; home page is composed of server-rendered shell + client islands that hydrate inventory
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const params = new URLSearchParams()
        params.set('limit', '3')
        if (slug) params.set('brand', slug)
        const res = await fetch(apiUrl(`/recently-sold?${params.toString()}`), {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('fetch failed')
        const payload = await res.json()
        const items: any[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
          ? payload.items
          : []
        const normalized = items
          .map((it) => normalizeInventoryItem(it))
          .filter(Boolean) as InventoryVehicle[]
        setVehicles(normalized.slice(0, 3))
      } catch {
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [slug])

  if (!loading && vehicles.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="recently-sold-title">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <div>
            <p className={styles.eyebrow}>Moving fast</p>
            <h2 id="recently-sold-title" className={styles.title}>
              Recently <span className={styles.titleAccent}>sold</span>
            </h2>
            <p className={styles.lead}>A snapshot of vans that left the forecourt this week.</p>
          </div>
          <Link href="/recently-sold" className={styles.viewAll}>
            See all recently sold
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </header>

        <ul className={styles.grid}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <li key={`sk-${i}`} className={`${styles.card} ${styles.skeleton}`}>
                  <div className={styles.skeletonMedia} />
                  <div className={styles.skeletonBody}>
                    <span className={styles.skeletonLine} />
                    <span className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
                  </div>
                </li>
              ))
            : vehicles.map((v, i) => (
                <li key={v.id} className={styles.card} data-aos="flip-up" data-aos-delay={i * 120}>
                  <div className={styles.media}>
                    <img src={v.image} alt={v.title} loading="lazy" />
                    <span className={styles.soldBanner} aria-label="Sold">SOLD</span>
                  </div>
                  <div className={styles.body}>
                    <h3 className={styles.cardTitle}>{v.title}</h3>
                    <p className={styles.price}>{formatPrice(v.price)}</p>
                    <ul className={styles.specs}>
                      <li><Calendar size={14} strokeWidth={2} aria-hidden="true" /> {v.year || '—'}</li>
                      <li><Gauge size={14} strokeWidth={2} aria-hidden="true" /> {v.mileage.toLocaleString()} mi</li>
                    </ul>
                  </div>
                </li>
              ))}
        </ul>
      </div>
    </section>
  )
}
