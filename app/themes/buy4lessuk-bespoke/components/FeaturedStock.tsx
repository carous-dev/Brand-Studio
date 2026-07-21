'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { InventoryVehicle } from '../lib/inventory'
import VehicleCard from './VehicleCard'
import styles from './FeaturedStock.module.css'

export default function FeaturedStock({ vehicles }: { vehicles: InventoryVehicle[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null)

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8 * (dir === 'left' ? -1 : 1)
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  if (vehicles.length === 0) return null

  return (
    <section className={styles.section} aria-label="Featured stock" data-aos="fade-up">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <span className={styles.eyebrow}>Featured stock</span>
            <h2 className={styles.title}>Latest arrivals from our showroom</h2>
          </div>
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="Scroll stock left"
              onClick={() => scroll('left')}
            >
              <ChevronLeft size={20} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="Scroll stock right"
              onClick={() => scroll('right')}
            >
              <ChevronRight size={20} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div className={styles.track} ref={trackRef}>
          {vehicles.map((v) => (
            <div key={v.id} className={styles.cell}>
              <VehicleCard vehicle={v} />
            </div>
          ))}
        </div>

        <div className={styles.viewAllRow}>
          <Link href="/used-cars" className={styles.viewAll}>View all stock</Link>
        </div>
      </div>
    </section>
  )
}
