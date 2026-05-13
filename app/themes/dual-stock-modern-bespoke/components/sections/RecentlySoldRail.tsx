'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBrand } from '../../context/BrandClientWrapper'
import { apiUrl } from '../../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../../lib/inventory'
import VehicleCard from '../cards/VehicleCard'
import styles from './RecentlySoldRail.module.css'

export default function RecentlySoldRail() {
  const brand = useBrand()
  const slug = brand?.slug || 'default'
  const [items, setItems] = useState<InventoryVehicle[]>([])
  const [loading, setLoading] = useState(true)

  // audit-ignore: data-useeffect-fetch — brand context client-side, homepage rail island
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(apiUrl(`/recently-sold?brand=${slug}&limit=4`))
        const data = await res.json()
        const raw: any[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
        const normalised = raw.map(normalizeInventoryItem).filter(Boolean) as InventoryVehicle[]
        if (!cancelled) {
          setItems(normalised.slice(0, 4))
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  if (!loading && items.length === 0) return null

  return (
    <section className={`dual-section ${styles.section}`} aria-label="Recently sold">
      <div className="dual-container">
        <header className={styles.head}>
          <div data-aos="fade-up">
            <span className={styles.eyebrow}>Recently sold</span>
            <h2 className={styles.title}>Snapped up this month</h2>
            <p className={styles.lead}>
              Don't see what you're after below? <Link href="/contact">Tell us</Link> what you're looking for —
              we'll source it.
            </p>
          </div>
          <Link href="/recently-sold" className={styles.headCta}>View all sold →</Link>
        </header>

        <div className={styles.grid}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeleton} aria-hidden="true" />
            ))
          ) : items.map((v, idx) => (
            <div key={v.id} data-aos="fade-up" data-aos-delay={idx * 80}>
              <VehicleCard vehicle={v} compact sold />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
