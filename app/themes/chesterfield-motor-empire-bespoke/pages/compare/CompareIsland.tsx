'use client'

import Link from 'next/link'
import { GitCompare, Trash2, ArrowRight } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

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

export default function CompareIsland() {
  const { compare, removeCompare, clearCompare } = useGarage()

  if (!compare.length) {
    return (
      <section className={styles.section}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <GitCompare size={36} strokeWidth={1.6} />
          </span>
          <h2 className={styles.emptyTitle}>Nothing to compare yet</h2>
          <p className={styles.emptyBody}>
            Open any vehicle and tap the compare icon to add it here. You can compare up to 4 at once.
          </p>
          <Link href="/used-cars" className={styles.emptyCta}>
            Browse stock
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.count}>{compare.length} {compare.length === 1 ? 'vehicle' : 'vehicles'} in compare</p>
          <button type="button" className={styles.clearBtn} onClick={clearCompare}>
            <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
            Clear all
          </button>
        </header>

        <div className={styles.tableWrap} role="region" aria-label="Vehicle comparison">
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.thLabel}>Spec</th>
                {compare.map((v) => (
                  <th key={v.id} scope="col" className={styles.th}>
                    <div
                      className={styles.thMedia}
                      style={{ backgroundImage: `url(${v.image})` }}
                      aria-label={v.title}
                      role="img"
                    />
                    <Link
                      href={buildVehiclePermalink({ slug: v.slug, reg: v.reg })}
                      className={styles.thTitle}
                    >
                      {v.title}
                    </Link>
                    <button
                      type="button"
                      className={styles.thRemove}
                      onClick={() => removeCompare(v.id)}
                      aria-label={`Remove ${v.title} from compare`}
                    >
                      <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className={styles.rowLabel}>{row.label}</th>
                  {compare.map((v) => {
                    const value = v[row.key]
                    let display: string
                    if (row.key === 'price') display = formatPrice(Number(value))
                    else if (row.key === 'mileage') display = `${Number(value).toLocaleString()} mi`
                    else display = String(value)
                    return (
                      <td key={`${v.id}-${row.key}`} className={styles.cell}>
                        {display}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr>
                <th scope="row" className={styles.rowLabel}>Action</th>
                {compare.map((v) => (
                  <td key={`${v.id}-action`} className={styles.cell}>
                    <Link
                      href={buildVehiclePermalink({ slug: v.slug, reg: v.reg })}
                      className={styles.cellCta}
                    >
                      View
                      <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
