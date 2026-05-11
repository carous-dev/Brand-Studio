'use client'

import Link from 'next/link'
import { Trash2, GitCompare, ArrowUpRight, Gauge, Fuel, Settings2, Calendar, Tag } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

const formatPrice = (value?: number) => {
  if (typeof value !== 'number' || !isFinite(value)) return '£—'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function CompareIsland() {
  const { compare, removeCompare, clearCompare } = useGarage()

  return (
    <article>
      <section className="shr-page-hero shr-page-hero--compare">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Compare</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            Side-by-side comparison.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Up to three saved vehicles, head to head. Spot the differences before
            you make the call.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.compareSection}`}>
        <div className="shr-container">
          {compare.length === 0 ? (
            <div className={styles.empty}>
              <GitCompare size={48} strokeWidth={1.6} aria-hidden />
              <h2>No vehicles in compare yet.</h2>
              <p>Tap the compare icon on any stock card to add up to three vehicles here.</p>
              <Link href="/used-cars" className="shr-btn-primary">Browse stock</Link>
            </div>
          ) : (
            <>
              <div className={styles.toolbar}>
                <p>{compare.length} vehicle{compare.length === 1 ? '' : 's'} in compare</p>
                <button type="button" className={styles.clearAll} onClick={clearCompare}>
                  <Trash2 size={14} strokeWidth={2.2} aria-hidden />
                  Clear all
                </button>
              </div>

              <div className={styles.grid}>
                {compare.map((v) => {
                  const href = buildVehiclePermalink({ slug: v.slug, reg: v.reg }, '/used-cars')
                  return (
                    <article key={v.id} className={styles.card}>
                      <div
                        className={styles.media}
                        style={v.image ? { backgroundImage: `url(${v.image})` } : undefined}
                        role="img"
                        aria-label={v.title}
                      />
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeCompare(v.id)}
                        aria-label="Remove from compare"
                      >
                        <Trash2 size={16} strokeWidth={2.2} aria-hidden />
                      </button>
                      <div className={styles.body}>
                        <h3 className={styles.title}>{v.title}</h3>
                        <p className={styles.price}>{formatPrice(v.price)}</p>
                        <dl className={styles.specs}>
                          <div className={styles.specRow}>
                            <dt><Calendar size={14} strokeWidth={2} aria-hidden /> Year</dt>
                            <dd>{v.year || '—'}</dd>
                          </div>
                          <div className={styles.specRow}>
                            <dt><Gauge size={14} strokeWidth={2} aria-hidden /> Mileage</dt>
                            <dd>{v.mileage ? `${v.mileage.toLocaleString()} mi` : '—'}</dd>
                          </div>
                          <div className={styles.specRow}>
                            <dt><Fuel size={14} strokeWidth={2} aria-hidden /> Fuel</dt>
                            <dd>{v.fuel || '—'}</dd>
                          </div>
                          <div className={styles.specRow}>
                            <dt><Settings2 size={14} strokeWidth={2} aria-hidden /> Transmission</dt>
                            <dd>{v.transmission || '—'}</dd>
                          </div>
                          <div className={styles.specRow}>
                            <dt><Tag size={14} strokeWidth={2} aria-hidden /> Body</dt>
                            <dd>{v.body || '—'}</dd>
                          </div>
                        </dl>
                        <Link href={href} className={styles.viewCta}>
                          View details
                          <ArrowUpRight size={16} strokeWidth={2.4} />
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </article>
  )
}
