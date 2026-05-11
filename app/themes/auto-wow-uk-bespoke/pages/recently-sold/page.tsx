import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const formatPrice = (v: any) => {
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return null
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
}

const formatMileage = (v: any) => {
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return null
  return new Intl.NumberFormat('en-GB').format(n)
}

export function AutoRecentlySoldPage({ initialInventory }: ThemePageProps) {
  const items: any[] = Array.isArray(initialInventory) ? initialInventory : []

  return (
    <>
      <section className="auto-page-hero auto-page-hero--recently-sold">
        <div className="auto-page-hero-inner">
          <p className="auto-page-hero-crumb">Recently sold</p>
          <h1>Cars that found their new homes.</h1>
          <p>
            A snapshot of recent sales. Each car here was prepared, sold, and delivered through our
            forecourt &mdash; live stock is just a click away.
          </p>
        </div>
      </section>

      <section className={`auto-section ${styles.section}`}>
        <div className="auto-container">
          {items.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Sold archive is being built.</p>
              <p className={styles.emptyLead}>
                Once vehicles cycle through, their sold cards will appear here. In the meantime,
                browse what&rsquo;s currently available.
              </p>
              <Link href="/used-cars" className="auto-btn auto-btn--primary">
                See current stock
              </Link>
            </div>
          ) : (
            <ul className={styles.archive}>
              {items.map((v: any, i: number) => {
                const title = [v.year, v.make, v.model].filter(Boolean).join(' ') || v.title || 'Vehicle'
                const img = (v.images && v.images[0]) || v.image || ''
                const price = formatPrice(v.price)
                const mileage = formatMileage(v.mileage)
                return (
                  <li key={v.id || `${title}-${i}`} className={styles.row}>
                    <span className={styles.rowNum} aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className={styles.rowMedia}>
                      {img ? <img src={img} alt={title} loading="lazy" /> : <div className={styles.rowPlaceholder} />}
                      <span className="auto-sold-banner" aria-hidden="true">SOLD</span>
                    </div>

                    <div className={styles.rowBody}>
                      <p className={styles.rowTitle}>{title}</p>
                      <ul className={styles.rowMeta}>
                        {v.year && <li>{v.year}</li>}
                        {mileage && <li>{mileage} mi</li>}
                        {v.fuel && <li>{v.fuel}</li>}
                        {v.transmission && <li>{v.transmission}</li>}
                      </ul>
                    </div>

                    <div className={styles.rowAside}>
                      {price && <p className={styles.rowPrice}>{price}</p>}
                      <p className={styles.rowStatus}>Sold</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <aside className={styles.helper}>
            <p className={styles.helperLead}>
              Looking for something similar? <Link href="/used-cars">Browse current stock</Link>
              {' '}or <Link href="/contact">tell us what you need</Link>.
            </p>
          </aside>
        </div>
      </section>
    </>
  )
}

export default AutoRecentlySoldPage
