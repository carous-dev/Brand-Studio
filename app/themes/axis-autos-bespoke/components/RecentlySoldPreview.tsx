'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import VehicleCard from './VehicleCard'
import styles from './RecentlySoldPreview.module.css'

export default function RecentlySoldPreview({
  vehicles,
}: {
  vehicles: any[]
}) {
  const items = (vehicles || []).slice(0, 4)
  if (!items.length) return null

  return (
    <section className={`axis-section ${styles.section}`} aria-label="Recently sold" data-aos="fade-up">
      <div className="axis-shell">
        <header className={styles.header}>
          <div>
            <span className="axis-eyebrow">Recently sold</span>
            <h2 className="axis-section-title">A snapshot of cars that found new homes.</h2>
          </div>
          <Link href="/recently-sold" className={styles.link}>
            See full archive
            <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </header>

        <div className={styles.grid}>
          {items.map((v, i) => (
            <div key={v.id ?? i}>
              <VehicleCard vehicle={v} sold />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
