'use client'

import { useMemo, useState } from 'react'
import { cars, makes, type Car } from '../../lib/cars'
import { CarCard } from '../../components/CarCard'
import styles from './page.module.css'

const sorts = {
  'price-asc': (a: Car, b: Car) => a.price - b.price,
  'price-desc': (a: Car, b: Car) => b.price - a.price,
  'year-desc': (a: Car, b: Car) => b.year - a.year,
} as const

export default function UsedCarsClient() {
  const [make, setMake] = useState('')
  const [fuel, setFuel] = useState('')
  const [gearbox, setGearbox] = useState('')
  const [sort, setSort] = useState<keyof typeof sorts>('price-asc')

  const results = useMemo(
    () =>
      cars
        .filter(
          (c) =>
            (!make || c.make === make) &&
            (!fuel || c.fuel === fuel) &&
            (!gearbox || c.gearbox === gearbox),
        )
        .sort(sorts[sort]),
    [make, fuel, gearbox, sort],
  )

  return (
    <section className={styles.wrap}>
      <div className={styles.filterBar}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="f-make">Make</label>
          <select id="f-make" className="fbm-field" value={make} onChange={(e) => setMake(e.target.value)}>
            <option value="">All makes</option>
            {makes.map((m) => <option key={m.name}>{m.name}</option>)}
          </select>
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="f-fuel">Fuel</label>
          <select id="f-fuel" className="fbm-field" value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option value="">Any fuel</option>
            {['Petrol', 'Diesel', 'Hybrid'].map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="f-gearbox">Gearbox</label>
          <select id="f-gearbox" className="fbm-field" value={gearbox} onChange={(e) => setGearbox(e.target.value)}>
            <option value="">Any gearbox</option>
            {['Manual', 'Automatic'].map((g) => <option key={g}>{g}</option>)}
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
        Showing <span className={styles.countNum}>{results.length}</span> of {cars.length} vehicles
      </p>

      {results.length > 0 ? (
        <div className={styles.grid}>
          {results.map((car) => <CarCard key={car.id} car={car} />)}
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
