'use client'

import Link from 'next/link'
import { useGarage } from '../../context/GarageContext'
import styles from './CompareIsland.module.css'

function formatPrice(n: number | undefined) {
  if (!n || !Number.isFinite(n)) return 'POA'
  return `£${Math.round(n).toLocaleString('en-GB')}`
}
function formatMileage(n: number | undefined) {
  if (!n || !Number.isFinite(n)) return '—'
  return `${n.toLocaleString('en-GB')} mi`
}

const SPEC_ROWS: Array<{ key: keyof CompareRow; label: string; format?: (v: any) => string }> = [
  { key: 'price', label: 'Price', format: (v) => formatPrice(v) },
  { key: 'year', label: 'Year' },
  { key: 'mileage', label: 'Mileage', format: (v) => formatMileage(v) },
  { key: 'fuel', label: 'Fuel' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'body', label: 'Body' },
  { key: 'doors', label: 'Doors' },
  { key: 'color', label: 'Colour' },
]

type CompareRow = {
  price: number
  year: number
  mileage: number
  fuel: string
  transmission: string
  body: string
  doors: number
  color: string
}

export default function CompareIsland() {
  const garage = useGarage()
  const list = garage.compare.slice(0, 3)

  if (list.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Nothing to compare yet.</h2>
        <p>Pick a few cars from the stock list and they'll appear here side-by-side.</p>
        <Link href="/used-cars" className="qb-btn qb-btn--gradient">
          Browse stock
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.actionsRow}>
        <p className={styles.summary}>
          Comparing <strong>{list.length}</strong> of 3 vehicles.
        </p>
        <button type="button" className="qb-btn qb-btn--ghost qb-btn--sm" onClick={() => garage.clearCompare()}>
          Clear all
        </button>
      </div>

      <div className={styles.scrollFrame}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.specHead}>Spec</th>
              {list.map((v) => (
                <th key={v.id} className={styles.vehicleHead}>
                  <div className={styles.cardHead}>
                    {v.image ? (
                      <img src={v.image} alt={v.title} className={styles.thumb} />
                    ) : (
                      <div className={styles.thumbPlaceholder} aria-hidden="true" />
                    )}
                    <span className={styles.cardTitle}>{v.title}</span>
                    <div className={styles.cardActions}>
                      <Link
                        href={v.slug ? `/used-cars/${v.slug}` : `/used-cars/${v.id}`}
                        className="qb-btn qb-btn--gradient qb-btn--sm"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => garage.removeCompare(v.id)}
                        aria-label={`Remove ${v.title} from compare`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPEC_ROWS.map((row) => (
              <tr key={row.key}>
                <th scope="row" className={styles.rowLabel}>
                  {row.label}
                </th>
                {list.map((v) => {
                  const raw = (v as any)[row.key]
                  const value = row.format ? row.format(raw) : raw || '—'
                  return (
                    <td key={v.id} className={styles.cell}>
                      {value}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
