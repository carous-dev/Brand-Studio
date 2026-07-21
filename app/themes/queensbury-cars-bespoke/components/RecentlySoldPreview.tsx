'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import VehicleCard from './VehicleCard'
import { SkeletonRail } from './Skeleton'
import styles from './RecentlySoldPreview.module.css'

type LoadState = 'loading' | 'ready' | 'empty' | 'error'

export default function RecentlySoldPreview() {
  const brand = useBrand()
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>([])
  const [state, setState] = useState<LoadState>('loading')

  // audit-ignore: data-useeffect-fetch — brand context client-side
  useEffect(() => {
    const ctrl = new AbortController()
    const url = apiUrl(`/recently-sold?brand=${encodeURIComponent(brand?.slug || '')}&limit=10`)
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        const items = Array.isArray(data) ? data : data.items || data.vehicles || []
        const normalized = items.map(normalizeInventoryItem).filter(Boolean) as InventoryVehicle[]
        setVehicles(normalized.slice(0, 10))
        setState(normalized.length > 0 ? 'ready' : 'empty')
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return
        setState('error')
      })
    return () => ctrl.abort()
  }, [brand?.slug])

  if (state === 'empty') return null

  return (
    <section className={`qb-section ${styles.section}`} data-aos="fade-up">
      <div className="qb-container">
        <header className={styles.head}>
          <div>
            <span className="qb-eyebrow">Recently sold</span>
            <h2 className="qb-section-title">Cars that found their next driver.</h2>
            <p className="qb-section-lead">
              Quick proof we move stock — and a reminder that the right car doesn't sit around.
            </p>
          </div>
          <Link href="/recently-sold" className="qb-btn qb-btn--ghost qb-btn--sm">
            See full history
          </Link>
        </header>

        {state === 'loading' && <SkeletonRail count={4} variant="light" />}

        {state === 'ready' && (
          <div className={styles.railWrap} data-aos="fade-up">
            <div className={styles.rail} aria-label="Recently sold vehicles, auto-scrolling">
              {[...vehicles, ...vehicles].map((v, i) => (
                <div
                  key={`${v.id}-${i}`}
                  className={styles.railItem}
                  aria-hidden={i >= vehicles.length ? 'true' : undefined}
                >
                  <VehicleCard vehicle={v as any} variant="sold" showActions={false} />
                </div>
              ))}
            </div>
          </div>
        )}

        {state === 'error' && (
          <p className={styles.errorLine}>Couldn't load recently sold — call us for a current rundown.</p>
        )}
      </div>
    </section>
  )
}
