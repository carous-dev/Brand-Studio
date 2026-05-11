'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  GitCompare,
  Heart,
  Search,
  Settings2,
  Sparkles,
  Truck,
  X,
} from 'lucide-react'
import styles from './page.module.css'
import { useGarage, type SavedVehicle } from '../../context/GarageContext'
import { useBrand } from '../../context/BrandClientWrapper'
import { type InventoryMeta, type InventoryVehicle } from '../../lib/inventory'
import { buildVehiclePermalink } from '../../lib/vehicle-links'

type Vehicle = InventoryVehicle

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

const toSlug = (value: string) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const toSavedVehicle = (v: Vehicle): SavedVehicle => ({
  id: v.id,
  title: v.title,
  slug: v.slug,
  reg: v.reg,
  year: v.year,
  price: v.price,
  mileage: v.mileage,
  fuel: v.fuel,
  transmission: v.transmission,
  body: v.body,
  make: v.make,
  color: v.color,
  doors: v.doors,
  location: v.location,
  image: v.image,
})

function MakeCarousel({
  make,
  vehicles,
  garage,
}: {
  make: string
  vehicles: Vehicle[]
  garage: ReturnType<typeof useGarage>
}) {
  const scrollerRef = useRef<HTMLUListElement | null>(null)

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    const cardWidth = el.firstElementChild instanceof HTMLElement ? el.firstElementChild.offsetWidth + 20 : 320
    el.scrollBy({ left: direction * cardWidth * 2, behavior: 'smooth' })
  }

  return (
    <section className={styles.makeSection} aria-labelledby={`make-${toSlug(make)}`}>
      <header className={styles.makeHeader}>
        <div className={styles.makeTitleRow}>
          <span className={styles.makeBadge} aria-hidden="true">
            <Truck size={14} strokeWidth={2.4} />
          </span>
          <h2 id={`make-${toSlug(make)}`} className={styles.makeTitle}>{make}</h2>
          <span className={styles.makeCount}>{vehicles.length} van{vehicles.length === 1 ? '' : 's'}</span>
        </div>
        <div className={styles.makeControls} role="group" aria-label={`Scroll ${make} carousel`}>
          <button type="button" className={styles.scrollBtn} onClick={() => scroll(-1)} aria-label={`Previous ${make}`}>
            <ChevronLeft size={18} strokeWidth={2.2} />
          </button>
          <button type="button" className={styles.scrollBtn} onClick={() => scroll(1)} aria-label={`Next ${make}`}>
            <ChevronRight size={18} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <ul className={styles.carousel} ref={scrollerRef}>
        {vehicles.map((v) => {
          const wishlisted = garage.isWishlisted(v.id)
          const compared = garage.isCompared(v.id)
          const href = buildVehiclePermalink({ slug: v.slug || toSlug(v.title), reg: v.reg }, '/used-cars')
          return (
            <li key={v.id} className={styles.card}>
              <Link href={href} className={styles.cardLink}>
                <div className={styles.media}>
                  <img src={v.image} alt={v.title} loading="lazy" />
                  {v.featured ? (
                    <span className={styles.featuredBadge}>
                      <Sparkles size={12} strokeWidth={2.4} aria-hidden="true" /> Featured
                    </span>
                  ) : null}
                  <span className={styles.yearBadge}>{v.year || '—'}</span>
                </div>
                <div className={styles.body}>
                  <h3 className={styles.cardTitle}>{v.title}</h3>
                  <p className={styles.price}>{formatPrice(v.price)}</p>
                  <ul className={styles.specs}>
                    <li><Fuel size={13} strokeWidth={2} aria-hidden="true" /> {v.fuel}</li>
                    <li><Settings2 size={13} strokeWidth={2} aria-hidden="true" /> {v.transmission}</li>
                    <li><Gauge size={13} strokeWidth={2} aria-hidden="true" /> {v.mileage.toLocaleString()} mi</li>
                  </ul>
                </div>
              </Link>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  data-active={compared}
                  aria-pressed={compared}
                  aria-label={compared ? `Remove ${v.title} from compare` : `Add ${v.title} to compare`}
                  onClick={() => garage.toggleCompare(toSavedVehicle(v))}
                >
                  <GitCompare size={14} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  data-active={wishlisted}
                  aria-pressed={wishlisted}
                  aria-label={wishlisted ? `Remove ${v.title} from wishlist` : `Save ${v.title} to wishlist`}
                  onClick={() => garage.toggleWishlist(toSavedVehicle(v))}
                >
                  <Heart size={14} strokeWidth={2} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
                <Link href={href} className={styles.viewBtn}>
                  View
                  <ArrowUpRight size={12} strokeWidth={2.4} aria-hidden="true" />
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function UsedCarsClient({
  initialVehicles,
  initialMeta,
}: {
  initialVehicles: Vehicle[]
  initialMeta?: InventoryMeta | null
}) {
  const garage = useGarage()
  const brand = useBrand()
  const brandSlug = (brand?.slug || '').trim()

  const [vehicles] = useState<Vehicle[]>(initialVehicles)
  const loading = false
  const [search, setSearch] = useState('')
  const [bodyFilter, setBodyFilter] = useState<string>('All')
  const [sort, setSort] = useState<string>('newest')
  void brandSlug
  void initialMeta

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return vehicles
      .filter((v) => (q ? v.title.toLowerCase().includes(q) || v.make.toLowerCase().includes(q) : true))
      .filter((v) => (bodyFilter === 'All' ? true : v.body === bodyFilter))
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price
        if (sort === 'price-desc') return b.price - a.price
        if (sort === 'mileage') return a.mileage - b.mileage
        return b.year - a.year
      })
  }, [vehicles, search, bodyFilter, sort])

  const groupedByMake = useMemo(() => {
    const groups: Record<string, Vehicle[]> = {}
    for (const v of filtered) {
      const k = v.make || 'Other'
      ;(groups[k] = groups[k] || []).push(v)
    }
    // Sort makes by count descending
    return Object.entries(groups).sort(([, a], [, b]) => b.length - a.length)
  }, [filtered])

  const availableBodies = useMemo(() => {
    const set = new Set<string>()
    for (const v of vehicles) if (v.body) set.add(v.body)
    return Array.from(set).sort()
  }, [vehicles])

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={`${styles.heroGlow} mfx-glow-orbit`} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow} data-aos="fade-down">Stock list</p>
          <h1 className={styles.heroTitle} data-aos="fade-up" data-aos-delay="80">
            Vans by <span className={styles.heroTitleAccent}>make.</span>
          </h1>
          <p className={styles.heroLead} data-aos="fade-up" data-aos-delay="160">
            {loading ? 'Loading current stock…' : `${vehicles.length} vehicle${vehicles.length === 1 ? '' : 's'} ready to go, grouped by manufacturer.`}
          </p>
        </div>
      </section>

      <section className={styles.toolbarWrap} aria-label="Filter stock">
        <div className={styles.toolbar}>
          <div className={styles.searchInput}>
            <Search size={16} strokeWidth={2} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search make, model or keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search stock"
            />
          </div>
          <div className={styles.chipRow} role="tablist" aria-label="Body type">
            <button
              type="button"
              className={`${styles.chip} ${bodyFilter === 'All' ? styles.chipActive : ''}`}
              role="tab"
              aria-selected={bodyFilter === 'All'}
              onClick={() => setBodyFilter('All')}
            >
              All
            </button>
            {availableBodies.map((b) => (
              <button
                key={b}
                type="button"
                className={`${styles.chip} ${bodyFilter === b ? styles.chipActive : ''}`}
                role="tab"
                aria-selected={bodyFilter === b}
                onClick={() => setBodyFilter(b)}
              >
                {b}
              </button>
            ))}
          </div>
          <label className={styles.sortLabel}>
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
              <option value="newest">Newest first</option>
              <option value="price-asc">Price low → high</option>
              <option value="price-desc">Price high → low</option>
              <option value="mileage">Lowest mileage</option>
            </select>
          </label>
        </div>
      </section>

      <div className={styles.results}>
        {loading ? (
          <div className={styles.skeletonBlock} role="status" aria-live="polite">
            Loading stock…
          </div>
        ) : groupedByMake.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true"><X size={32} strokeWidth={1.8} /></span>
            <h2>No vans match those filters</h2>
            <p>Try clearing your search or broadening the body type.</p>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => { setSearch(''); setBodyFilter('All'); setSort('newest') }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          groupedByMake.map(([make, list]) => (
            <MakeCarousel key={make} make={make} vehicles={list} garage={garage} />
          ))
        )}
      </div>
    </main>
  )
}
