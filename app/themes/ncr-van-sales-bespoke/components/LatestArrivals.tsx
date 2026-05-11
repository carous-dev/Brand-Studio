'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Fuel, Gauge, Settings2 } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import styles from './LatestArrivals.module.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

const toSlug = (value: string) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function LatestArrivals() {
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
        params.set('limit', '4')
        if (slug) params.set('brand', slug)
        const res = await fetch(apiUrl(`/featured-vehicles?${params.toString()}`), {
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
        setVehicles(normalized.slice(0, 4))
      } catch {
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [slug])

  return (
    <section className={styles.section} aria-labelledby="latest-arrivals-title">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <div>
            <p className={styles.eyebrow}>Fresh stock</p>
            <h2 id="latest-arrivals-title" className={styles.title}>
              Latest <span className={styles.titleAccent}>arrivals</span>
            </h2>
            <p className={styles.lead}>
              Hand-picked, workshop-prepared and ready to drive away.
            </p>
          </div>
          <Link href="/used-cars" className={`${styles.viewAll} mfx-shimmer`}>
            View all stock
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </header>

        {loading ? (
          <ul className={styles.grid} aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={`sk-${i}`} className={`${styles.card} ${styles.skeleton}`}>
                <div className={styles.skeletonMedia} />
                <div className={styles.skeletonBody}>
                  <span className={styles.skeletonLine} />
                  <span className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
                </div>
              </li>
            ))}
          </ul>
        ) : vehicles.length === 0 ? (
          <p className={styles.empty}>Stock will appear here as it arrives at the forecourt.</p>
        ) : (
          <ul className={styles.grid}>
            {vehicles.map((v, i) => {
              const href = buildVehiclePermalink({ slug: v.slug || toSlug(v.title), reg: v.reg }, '/used-cars')
              return (
                <li key={v.id} className={styles.card} data-aos="fade-up" data-aos-delay={i * 80}>
                  <Link href={href} className={styles.cardLink}>
                    <div className={styles.media}>
                      <span className={styles.makeBadge}>{v.make}</span>
                      {v.featured ? <span className={styles.featuredBadge}>Featured</span> : null}
                      <img src={v.image} alt={v.title} loading="lazy" />
                    </div>
                    <div className={styles.body}>
                      <h3 className={styles.cardTitle}>{v.title}</h3>
                      <p className={styles.price}>{formatPrice(v.price)}</p>
                      <ul className={styles.specs}>
                        <li><Fuel size={14} strokeWidth={2} aria-hidden="true" /> {v.fuel}</li>
                        <li><Settings2 size={14} strokeWidth={2} aria-hidden="true" /> {v.transmission}</li>
                        <li><Gauge size={14} strokeWidth={2} aria-hidden="true" /> {v.mileage.toLocaleString()} mi</li>
                      </ul>
                      <span className={styles.cta}>
                        View details
                        <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                      </span>
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
