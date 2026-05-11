'use client'

// audit-ignore-file: data-useeffect-fetch — brand context is client-side; home is a server shell composed of client islands.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import { normalizeInventoryItem } from '../lib/inventory'
import VehicleCard from './VehicleCard'
import styles from './FeaturedStock.module.css'

export default function FeaturedStock() {
  const brand = useBrand()
  const brandSlug = brand?.slug || ''
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // audit-ignore: data-useeffect-fetch — brand context client-side, this is
  // a client island composed into a Server page. Fetch is brand-scoped.
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
        if (!res.ok) throw new Error('Failed')
        const payload = await res.json()
        if (aborted) return
        const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : []
        const normalized = items.map((it: any) => normalizeInventoryItem(it)).filter(Boolean)
        setVehicles(normalized)
      } catch {
        if (!aborted) setVehicles([])
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
    <section className={`shr-section ${styles.section}`}>
      <div className="shr-container">
        <div className={styles.head} data-aos="fade-up">
          <div>
            <span className="shr-eyebrow">Latest Arrivals</span>
            <h2 className={styles.title}>Fresh stock at Showroom Shine Cars.</h2>
          </div>
          <Link href="/used-cars" className={styles.headCta}>
            View all stock
            <ArrowUpRight size={16} strokeWidth={2.4} />
          </Link>
        </div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} aria-hidden />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Latest stock is being prepared. Call us on the number above for upcoming arrivals.</p>
            <Link href="/contact" className="shr-btn-primary">Contact us</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {vehicles.map((v, i) => (
              <div key={v.id} data-aos="fade-up" data-aos-delay={`${i * 60}`}>
                <VehicleCard vehicle={v} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
