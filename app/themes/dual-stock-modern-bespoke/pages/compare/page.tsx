'use client'
// audit-ignore-file: tp-use-client-on-page

import Link from 'next/link'
import { useGarage } from '../../context/GarageContext'
import { buildVehicleHref } from '../../lib/vehicle-links'
import styles from './page.module.css'

const COMPARE_FIELDS: Array<{ label: string; key: keyof ReturnType<typeof toRow> }> = [
  { label: 'Price', key: 'price' },
  { label: 'Year', key: 'year' },
  { label: 'Mileage', key: 'mileage' },
  { label: 'Fuel', key: 'fuel' },
  { label: 'Transmission', key: 'transmission' },
  { label: 'Body', key: 'body' },
  { label: 'Make', key: 'make' },
  { label: 'Colour', key: 'color' },
  { label: 'Doors', key: 'doors' },
  { label: 'Location', key: 'location' },
]

function toRow(v: any) {
  return {
    price: v?.price > 0 ? `£${Number(v.price).toLocaleString('en-GB')}` : 'POA',
    year: v?.year || '—',
    mileage: v?.mileage > 0 ? `${Number(v.mileage).toLocaleString('en-GB')} mi` : '—',
    fuel: v?.fuel || '—',
    transmission: v?.transmission || '—',
    body: v?.body || '—',
    make: v?.make || '—',
    color: v?.color || '—',
    doors: v?.doors || '—',
    location: v?.location || '—',
  }
}

export function DualComparePage() {
  const { compare, removeCompare, clearCompare } = useGarage()

  return (
    <main>
      <section className="dual-page-hero dual-page-hero--compare">
        <div className="dual-page-hero__inner">
          <nav className="dual-page-hero__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Compare</span>
          </nav>
          <h1 className="dual-page-hero__title">Compare vehicles</h1>
          <p className="dual-page-hero__lead">
            Side-by-side spec comparison. Add up to 3 vehicles from any inventory card.
          </p>
        </div>
      </section>

      <section className="dual-section">
        <div className="dual-container">
          {compare.length === 0 ? (
            <div className={styles.empty}>
              <h2>Nothing to compare yet</h2>
              <p>Tap the compare icon on any vehicle card to add it here.</p>
              <Link href="/used-cars" className="dual-btn dual-btn--primary">Browse stock</Link>
            </div>
          ) : (
            <>
              <div className={styles.actions}>
                <span className={styles.count}>{compare.length} of 3 vehicles selected</span>
                <button type="button" onClick={clearCompare} className={styles.clearBtn}>Clear all</button>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.compareTable}>
                  <thead>
                    <tr>
                      <th></th>
                      {compare.map((v) => (
                        <th key={v.id}>
                          <div className={styles.colCard}>
                            <div className={styles.colImage} style={{ backgroundImage: `url(${v.image})` }} />
                            <Link href={buildVehicleHref(v.slug || v.id, v as any)} className={styles.colTitle}>{v.title}</Link>
                            <button type="button" onClick={() => removeCompare(v.id)} className={styles.removeBtn}>Remove</button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_FIELDS.map((f) => (
                      <tr key={f.label}>
                        <th scope="row">{f.label}</th>
                        {compare.map((v) => (
                          <td key={v.id + f.label}>{toRow(v)[f.key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default DualComparePage
