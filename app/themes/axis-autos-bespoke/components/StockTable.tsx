'use client'

import Link from 'next/link'
import { ArrowRight, Fuel, Gauge, Settings2 } from 'lucide-react'
import styles from './StockTable.module.css'
import { useGarage, type SavedVehicle } from '../context/GarageContext'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'

const toSlug = (value: string) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value || 0)

const formatMileage = (value: number) =>
  new Intl.NumberFormat('en-GB').format(value || 0)

function toSaved(v: InventoryVehicle): SavedVehicle {
  return {
    id: v.id, title: v.title, slug: v.slug, reg: v.reg, year: v.year, price: v.price,
    mileage: v.mileage, fuel: v.fuel, transmission: v.transmission, body: v.body,
    make: v.make, color: v.color, doors: v.doors, location: v.location, image: v.image,
  }
}

/**
 * StockTable — the signature inventory-as-data-row section for industrial.
 * Workshop-floor inventory log: image-left, dense rows, monospace specs.
 * Each row links to the vehicle detail page.
 */
export default function StockTable({ vehicles }: { vehicles?: any[] }) {
  const list = (vehicles || [])
    .map((v) => normalizeInventoryItem(v))
    .filter(Boolean)
    .slice(0, 6) as InventoryVehicle[]

  return (
    <section className={`axis-section ${styles.section}`} aria-label="Today's stock">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div data-aos="fade-up">
            <span className={styles.eyebrow}>{'> '}stock.log</span>
            <h2 className={styles.title}>Today on the floor</h2>
            <p className={styles.lead}>
              Every car prepared, inspected and listed at one honest price. No
              hidden &ldquo;admin&rdquo; fees, no last-minute markup.
            </p>
          </div>
          <Link href="/used-cars" className={`axis-cta-link ${styles.headerCta}`} data-aos="fade-left">
            View full stock
          </Link>
        </header>

        {list.length === 0 ? (
          <div className={styles.empty}>
            <p>New stock arriving — check back shortly or call the showroom.</p>
            <Link href="/used-cars" className="axis-cta-link">See live inventory</Link>
          </div>
        ) : (
          <ul className={styles.rows}>
            {list.map((v, idx) => {
              const saved = toSaved(v)
              const href = buildVehiclePermalink({ slug: v.slug || toSlug(v.title), reg: v.reg }, '/used-cars')
              return (
                <li key={v.id} className={styles.row} data-aos="fade-up" data-aos-delay={idx * 50}>
                  <Link href={href} className={styles.rowLink} aria-label={`View ${v.title}`}>
                    <span className={styles.srOnly}>View details</span>
                  </Link>
                  <span className={styles.rowCode} aria-hidden="true">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div
                    className={styles.rowImage}
                    style={{ backgroundImage: `url(${v.image})` }}
                    role="img"
                    aria-label={v.title}
                  />
                  <div className={styles.rowBody}>
                    <h3 className={styles.rowTitle}>{v.title}</h3>
                    <div className={styles.rowSpecs}>
                      <span><Gauge size={13} strokeWidth={1.8} />{formatMileage(v.mileage)} mi</span>
                      <span><Fuel size={13} strokeWidth={1.8} />{v.fuel}</span>
                      <span><Settings2 size={13} strokeWidth={1.8} />{v.transmission}</span>
                      <span className={styles.rowYear}>{v.year || '—'}</span>
                    </div>
                  </div>
                  <div className={styles.rowPrice}>
                    <span className={styles.priceFigure}>{formatPrice(v.price)}</span>
                    <span className={styles.priceLabel}>Drive away</span>
                  </div>
                  <span className={styles.rowArrow} aria-hidden="true">
                    <ArrowRight size={18} strokeWidth={2} />
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
