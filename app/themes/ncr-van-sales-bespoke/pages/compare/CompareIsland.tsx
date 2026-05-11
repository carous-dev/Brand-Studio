'use client'

import Link from 'next/link'
import { Trash2, ExternalLink, GitCompare } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

const toSlug = (value: string) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function CompareIsland() {
  const { compare, removeCompare, clearCompare } = useGarage()

  if (compare.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true"><GitCompare size={36} strokeWidth={1.8} /></span>
          <h2>Nothing to compare yet</h2>
          <p>Tap the compare icon on any vehicle card to add it to your shortlist.</p>
          <Link href="/used-cars" className={`${styles.cta} mfx-shimmer`}>Browse stock</Link>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <h2>Comparing {compare.length} van{compare.length === 1 ? '' : 's'}</h2>
          <button type="button" className={styles.clearBtn} onClick={clearCompare}>
            <Trash2 size={14} strokeWidth={2} aria-hidden="true" /> Clear all
          </button>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="row">&nbsp;</th>
                {compare.map((v) => (
                  <th key={v.id} scope="col" className={styles.colHead}>
                    <div className={styles.thumb} style={{ backgroundImage: `url(${v.image})` }} aria-label={v.title} role="img" />
                    <strong>{v.title}</strong>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Price</th>
                {compare.map((v) => <td key={v.id} className={styles.price}>{formatPrice(v.price)}</td>)}
              </tr>
              <tr>
                <th scope="row">Year</th>
                {compare.map((v) => <td key={v.id}>{v.year || '—'}</td>)}
              </tr>
              <tr>
                <th scope="row">Mileage</th>
                {compare.map((v) => <td key={v.id}>{v.mileage.toLocaleString()} mi</td>)}
              </tr>
              <tr>
                <th scope="row">Fuel</th>
                {compare.map((v) => <td key={v.id}>{v.fuel}</td>)}
              </tr>
              <tr>
                <th scope="row">Transmission</th>
                {compare.map((v) => <td key={v.id}>{v.transmission}</td>)}
              </tr>
              <tr>
                <th scope="row">Body</th>
                {compare.map((v) => <td key={v.id}>{v.body}</td>)}
              </tr>
              <tr>
                <th scope="row">Colour</th>
                {compare.map((v) => <td key={v.id}>{v.color}</td>)}
              </tr>
              <tr>
                <th scope="row">Doors</th>
                {compare.map((v) => <td key={v.id}>{v.doors || '—'}</td>)}
              </tr>
              <tr>
                <th scope="row">Location</th>
                {compare.map((v) => <td key={v.id}>{v.location}</td>)}
              </tr>
              <tr>
                <th scope="row">&nbsp;</th>
                {compare.map((v) => (
                  <td key={v.id}>
                    <div className={styles.actionRow}>
                      <Link
                        href={buildVehiclePermalink({ slug: v.slug || toSlug(v.title), reg: v.reg }, '/used-cars')}
                        className={styles.viewBtn}
                      >
                        View <ExternalLink size={12} strokeWidth={2.4} aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeCompare(v.id)}
                        aria-label={`Remove ${v.title} from comparison`}
                      >
                        <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                      </button>
                    </div>
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
