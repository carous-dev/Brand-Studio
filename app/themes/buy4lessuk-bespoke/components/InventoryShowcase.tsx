'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { InventoryVehicle } from '../lib/inventory'
import VehicleCard from './VehicleCard'
import styles from './InventoryShowcase.module.css'

const MAX_TABS = 5
const CARDS_SHOWN = 4

export default function InventoryShowcase({ vehicles }: { vehicles: InventoryVehicle[] }) {
  const [active, setActive] = useState('All')

  const tabs = useMemo(() => {
    const bodies = Array.from(new Set(vehicles.map((v) => v.body).filter(Boolean)))
    return ['All', ...bodies.slice(0, MAX_TABS)]
  }, [vehicles])

  const shown = useMemo(() => {
    const pool = active === 'All' ? vehicles : vehicles.filter((v) => v.body === active)
    return pool.slice(0, CARDS_SHOWN)
  }, [vehicles, active])

  if (vehicles.length === 0) return null

  return (
    <section className={styles.section} aria-label="Shop our inventory">
      <div className={styles.inner}>
        <h2 className={styles.title}>
          <span className={styles.titleDash} aria-hidden />
          <span>Shop Our Inventory</span>
          <span className={styles.titleDash} aria-hidden />
        </h2>

        {tabs.length > 2 ? (
          <div className={styles.tabs} role="tablist" aria-label="Filter by body style">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active === tab}
                className={`${styles.tab} ${active === tab ? styles.tabActive : ''}`}
                onClick={() => setActive(tab)}
              >
                {tab === 'All' ? 'All Vehicles' : tab}
              </button>
            ))}
          </div>
        ) : null}

        <div className={styles.grid}>
          {shown.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>

        <div className={styles.moreRow}>
          <Link href="/used-cars" className={styles.moreBtn}>
            View All Inventory
          </Link>
        </div>
      </div>
    </section>
  )
}
