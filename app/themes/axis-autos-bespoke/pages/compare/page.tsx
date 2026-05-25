'use client'
// audit-ignore-file: tp-use-client-on-page — compare page is a pure client surface; useGarage state can't run on the server.

import Link from 'next/link'
import { ArrowRight, Trash2, Fuel, Gauge, Settings2, Calendar, GitCompare } from 'lucide-react'
import { useGarage, type SavedVehicle } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value || 0)

const toSlug = (value: string) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function AxisComparePage() {
  const { compare: compareList, toggleCompare } = useGarage()

  return (
    <main>
      <section className="axis-page-hero axis-page-hero--about" aria-label="Compare hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">compare.vehicles</span>
          <h1>Side by side</h1>
          <p>Saved a few cars to compare? They&apos;ll line up here, spec for spec.</p>
        </div>
      </section>

      <section className={`axis-section ${styles.section}`}>
        <div className={styles.inner}>
          {compareList.length === 0 ? (
            <div className={styles.empty}>
              <GitCompare size={44} strokeWidth={1.5} />
              <h2>Nothing to compare yet</h2>
              <p>Tap the compare icon on any vehicle card and they&apos;ll appear here.</p>
              <Link href="/used-cars" className="axis-btn axis-btn--primary">
                Browse stock
                <ArrowRight size={18} strokeWidth={2} />
              </Link>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <div className={styles.headerRow}>
                <div className={styles.headerCell}>
                  <span className={styles.headerLabel}>{compareList.length} car{compareList.length > 1 ? 's' : ''} compared</span>
                </div>
                {compareList.map((v: SavedVehicle) => (
                  <div key={`th-${v.id}`} className={styles.headerCell}>
                    <div className={styles.cardImage} style={{ backgroundImage: `url(${v.image})` }} role="img" aria-label={v.title} />
                    <h3>{v.title}</h3>
                    <span className={styles.price}>{formatPrice(v.price || 0)}</span>
                    <button type="button" className={styles.removeBtn} onClick={() => toggleCompare(v)} aria-label={`Remove ${v.title} from comparison`}>
                      <Trash2 size={14} strokeWidth={2} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {[
                { label: 'Year',        icon: Calendar,   key: 'year',         format: (v: any) => v || '—' },
                { label: 'Mileage',     icon: Gauge,      key: 'mileage',      format: (v: any) => v ? `${v.toLocaleString()} mi` : '—' },
                { label: 'Fuel',        icon: Fuel,       key: 'fuel',         format: (v: any) => v || '—' },
                { label: 'Transmission',icon: Settings2,  key: 'transmission', format: (v: any) => v || '—' },
                { label: 'Body',        icon: GitCompare, key: 'body',         format: (v: any) => v || '—' },
                { label: 'Colour',      icon: GitCompare, key: 'color',        format: (v: any) => v || '—' },
              ].map((row, idx) => (
                <div key={row.label} className={`${styles.row} ${idx % 2 === 0 ? styles.rowAlt : ''}`}>
                  <div className={styles.rowLabel}>
                    <row.icon size={14} strokeWidth={1.8} />
                    {row.label}
                  </div>
                  {compareList.map((v: SavedVehicle) => (
                    <div key={`cell-${row.label}-${v.id}`} className={styles.rowCell}>
                      {row.format((v as any)[row.key])}
                    </div>
                  ))}
                </div>
              ))}

              <div className={styles.actionsRow}>
                <div className={styles.rowLabel}>Action</div>
                {compareList.map((v: SavedVehicle) => (
                  <div key={`cta-${v.id}`} className={styles.rowCell}>
                    <Link href={buildVehiclePermalink({ slug: v.slug || toSlug(v.title), reg: v.reg }, '/used-cars')} className="axis-btn axis-btn--primary">
                      View details
                      <ArrowRight size={16} strokeWidth={2} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
