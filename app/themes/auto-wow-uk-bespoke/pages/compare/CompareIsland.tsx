'use client'

import Link from 'next/link'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })
const miles = new Intl.NumberFormat('en-GB')

const ROWS: Array<{ key: 'price' | 'year' | 'mileage' | 'fuel' | 'transmission' | 'body' | 'doors' | 'color' | 'location'; label: string }> = [
  { key: 'price', label: 'Price' },
  { key: 'year', label: 'Year' },
  { key: 'mileage', label: 'Mileage' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'body', label: 'Body type' },
  { key: 'doors', label: 'Doors' },
  { key: 'color', label: 'Colour' },
  { key: 'location', label: 'Location' },
]

function formatCell(key: typeof ROWS[number]['key'], value: number | string | undefined): string {
  if (value === undefined || value === null || value === '') return '—'
  if (key === 'price') return gbp.format(Number(value) || 0)
  if (key === 'mileage') return Number(value) ? `${miles.format(Number(value))} mi` : '—'
  return String(value)
}

export default function CompareIsland() {
  const garage = useGarage()

  if (garage.compare.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            <h2 className={styles.emptyHeading}>No cars to compare.</h2>
            <p>Tap the compare icon on any vehicle in our stock to add it here.</p>
            <Link href="/used-cars" className={styles.emptyCta}>
              Browse stock
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.head} data-aos="fade-up">
          <h2 className={styles.heading}>
            Comparing {garage.compare.length} {garage.compare.length === 1 ? 'car' : 'cars'}.
          </h2>
          <button type="button" className={styles.clearBtn} onClick={() => garage.clearCompare()}>
            Clear all
          </button>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.thLabel}><span className="visually-hidden">Spec</span></th>
                {garage.compare.map((v) => (
                  <th key={v.id} scope="col" className={styles.thCar}>
                    <Link href={buildVehiclePermalink(v)} className={styles.carLink}>
                      <div className={styles.carMedia}>
                        {v.image ? (
                          <img src={v.image} alt="" width="320" height="200" loading="lazy" />
                        ) : (
                          <div className={styles.carImgFallback} aria-hidden="true" />
                        )}
                      </div>
                      <span className={styles.carTitle}>{v.title}</span>
                    </Link>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => garage.removeCompare(v.id)}
                      aria-label={`Remove ${v.title} from compare`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className={styles.rowLabel}>{row.label}</th>
                  {garage.compare.map((v) => (
                    <td key={v.id} className={styles.cell}>
                      {formatCell(row.key, (v as any)[row.key])}
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
