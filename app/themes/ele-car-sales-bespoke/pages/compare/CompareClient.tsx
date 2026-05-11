'use client'

import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { useGarage, type SavedVehicle } from '../../context/GarageContext'
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

type Row = {
  key: keyof SavedVehicle
  label: string
  format?: (v: SavedVehicle) => string
}

const ROWS: Row[] = [
  { key: 'price', label: 'Price', format: (v) => fmtPrice(v.price) },
  { key: 'year', label: 'Year', format: (v) => String(v.year || '—') },
  { key: 'mileage', label: 'Mileage', format: (v) => fmtMileage(v.mileage) },
  { key: 'fuel', label: 'Fuel', format: (v) => v.fuel || '—' },
  { key: 'transmission', label: 'Transmission', format: (v) => v.transmission || '—' },
  { key: 'body', label: 'Body', format: (v) => v.body || '—' },
  { key: 'doors', label: 'Doors', format: (v) => String(v.doors || '—') },
  { key: 'color', label: 'Colour', format: (v) => v.color || '—' },
]

export default function CompareClient() {
  const garage = useGarage()
  const vehicles = garage.compare

  if (vehicles.length === 0) {
    return (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>Nothing to compare yet.</h2>
        <p className={styles.emptyBody}>
          Open any vehicle and tap the &quot;Add to compare&quot; button. Bring up to four
          cars here and we&apos;ll line up their specs side-by-side.
        </p>
        <Link href="/used-cars" className={styles.emptyCta}>
          Browse the stock
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className={styles.toolbar}>
        <p className={styles.toolbarCount}>Comparing {vehicles.length}</p>
        <button
          type="button"
          className={styles.toolbarClear}
          onClick={() => garage.clearCompare()}
        >
          <Trash2 size={16} aria-hidden="true" />
          Clear all
        </button>
      </div>

      <div className={styles.tableWrap} role="region" aria-label="Vehicle comparison">
        <table className={styles.table}>
          <caption className={styles.srOnly}>Side-by-side vehicle comparison</caption>
          <thead>
            <tr>
              <th scope="col" className={styles.specCol}>Spec</th>
              {vehicles.map((v: SavedVehicle) => (
                <th key={v.id} scope="col" className={styles.vehicleCol}>
                  <div className={styles.colMedia}>
                    {v.image ? (
                      <img src={v.image} alt={v.title} loading="lazy" />
                    ) : (
                      <div className={styles.colPlaceholder} aria-hidden="true" />
                    )}
                  </div>
                  <Link href={buildVehiclePermalink({ slug: v.slug, reg: v.reg })} className={styles.colTitle}>
                    {v.title}
                  </Link>
                  <button
                    type="button"
                    className={styles.colRemove}
                    aria-label={`Remove ${v.title} from comparison`}
                    onClick={() => garage.removeCompare(v.id)}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key as string}>
                <th scope="row" className={styles.rowLabel}>{row.label}</th>
                {vehicles.map((v: SavedVehicle) => (
                  <td key={v.id + (row.key as string)} className={styles.cell}>
                    {row.format ? row.format(v) : String((v[row.key] ?? '—'))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
