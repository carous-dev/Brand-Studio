'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBrand } from '../../context/BrandClientWrapper'
import { apiUrl } from '../../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../../lib/inventory'
import VehicleCard from '../cards/VehicleCard'
import styles from './FeaturedStock.module.css'

// Sample bikes shown when the API returns no bike inventory — lets reviewers
// see how the bike rail renders before the operator uploads real bike stock.
// Marked with `id` starting `sample-bike-` so the card layout is identical
// to real inventory; the VehicleCard renders them as compact cards normally.
const SAMPLE_BIKES: InventoryVehicle[] = [
  {
    id: 'sample-bike-1',
    slug: 'ducati-panigale-v4-2022',
    title: '2022 Ducati Panigale V4 S',
    year: 2022,
    make: 'Ducati',
    body: 'Sport',
    fuel: 'Petrol',
    transmission: '6-speed',
    color: 'Red',
    doors: 0,
    mileage: 4200,
    price: 18995,
    location: 'Wakefield',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&h=675&fit=crop',
    vehicleClass: 'bike',
    engineSize: '1103cc',
    enginePower: '214 bhp',
    featured: true,
  },
  {
    id: 'sample-bike-2',
    slug: 'bmw-r1250gs-2023',
    title: '2023 BMW R 1250 GS Adventure',
    year: 2023,
    make: 'BMW',
    body: 'Adventure',
    fuel: 'Petrol',
    transmission: '6-speed',
    color: 'Light White',
    doors: 0,
    mileage: 2800,
    price: 14495,
    location: 'Wakefield',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=900&h=675&fit=crop',
    vehicleClass: 'bike',
    engineSize: '1254cc',
    enginePower: '136 bhp',
  },
  {
    id: 'sample-bike-3',
    slug: 'yamaha-mt09-2021',
    title: '2021 Yamaha MT-09 SP',
    year: 2021,
    make: 'Yamaha',
    body: 'Naked',
    fuel: 'Petrol',
    transmission: '6-speed',
    color: 'Icon Performance',
    doors: 0,
    mileage: 6100,
    price: 8495,
    location: 'Wakefield',
    image: 'https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=900&h=675&fit=crop',
    vehicleClass: 'bike',
    engineSize: '889cc',
    enginePower: '117 bhp',
  },
  {
    id: 'sample-bike-4',
    slug: 'harley-iron-883-2020',
    title: '2020 Harley-Davidson Iron 883',
    year: 2020,
    make: 'Harley-Davidson',
    body: 'Cruiser',
    fuel: 'Petrol',
    transmission: '5-speed',
    color: 'Vivid Black',
    doors: 0,
    mileage: 8700,
    price: 6995,
    location: 'Wakefield',
    image: 'https://images.unsplash.com/photo-1635073908681-b4dfb9d5ed8a?w=900&h=675&fit=crop',
    vehicleClass: 'bike',
    engineSize: '883cc',
    enginePower: '50 bhp',
  },
  {
    id: 'sample-bike-5',
    slug: 'kawasaki-ninja-650-2022',
    title: '2022 Kawasaki Ninja 650',
    year: 2022,
    make: 'Kawasaki',
    body: 'Sport',
    fuel: 'Petrol',
    transmission: '6-speed',
    color: 'Lime Green',
    doors: 0,
    mileage: 3400,
    price: 6295,
    location: 'Wakefield',
    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=900&h=675&fit=crop',
    vehicleClass: 'bike',
    engineSize: '649cc',
    enginePower: '67 bhp',
  },
  {
    id: 'sample-bike-6',
    slug: 'triumph-speed-twin-1200-2021',
    title: '2021 Triumph Speed Twin 1200',
    year: 2021,
    make: 'Triumph',
    body: 'Modern Classic',
    fuel: 'Petrol',
    transmission: '6-speed',
    color: 'Storm Grey',
    doors: 0,
    mileage: 5200,
    price: 9495,
    location: 'Wakefield',
    image: 'https://images.unsplash.com/photo-1591637306269-44ff5f9b40c8?w=900&h=675&fit=crop',
    vehicleClass: 'bike',
    engineSize: '1200cc',
    enginePower: '99 bhp',
  },
]

export default function FeaturedStock() {
  const brand = useBrand()
  const slug = brand?.slug || 'default'
  const [cars, setCars] = useState<InventoryVehicle[]>([])
  const [bikes, setBikes] = useState<InventoryVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [bikesAreSamples, setBikesAreSamples] = useState(false)

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
        const realCars = normalised.filter((v) => v.vehicleClass === 'car').sort(sortByPrice).slice(0, 4)
        const realBikes = normalised.filter((v) => v.vehicleClass === 'bike').sort(sortByPrice).slice(0, 4)
        setCars(realCars)
        if (realBikes.length > 0) {
          setBikes(realBikes)
          setBikesAreSamples(false)
        } else {
          setBikes(SAMPLE_BIKES.slice(0, 4))
          setBikesAreSamples(true)
        }
        setLoading(false)
      } catch {
        if (!cancelled) {
          setCars([])
          setBikes(SAMPLE_BIKES.slice(0, 4))
          setBikesAreSamples(true)
          setLoading(false)
        }
      }
    }
    fetchStock()
    return () => { cancelled = true }
  }, [slug])

  return (
    <section className="dual-section" aria-label="Featured stock">
      <div className="dual-container">
        <header className={styles.head}>
          <div data-aos="fade-up">
            <span className="dual-eyebrow">Featured stock</span>
            <h2 className={styles.title}>Hot from the showroom — cars and bikes</h2>
          </div>
          <Link href="/used-cars" className={`dual-btn dual-btn--outline ${styles.headCta}`}>
            Browse all stock
          </Link>
        </header>

        <Rail
          eyebrow="Featured cars"
          subtitle="Top-rated 4-wheel stock"
          href="/used-cars?type=car"
          items={cars}
          loading={loading}
          aos="fade-up"
        />
        <Rail
          eyebrow="Featured bikes"
          subtitle="Motorcycles ready to ride"
          href="/used-cars?type=bike"
          items={bikes}
          loading={loading}
          sampleBadge={bikesAreSamples}
          aos="fade-up"
        />
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
  sampleBadge,
}: {
  eyebrow: string
  subtitle: string
  href: string
  items: InventoryVehicle[]
  loading: boolean
  aos: string
  sampleBadge?: boolean
}) {
  return (
    <div className={styles.rail} data-aos={aos}>
      <div className={styles.railHead}>
        <div>
          <span className={styles.railEyebrow}>{eyebrow}</span>
          {sampleBadge && <span className={styles.sampleTag}>Preview stock</span>}
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
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          No {eyebrow.toLowerCase()} in stock right now — check back soon or
          <Link href={href}> see the full directory →</Link>
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
