'use client'

import Link from 'next/link'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

function fmtPrice(value: any) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `£${n.toLocaleString('en-GB')}`
}
function fmtMileage(value: any) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `${n.toLocaleString('en-GB')} mi`
}

const ROWS: Array<{ label: string; key: string; fmt?: (v: any) => string }> = [
  { label: 'Price', key: 'price', fmt: fmtPrice },
  { label: 'Mileage', key: 'mileage', fmt: fmtMileage },
  { label: 'Fuel', key: 'fuel_type' },
  { label: 'Transmission', key: 'transmission' },
  { label: 'Body', key: 'body_type' },
  { label: 'Engine', key: 'engine_size' },
  { label: 'BHP', key: 'hp' },
  { label: 'Year', key: 'year' },
]

export default function KainCompareClient() {
  const { compare, removeCompare, clearCompare } = useGarage() as any
  const list: any[] = Array.isArray(compare) ? compare : []

  if (list.length === 0) {
    return (
      <section className={`kain-section ${styles.section}`}>
        <div className={styles.inner}>
          <div className={styles.empty}>
            <h2>No cars compared yet.</h2>
            <p>Add up to four vehicles using the compare button on any vehicle card.</p>
            <Link href="/used-cars" className="kain-btn kain-btn--primary">Browse stock</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`kain-section ${styles.section}`}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <p className="kain-eyebrow">{list.length} of 4 selected</p>
            <h2 className={styles.title}>Compare vehicles</h2>
          </div>
          <button type="button" className="kain-btn kain-btn--ghost-light kain-btn--small" onClick={() => clearCompare()}>
            Clear all
          </button>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table} aria-label="Vehicle comparison">
            <thead>
              <tr>
                <th scope="row" className={styles.rowLabel}>Vehicle</th>
                {list.map((v) => (
                  <th key={v.slug} className={styles.col}>
                    <Link href={buildVehiclePermalink(v)} className={styles.colLink}>
                      <div className={styles.colMedia}>
                        {v.image ? <img src={v.image} alt={v.title} /> : <div className={styles.colMediaPlaceholder} />}
                      </div>
                      <span className={styles.colTitle}>{v.title}</span>
                    </Link>
                    <button type="button" className={styles.colRemove} onClick={() => removeCompare(v.slug)}>Remove</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className={styles.rowLabel}>{row.label}</th>
                  {list.map((v) => (
                    <td key={v.slug} className={styles.cell}>
                      {row.fmt ? row.fmt(v[row.key]) : (v[row.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
