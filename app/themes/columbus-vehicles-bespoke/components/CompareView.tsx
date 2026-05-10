'use client'

import Link from 'next/link'
import { Trash2, X } from 'lucide-react'
import { useGarage } from '../context/GarageContext'
import PageHero from './PageHero'
import styles from './CompareView.module.css'

/**
 * Compare view — full client component (the entire page IS interactive).
 * Lifted out of pages/compare/page.tsx so the page itself can stay a
 * Server Component, dodging the Turbopack 'use client' chunk-item collision
 * with springalls-classic's parallel page.
 */

function fmtPrice(n: number) {
  if (!Number.isFinite(n)) return '—'
  return `£${n.toLocaleString('en-GB')}`
}

function fmtMiles(n: number) {
  if (!Number.isFinite(n) || !n) return '—'
  return `${n.toLocaleString('en-GB')}`
}

const COMPARE_ROWS: Array<{ key: keyof Pick<NonNullable<ReturnType<typeof useGarage>>['compare'][number], 'year' | 'price' | 'mileage' | 'fuel' | 'transmission' | 'body' | 'doors' | 'color' | 'location'>; label: string; format?: (v: any) => string }> = [
  { key: 'year', label: 'Year' },
  { key: 'price', label: 'Price', format: (v) => fmtPrice(Number(v)) },
  { key: 'mileage', label: 'Mileage', format: (v) => fmtMiles(Number(v)) },
  { key: 'fuel', label: 'Fuel' },
  { key: 'transmission', label: 'Gearbox' },
  { key: 'body', label: 'Body' },
  { key: 'doors', label: 'Doors' },
  { key: 'color', label: 'Colour' },
  { key: 'location', label: 'Location' },
]

export default function CompareView() {
  const { compare, removeCompare, clearCompare } = useGarage()

  return (
    <>
      <PageHero
        eyebrow="Side-by-side"
        title={compare.length > 0 ? `Comparing ${compare.length} 4×4${compare.length === 1 ? '' : 's'}` : 'Compare 4×4s side-by-side'}
        lead={compare.length > 0
          ? "Specs and prices laid out next to each other. Add up to 4 vehicles via the inventory page."
          : "Add 4×4s to compare from any inventory or detail page — they'll show up here side-by-side."}
        imageSlot="hero"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          {compare.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nothing to compare yet.</p>
              <Link href="/used-cars" className={styles.cta}>Browse current 4×4 stock</Link>
            </div>
          ) : (
            <>
              <div className={styles.toolbar}>
                <Link href="/used-cars" className={styles.toolbarLink}>← Add more vehicles</Link>
                <button type="button" onClick={() => clearCompare()} className={styles.clearBtn}>
                  <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                  Clear all
                </button>
              </div>

              <div className={styles.tableScroller} role="region" aria-label="Vehicle comparison table" tabIndex={0}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col"><span className="sr-only">Spec</span></th>
                      {compare.map((v) => (
                        <th key={v.id} scope="col" className={styles.headCell}>
                          <button
                            type="button"
                            onClick={() => removeCompare(v.id)}
                            className={styles.removeBtn}
                            aria-label={`Remove ${v.title}`}
                          >
                            <X size={16} strokeWidth={2.4} />
                          </button>
                          <Link href={v.slug ? `/used-cars/${v.slug}` : '/used-cars'} className={styles.headMedia}>
                            {v.image ? <img src={v.image} alt={v.title} loading="lazy" /> : <div className={styles.cardPlaceholder} aria-hidden="true" />}
                          </Link>
                          <Link href={v.slug ? `/used-cars/${v.slug}` : '/used-cars'} className={styles.headTitle}>
                            {v.title}
                          </Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_ROWS.map((row) => (
                      <tr key={row.key as string}>
                        <th scope="row" className={styles.rowHead}>{row.label}</th>
                        {compare.map((v) => {
                          const raw = (v as any)[row.key]
                          const value = row.format ? row.format(raw) : (raw === '' || raw == null ? '—' : String(raw))
                          return <td key={v.id}>{value}</td>
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
