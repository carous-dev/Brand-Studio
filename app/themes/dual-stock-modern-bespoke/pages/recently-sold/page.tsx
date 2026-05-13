'use client'
// audit-ignore-file: tp-use-client-on-page

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBrand } from '../../context/BrandClientWrapper'
import { apiUrl } from '../../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../../lib/inventory'
import VehicleCard from '../../components/cards/VehicleCard'
import styles from './page.module.css'

export function DualRecentlySoldPage() {
  const brand = useBrand()
  const slug = brand?.slug || 'default'
  const [items, setItems] = useState<InventoryVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'car' | 'bike'>('all')

  // audit-ignore: data-useeffect-fetch — brand context (useBrand) is client-side; needs ?brand= param resolved at render time
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(apiUrl(`/recently-sold?brand=${slug}&limit=24`), { cache: 'no-store' })
        const data = await res.json()
        const raw: any[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
        const normalised = raw.map(normalizeInventoryItem).filter(Boolean) as InventoryVehicle[]
        if (!cancelled) {
          setItems(normalised)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setItems([])
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  const visible = filter === 'all' ? items : items.filter((v) => v.vehicleClass === filter)

  return (
    <main>
      <section className="dual-page-hero dual-page-hero--recently-sold">
        <div className="dual-page-hero__inner">
          <nav className="dual-page-hero__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Recently sold</span>
          </nav>
          <h1 className="dual-page-hero__title">Recently sold</h1>
          <p className="dual-page-hero__lead">
            Vehicles snapped up by happy buyers. Stock turns over fast — see something similar?
            <Link href="/contact"> Tell us</Link> and we'll source it.
          </p>
          <div className={styles.tabs} role="tablist">
            <button role="tab" aria-selected={filter === 'all'} className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`} onClick={() => setFilter('all')}>All sold</button>
            <button role="tab" aria-selected={filter === 'car'} className={`${styles.tab} ${filter === 'car' ? styles.tabActive : ''}`} onClick={() => setFilter('car')}>Cars</button>
            <button role="tab" aria-selected={filter === 'bike'} className={`${styles.tab} ${filter === 'bike' ? styles.tabActive : ''}`} onClick={() => setFilter('bike')}>Bikes</button>
          </div>
        </div>
      </section>

      <section className="dual-section">
        <div className="dual-container">
          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skel} aria-hidden="true" />)}
            </div>
          ) : visible.length === 0 ? (
            <div className={styles.empty}>
              <h2>Nothing sold here yet</h2>
              <p>Check back soon — we move fast.</p>
              <Link href="/used-cars" className="dual-btn dual-btn--primary">Browse live stock</Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {visible.map((v, idx) => (
                <div key={v.id} data-aos="fade-up" data-aos-delay={Math.min(idx * 60, 360)}>
                  <VehicleCard vehicle={v} compact sold />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default DualRecentlySoldPage
