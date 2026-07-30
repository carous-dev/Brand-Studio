'use client'

import Link from 'next/link'
import { useBrand } from '../../context/BrandClientWrapper'
import { useGarage } from '../../context/GarageContext'
import { resolveText } from '../../lib/brand-text'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import { optimizeImageUrl } from '@/app/lib/imageOptimize'
import styles from './page.module.css'

/**
 * CompareClient — the side-by-side comparison table (design-language §7:
 * /compare on `bg`, wide container; spec rows use ledger hairlines). Reads the
 * per-brand garage store via `useGarage()`. Each column is a saved car; each
 * row is a spec, separated by the theme's signature hairline rules. Empty state
 * is a warm invitation back to the showroom. Every string routes through
 * `resolveText`.
 */

function fmtPrice(value: unknown): string {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return '—'
  return `£${n.toLocaleString('en-GB')}`
}
function fmtMileage(value: unknown): string {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return '—'
  return `${n.toLocaleString('en-GB')} mi`
}
function fmtText(value: unknown): string {
  const s = String(value ?? '').trim()
  return s.length > 0 ? s : '—'
}

const ROWS: Array<{ labelKey: string; key: string; fmt: (v: unknown) => string }> = [
  { labelKey: 'compare.row_price', key: 'price', fmt: fmtPrice },
  { labelKey: 'compare.row_mileage', key: 'mileage', fmt: fmtMileage },
  { labelKey: 'compare.row_year', key: 'year', fmt: fmtText },
  { labelKey: 'compare.row_fuel', key: 'fuel', fmt: fmtText },
  { labelKey: 'compare.row_transmission', key: 'transmission', fmt: fmtText },
  { labelKey: 'compare.row_body', key: 'body', fmt: fmtText },
]

export default function CompareClient() {
  const brand = useBrand()
  const { compare, removeCompare, clearCompare } = useGarage()
  const list = Array.isArray(compare) ? compare : []

  const removeLabel = resolveText(brand, 'garage.remove')
  const clearLabel = resolveText(brand, 'garage.clear')
  const browseLabel = resolveText(brand, 'garage.browse')

  if (list.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{resolveText(brand, 'garage.compare_empty_title')}</p>
            <p className={styles.emptyBody}>{resolveText(brand, 'garage.compare_empty_body')}</p>
            <Link href="/used-cars" className={styles.emptyLink}>
              {browseLabel}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.count}>
            <span className={styles.countNumeral}>{list.length}</span> {resolveText(brand, 'garage.compared_count')}
          </p>
          <button type="button" className={styles.clear} onClick={() => clearCompare()}>
            {clearLabel}
          </button>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table} aria-label="Vehicle comparison">
            <thead>
              <tr>
                <th scope="row" className={styles.rowLabel} />
                {list.map((v) => {
                  const href = buildVehiclePermalink({ slug: v.slug, reg: v.reg }, '/used-cars')
                  const img = v.image ? optimizeImageUrl(v.image, { width: 640 }) : ''
                  return (
                    <th key={v.id} className={styles.col} scope="col">
                      <Link href={href} className={styles.colLink}>
                        <span
                          className={styles.colMedia}
                          role="img"
                          aria-label={v.title}
                          style={img ? { backgroundImage: `url("${img}")` } : undefined}
                        />
                        <span className={styles.colTitle}>{v.title}</span>
                      </Link>
                      <button
                        type="button"
                        className={styles.colRemove}
                        onClick={() => removeCompare(v.id)}
                        aria-label={`${removeLabel}: ${v.title}`}
                      >
                        {removeLabel}
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className={styles.rowLabel}>
                    {resolveText(brand, row.labelKey)}
                  </th>
                  {list.map((v) => (
                    <td key={v.id} className={styles.cell}>
                      {row.fmt((v as any)[row.key])}
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
