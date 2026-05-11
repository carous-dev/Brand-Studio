import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

function fmtPrice(value: any) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `£${n.toLocaleString('en-GB')}`
}

export function EleRecentlySoldPage({ initialInventory, brand }: ThemePageProps) {
  const brandName = brand?.name || 'ELE Car Sales'
  const items = Array.isArray(initialInventory) ? initialInventory : []

  return (
    <main>
      <PageHero
        eyebrow="Recently sold"
        title="A glimpse of cars that found new homes."
        lead={`If you missed one of these, ${brandName} can often source something similar. Get in touch with what you're after.`}
        imageSlot="recentlySold"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          {items.length === 0 ? (
            <div className={styles.empty} role="status">
              <p>Sold vehicle history will appear here as listings are retired.</p>
              <Link href="/used-cars" className={styles.cta}>See current stock</Link>
            </div>
          ) : (
            <>
              <ul className={styles.grid} role="list">
                {items.map((v: any, idx: number) => {
                  const title = [v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle'
                  const img = (v.images && v.images[0]) || v.image || ''
                  return (
                    <li key={idx} className={styles.card} data-aos="fade-up" data-aos-delay={String(50 * (idx % 3))}>
                      <div className={styles.media}>
                        {img ? (
                          <img src={img} alt={title} loading="lazy" />
                        ) : (
                          <div className={styles.mediaPlaceholder} aria-hidden="true" />
                        )}
                        <span className={styles.soldBadge}>Sold</span>
                      </div>
                      <div className={styles.body}>
                        <h3 className={styles.cardTitle}>{title}</h3>
                        <p className={styles.cardPrice}>{fmtPrice(v.price)}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className={styles.foot}>
                <Link href="/used-cars" className={styles.cta}>See current stock</Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default EleRecentlySoldPage
