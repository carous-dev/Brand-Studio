'use client'

import { useMemo, useState } from 'react'
import { cars, carToVehicle } from '../../lib/cars'
import type { InventoryVehicle, InventoryMeta } from '../../lib/inventory'
import { CarCard } from '../../components/CarCard'
import styles from './page.module.css'

const sorts = {
  'price-asc': (a: InventoryVehicle, b: InventoryVehicle) => a.price - b.price,
  'price-desc': (a: InventoryVehicle, b: InventoryVehicle) => b.price - a.price,
  'year-desc': (a: InventoryVehicle, b: InventoryVehicle) => b.year - a.year,
} as const

const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
const GEARBOXES = ['Manual', 'Automatic']

const uniqueValues = (items: InventoryVehicle[], key: keyof InventoryVehicle): string[] =>
  Array.from(
    new Set(
      items
        .map((item) => String(item[key] ?? '').trim())
        .filter(Boolean),
    ),
  ).sort()

export type UsedCarsClientProps = {
  initialVehicles?: InventoryVehicle[]
  initialMeta?: InventoryMeta | null
}

export default function UsedCarsClient({ initialVehicles, initialMeta }: UsedCarsClientProps) {
  // Real inventory from /api/inventory takes precedence. When the API returns
  // nothing (preview brand with no live feed yet, dev without API origin set)
  // fall back to the seed list so the page still demonstrates the layout.
  const allVehicles: InventoryVehicle[] = useMemo(() => {
    if (initialVehicles && initialVehicles.length > 0) return initialVehicles
    return cars.map(carToVehicle)
  }, [initialVehicles])

  const apiMakes = initialMeta?.available?.makes
  const makeOptions = useMemo(
    () => (Array.isArray(apiMakes) && apiMakes.length > 0 ? apiMakes : uniqueValues(allVehicles, 'make')),
    [apiMakes, allVehicles],
  )

  const apiFuels = initialMeta?.available?.fuel_types
  const fuelOptions = useMemo(
    () => (Array.isArray(apiFuels) && apiFuels.length > 0 ? apiFuels : FUELS),
    [apiFuels],
  )

  const [make, setMake] = useState('')
  const [fuel, setFuel] = useState('')
  const [gearbox, setGearbox] = useState('')
  const [sort, setSort] = useState<keyof typeof sorts>('price-asc')

  const results = useMemo(
    () =>
      allVehicles
        .filter(
          (v) =>
            (!make || v.make === make) &&
            (!fuel || v.fuel === fuel) &&
            (!gearbox || v.transmission === gearbox),
        )
        .slice()
        .sort(sorts[sort]),
    [allVehicles, make, fuel, gearbox, sort],
  )

  return (
    <section className={styles.wrap}>
      <div className={styles.filterBar}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="f-make">Make</label>
          <select id="f-make" className="fbm-field" value={make} onChange={(e) => setMake(e.target.value)}>
            <option value="">All makes</option>
            {makeOptions.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="f-fuel">Fuel</label>
          <select id="f-fuel" className="fbm-field" value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option value="">Any fuel</option>
            {fuelOptions.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="f-gearbox">Gearbox</label>
          <select id="f-gearbox" className="fbm-field" value={gearbox} onChange={(e) => setGearbox(e.target.value)}>
            <option value="">Any gearbox</option>
            {GEARBOXES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="f-sort">Sort by</label>
          <select id="f-sort" className="fbm-field" value={sort} onChange={(e) => setSort(e.target.value as keyof typeof sorts)}>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
            <option value="year-desc">Newest first</option>
          </select>
        </div>
        <button
          type="button"
          className={`fbm-btn-ghost ${styles.resetButton}`}
          onClick={() => {
            setMake('')
            setFuel('')
            setGearbox('')
          }}
        >
          Reset
        </button>
      </div>

      <p className={styles.count} aria-live="polite">
        Showing <span className={styles.countNum}>{results.length}</span> of {allVehicles.length} vehicles
      </p>

      {results.length > 0 ? (
        <div className={styles.grid}>
          {results.map((vehicle) => <CarCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No cars match those filters</p>
          <p className={styles.emptyBody}>Try removing a filter, or tell us what you&apos;re after and we&apos;ll source it.</p>
        </div>
      )}
    </section>
  )
}
