'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBrand } from '../../context/BrandClientWrapper'
import { apiUrl } from '../../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../../lib/inventory'
import VehicleCard from '../cards/VehicleCard'
import styles from './FeaturedStock.module.css'

export default function FeaturedStock() {
  const brand = useBrand()
  const slug = brand?.slug || 'default'
  const [cars, setCars] = useState<InventoryVehicle[]>([])
  const [bikes, setBikes] = useState<InventoryVehicle[]>([])
  const [loading, setLoading] = useState(true)

  // audit-ignore: data-useeffect-fetch — homepage is composed of server shell + client islands; brand context is client-side
  useEffect(() => {
    let cancelled = false
    const fetchStock = async () => {
      try {
        const res = await fetch(apiUrl(`/inventory?brand=${slug}&per_page=24&light=1`))
        const data = await res.json()
        const items: any[] = Array.isArray(data?.items) ? data.items : Array.isArray(data?.vehicles) ? data.vehicles : []
        const normalised = items.map(normalizeInventoryItem).filter(Boolean) as InventoryVehicle[]
        if (cancelled) return
        const sortByPrice = (a: InventoryVehicle, b: InventoryVehicle) => b.price - a.price
        setCars(normalised.filter((v) => v.vehicleClass === 'car').sort(sortByPrice).slice(0, 4))
        setBikes(normalised.filter((v) => v.vehicleClass === 'bike').sort(sortByPrice).slice(0, 4))
        setLoading(false)
      } catch {
        if (!cancelled) {
          setCars([])
          setBikes([])
          setLoading(false)
        }
      }
    }
    fetchStock()
    return () => { cancelled = true }
  }, [slug])

  // Only render a rail for a vehicle type the dealer actually stocks — no
  // placeholder/sample stock. A car-only dealer shows just the cars rail; a
  // bike-only dealer just the bikes rail. If neither exists, hide the section.
  const showCars = cars.length > 0
  const showBikes = bikes.length > 0
  if (!loading && !showCars && !showBikes) return null

  // Which title fits the real mix.
  const heading =
    showCars && showBikes
      ? 'Hot from the showroom — cars and bikes'
      : showBikes
        ? 'Hot from the showroom — bikes'
        : 'Hot from the showroom'

  return (
    <section className="dual-section" aria-label="Featured stock">
      <div className="dual-container">
        <header className={styles.head}>
          <div data-aos="fade-up">
            <span className="dual-eyebrow">Featured stock</span>
            <h2 className={styles.title}>{heading}</h2>
          </div>
          <Link href="/used-cars" className={`dual-btn dual-btn--outline ${styles.headCta}`}>
            Browse all stock
          </Link>
        </header>

        {loading ? (
          <Rail eyebrow="Featured stock" subtitle="Loading the latest arrivals" href="/used-cars" items={[]} loading aos="fade-up" />
        ) : (
          <>
            {showCars && (
              <Rail
                eyebrow="Featured cars"
                subtitle="Top-rated 4-wheel stock"
                href="/used-cars?type=car"
                items={cars}
                loading={false}
                aos="fade-up"
              />
            )}
            {showBikes && (
              <Rail
                eyebrow="Featured bikes"
                subtitle="Motorcycles ready to ride"
                href="/used-cars?type=bike"
                items={bikes}
                loading={false}
                aos="fade-up"
              />
            )}
          </>
        )}
      </div>
    </section>
  )
}

function Rail({
  eyebrow,
  subtitle,
  href,
  items,
  loading,
  aos,
}: {
  eyebrow: string
  subtitle: string
  href: string
  items: InventoryVehicle[]
  loading: boolean
  aos: string
}) {
  return (
    <div className={styles.rail} data-aos={aos}>
      <div className={styles.railHead}>
        <div>
          <span className={styles.railEyebrow}>{eyebrow}</span>
          <p className={styles.railSubtitle}>{subtitle}</p>
        </div>
        <Link href={href} className={styles.railLink}>
          See all {eyebrow.toLowerCase().split(' ').pop()} →
        </Link>
      </div>

      {loading ? (
        <div className={styles.skeletonRow} aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : (
        <div className={styles.row} role="list">
          {items.map((v, idx) => (
            <div key={v.id} className={styles.rowItem} role="listitem" data-aos="fade-up" data-aos-delay={idx * 80}>
              <VehicleCard vehicle={v} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
