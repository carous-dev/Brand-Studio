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

export function NcrRecentlySoldPage({ initialInventory, brand }: ThemePageProps) {
  const items = Array.isArray(initialInventory) ? initialInventory : []
  const brandName = brand?.name || 'NCR Van Sales Ltd'

  return (
    <>
      <PageHero
        eyebrow="Sold history"
        title="Recently sold."
        lead={`A snapshot of vans that have recently left ${brandName}'s forecourt. Stock turns over fast — get in touch if you want to be first to hear about new arrivals.`}
        imageSlot="recentlySold"
        pills={['Stock turns fast', 'New arrivals weekly']}
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          {items.length === 0 ? (
            <div className={styles.empty} data-aos="fade-up">
              <p>Sold-vehicle history will appear here as listings are retired.</p>
              <Link href="/used-cars" className={`${styles.cta} mfx-shimmer`}>See current stock</Link>
            </div>
          ) : (
            <>
              <ul className={styles.grid}>
                {items.map((v: any, idx: number) => {
                  const title = [v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle'
                  const img = (v.images && v.images[0]) || v.image || ''
                  return (
                    <li key={idx} className={styles.card} data-aos="flip-up" data-aos-delay={(idx % 6) * 80}>
                      <div className={styles.media}>
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt={title} loading="lazy" />
                        ) : (
                          <div className={styles.placeholder} aria-hidden="true" />
                        )}
                        <span className={styles.soldBanner} aria-label="Sold">SOLD</span>
                      </div>
                      <div className={styles.body}>
                        <h2 className={styles.title}>{title}</h2>
                        <p className={styles.price}>{fmtPrice(v.price)}</p>
                        <p className={styles.meta}>
                          {v.mileage ? `${Number(v.mileage).toLocaleString('en-GB')} mi · ` : ''}
                          {v.fuel || ''}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className={styles.ctaRow} data-aos="fade-up">
                <Link href="/used-cars" className={`${styles.cta} mfx-shimmer`}>
                  See current stock
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}

export default NcrRecentlySoldPage
