'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import VehicleCard from './VehicleCard'
import styles from './FeaturedStock.module.css'

export default function FeaturedStock({
  vehicles,
}: {
  vehicles: any[]
}) {
  const items = (vehicles || []).slice(0, 6)
  if (!items.length) return null

  return (
    <section className={`axis-section ${styles.section}`} aria-label="Latest arrivals">
      <div className="axis-shell">
        <header className={styles.header} data-aos="fade-up">
          <div className={styles.headerText}>
            <span className="axis-eyebrow">Latest arrivals</span>
            <h2 className="axis-section-title">Fresh on the forecourt this week.</h2>
          </div>
          <Link href="/used-cars" className={styles.viewAll}>
            View all stock
            <ArrowRight size={16} strokeWidth={1.8} />
          </Link>
        </header>

        <div className={styles.grid}>
          {items.map((v, i) => (
            <div key={v.id ?? i} data-aos="fade-up" data-aos-delay={String(Math.min(i * 90, 360))}>
              <VehicleCard vehicle={v} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
