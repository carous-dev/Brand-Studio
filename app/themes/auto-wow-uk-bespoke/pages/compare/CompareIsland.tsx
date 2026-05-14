'use client'

import Link from 'next/link'
import { X, ChevronRight, CarFront } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0)

const formatMileage = (n: number) =>
  new Intl.NumberFormat('en-GB').format(n || 0)

export default function CompareIsland() {
  const { compare, toggleCompare } = useGarage()
  const list = Array.isArray(compare) ? compare.slice(0, 4) : []

  if (list.length === 0) {
    return (
      <section className={`auto-section ${styles.section}`}>
        <div className={`auto-container ${styles.emptyState}`}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <CarFront size={32} />
          </span>
          <h2 className={styles.emptyTitle}>No cars in your compare tray yet.</h2>
          <p className={styles.emptyLead}>
            Browse stock and tap the compare icon on a card to add it. You can stack up to four.
          </p>
          <Link href="/used-cars" className="auto-btn auto-btn--primary">
            Browse stock
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className={`auto-section ${styles.section}`}>
      <div className="auto-container">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="row" className={styles.specCol}>Vehicle</th>
                {list.map((v) => (
                  <th key={v.id} scope="col" className={styles.vehicleCol}>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      aria-label={`Remove ${v.title} from compare`}
                      onClick={() => toggleCompare(v)}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                    <div className={styles.vehicleMedia}>
                      {v.image ? <img src={v.image} alt={v.title} /> : <div className={styles.placeholder} />}
                    </div>
                    <p className={styles.vehicleTitle}>{v.title}</p>
                    <p className={styles.vehiclePrice}>{formatPrice(v.price)}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Year</th>
                {list.map((v) => <td key={v.id}>{v.year || '—'}</td>)}
              </tr>
              <tr>
                <th scope="row">Mileage</th>
                {list.map((v) => <td key={v.id}>{formatMileage(v.mileage)} mi</td>)}
              </tr>
              <tr>
                <th scope="row">Fuel</th>
                {list.map((v) => <td key={v.id}>{v.fuel || '—'}</td>)}
              </tr>
              <tr>
                <th scope="row">Transmission</th>
                {list.map((v) => <td key={v.id}>{v.transmission || '—'}</td>)}
              </tr>
              <tr>
                <th scope="row">Body</th>
                {list.map((v) => <td key={v.id}>{v.body || '—'}</td>)}
              </tr>
              <tr>
                <th scope="row">Doors</th>
                {list.map((v) => <td key={v.id}>{v.doors || '—'}</td>)}
              </tr>
              <tr>
                <th scope="row">Colour</th>
                {list.map((v) => <td key={v.id}>{v.color || '—'}</td>)}
              </tr>
              <tr>
                <th scope="row"><span className="sr-only">View</span></th>
                {list.map((v) => (
                  <td key={v.id}>
                    <Link href={buildVehiclePermalink({ slug: v.slug || v.id, reg: v.reg }, '/used-cars')} className="auto-cta-link">
                      View details
                      <ChevronRight size={14} aria-hidden="true" />
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
