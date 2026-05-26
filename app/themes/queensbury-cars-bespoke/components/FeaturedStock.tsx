'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import VehicleCard from './VehicleCard'
import { SkeletonVehicleGrid } from './Skeleton'
import styles from './FeaturedStock.module.css'

type LoadState = 'loading' | 'ready' | 'empty' | 'error'

export default function FeaturedStock() {
  const brand = useBrand()
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>([])
  const [state, setState] = useState<LoadState>('loading')

  // audit-ignore: data-useeffect-fetch — brand context client-side
  useEffect(() => {
    const ctrl = new AbortController()
    const url = apiUrl(`/featured-vehicles?brand=${encodeURIComponent(brand?.slug || '')}&limit=8`)
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        const items = Array.isArray(data) ? data : data.items || data.vehicles || []
        const normalized = items.map(normalizeInventoryItem).filter(Boolean) as InventoryVehicle[]
        setVehicles(normalized.slice(0, 8))
        setState(normalized.length > 0 ? 'ready' : 'empty')
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return
        setState('error')
      })
    return () => ctrl.abort()
  }, [brand?.slug])

  return (
    <section className="qb-section qb-section--gradient">
      <div className="qb-container">
        <header className={styles.head}>
          <div>
            <span className="qb-eyebrow">Featured stock</span>
            <h2 className="qb-section-title">Cars on the floor right now.</h2>
            <p className="qb-section-lead">
              Curated by our buyers — looked after, finance-ready, and waiting for a test drive.
            </p>
          </div>
          <Link href="/used-cars" className="qb-btn qb-btn--ghost qb-btn--sm">
            View full stock
          </Link>
        </header>

        {state === 'loading' && <SkeletonVehicleGrid count={8} variant="light" />}

        {state === 'ready' && (
          <div className={styles.grid}>
            {vehicles.map((v, i) => (
              <div key={v.id} data-aos="fade-up" data-aos-delay={i * 60}>
                <VehicleCard vehicle={v as any} />
              </div>
            ))}
          </div>
        )}

        {state === 'empty' && (
          <div className={styles.empty}>
            <h3>New stock landing soon.</h3>
            <p>We refresh the floor every few days. Sign up for first-look alerts.</p>
            <Link href="/contact" className="qb-btn qb-btn--primary">
              Get stock alerts
            </Link>
          </div>
        )}

        {state === 'error' && (
          <div className={styles.empty}>
            <h3>Couldn't load the stock list.</h3>
            <p>Refresh the page or call us directly — we'll walk you through what's in.</p>
            <Link href="/contact" className="qb-btn qb-btn--ghost">
              Contact us
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
