'use client'

import Link from 'next/link'
import { GitCompare, X } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import PageShell from '../../components/PageShell'
import styles from './page.module.css'

const gbp = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

const ROWS: Array<{ label: string; key: 'year' | 'mileage' | 'fuel' | 'transmission' | 'body' | 'color' | 'doors' | 'location' }> = [
  { label: 'Year', key: 'year' },
  { label: 'Mileage', key: 'mileage' },
  { label: 'Fuel', key: 'fuel' },
  { label: 'Transmission', key: 'transmission' },
  { label: 'Body', key: 'body' },
  { label: 'Colour', key: 'color' },
  { label: 'Doors', key: 'doors' },
  { label: 'Location', key: 'location' },
]

export default function CompareClient() {
  const { compare, removeCompare, clearCompare } = useGarage()

  if (compare.length === 0) {
    return (
      <PageShell>
        <div className={styles.empty}>
          <GitCompare size={40} strokeWidth={1.5} aria-hidden />
          <h2>Nothing to compare yet</h2>
          <p>Add cars to the compare list from the showroom to see them side by side here.</p>
          <Link href="/used-cars" className={styles.ctaPrimary}>Browse stock</Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className={styles.actionsHead}>
        <button type="button" onClick={() => clearCompare()} className={styles.clear}>
          <X size={14} strokeWidth={2.2} aria-hidden /> Clear all
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th aria-hidden />
              {compare.map((v) => (
                <th key={v.id} scope="col">
                  <div className={styles.headerCell}>
                    <Link href={buildVehiclePermalink(v)}>
                      {v.image ? <img src={v.image} alt={v.title} loading="lazy" /> : null}
                      <span className={styles.headerTitle}>{v.title}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeCompare(v.id)}
                      aria-label={`Remove ${v.title}`}
                      className={styles.removeHead}
                    >
                      <X size={14} strokeWidth={2.2} aria-hidden />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Price</th>
              {compare.map((v) => (
                <td key={v.id}>{v.price > 0 ? gbp(v.price) : 'POA'}</td>
              ))}
            </tr>
            {ROWS.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                {compare.map((v) => {
                  const value: any = v[row.key]
                  if (row.key === 'mileage' && typeof value === 'number' && value > 0) {
                    return <td key={v.id}>{value.toLocaleString('en-GB')} mi</td>
                  }
                  if (!value) return <td key={v.id}>—</td>
                  return <td key={v.id}>{value}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
