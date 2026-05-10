import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

/**
 * Columbus Vehicles — Recently sold (rugged archetype, full page)
 *
 * Designed fresh per the rugged design language. Receives `initialInventory`
 * from page-runtime.server.tsx (which fetches /api/recently-sold). Each
 * card carries the diagonal SOLD banner — same signature element as the
 * homepage RecentlySoldPreview, scaled to a full grid.
 */
function fmtPrice(value: any) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `£${n.toLocaleString('en-GB')}`
}

export function ColumbusRecentlySoldPage({ initialInventory, brand }: ThemePageProps) {
  const items = Array.isArray(initialInventory) ? initialInventory : []
  const dealerName = brand?.name || 'Columbus Vehicles'

  return (
    <main>
      <PageHero
        eyebrow="Just gone"
        title="Recently sold"
        lead={`A glimpse of 4×4s that have recently found new homes from ${dealerName}. Stock moves fast — see something you like in current inventory before it does.`}
        imageSlot="recently-sold"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Sold vehicle history will appear here as listings are retired.</p>
              <Link href="/used-cars" className={styles.cta}>
                See current 4×4 stock
                <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <>
              <ul className={styles.grid} role="list">
                {items.map((v: any, idx: number) => {
                  const title = [v.year, v.make, v.model, v.derivative].filter(Boolean).join(' ') || 'Vehicle'
                  const img = (v.images && v.images[0]) || v.image || ''
                  return (
                    <li key={v.id || idx} className={styles.card}>
                      <div className={styles.cardMedia}>
                        {img ? (
                          <img src={img} alt={title} loading="lazy" />
                        ) : (
                          <div className={styles.cardPlaceholder} aria-hidden="true" />
                        )}
                        <span className={styles.soldBanner} aria-label="Sold">SOLD</span>
                      </div>
                      <div className={styles.cardBody}>
                        <h2 className={styles.cardTitle}>{title}</h2>
                        <p className={styles.cardPrice}>{fmtPrice(v.price)}</p>
                        {v.mileage ? (
                          <p className={styles.cardMeta}>
                            {Number(v.mileage).toLocaleString('en-GB')} miles
                          </p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className={styles.footer}>
                <Link href="/used-cars" className={styles.cta}>
                  See current 4×4 stock
                  <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default ColumbusRecentlySoldPage
