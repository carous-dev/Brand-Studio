'use client'

import Link from 'next/link'
import { ArrowRight, GitCompare, X } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

const formatPrice = (value?: number) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)
    : '—'

const formatMileage = (value?: number) =>
  typeof value === 'number'
    ? `${new Intl.NumberFormat('en-GB').format(value)} mi`
    : '—'

const ATTRS: Array<{ key: string; label: string; format?: (v: any) => string }> = [
  { key: 'price', label: 'Price', format: formatPrice },
  { key: 'year', label: 'Year' },
  { key: 'mileage', label: 'Mileage', format: formatMileage },
  { key: 'fuel', label: 'Fuel' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'body', label: 'Body' },
  { key: 'color', label: 'Colour' },
  { key: 'doors', label: 'Doors' },
]

export default function CompareClient() {
  const garage = useGarage()
  const items = garage?.compare || []

  return (
    <>
      <section className="axis-page-hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">Compare</span>
          <h1 className="axis-page-hero-title">Side-by-side comparison.</h1>
          <p className="axis-page-hero-lead">
            Up to 4 cars compared at once. Add cars from any stock page using the compare button.
          </p>
        </div>
      </section>

      <section className="axis-section">
        <div className="axis-shell">
          {items.length === 0 ? (
            <div className={styles.empty} data-aos="fade-up">
              <GitCompare size={32} strokeWidth={1.4} aria-hidden="true" />
              <h2 className={styles.emptyTitle}>Nothing to compare yet.</h2>
              <p className={styles.emptyBody}>
                Add cars to your compare list from any stock page — we'll line them up here.
              </p>
              <Link href="/used-cars" className="axis-btn axis-btn--primary">
                Browse the stock
                <ArrowRight size={16} strokeWidth={1.8} />
              </Link>
            </div>
          ) : (
            <div className={styles.tableWrap} data-aos="fade-up">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col" className={styles.attrCol}>&nbsp;</th>
                    {items.map((v: any) => (
                      <th key={v.id} scope="col" className={styles.carCol}>
                        <div className={styles.carHeader}>
                          {v.image ? (
                            <div className={styles.carImage} style={{ backgroundImage: `url("${v.image}")` }} role="presentation" />
                          ) : (
                            <div className={styles.carImagePlaceholder} aria-hidden="true">No image</div>
                          )}
                          <Link href={buildVehiclePermalink({ slug: v.slug, reg: v.reg })} className={styles.carTitle}>
                            {v.title}
                          </Link>
                          <button
                            type="button"
                            className={styles.removeBtn}
                            aria-label={`Remove ${v.title}`}
                            onClick={() => garage?.removeCompare?.(v.id)}
                          >
                            <X size={14} strokeWidth={1.8} />
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ATTRS.map((attr) => (
                    <tr key={attr.key}>
                      <th scope="row" className={styles.attrLabel}>{attr.label}</th>
                      {items.map((v: any) => (
                        <td key={v.id} className={styles.attrValue}>
                          {attr.format ? attr.format(v[attr.key]) : (v[attr.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className={styles.attrLabel}>&nbsp;</th>
                    {items.map((v: any) => (
                      <td key={v.id} className={styles.attrValue}>
                        <Link
                          href={buildVehiclePermalink({ slug: v.slug, reg: v.reg })}
                          className={`axis-btn axis-btn--ghost ${styles.viewBtn}`}
                        >
                          View
                          <ArrowRight size={14} strokeWidth={1.8} />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
