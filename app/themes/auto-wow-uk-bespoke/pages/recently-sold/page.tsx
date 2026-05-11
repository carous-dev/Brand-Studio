import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })

export function AutoRecentlySoldPage({ initialInventory, brand }: ThemePageProps) {
  const items = Array.isArray(initialInventory) ? initialInventory : []
  const brandName = brand?.name || 'AUTOWOW UK'

  return (
    <>
      <PageHero
        eyebrow="Recently sold"
        title="Cars that have driven away."
        lead={`Looking for something similar? ${brandName} can usually source another to spec — get in touch and we'll find one.`}
        imageSlot="recentlySold"
      />

      <section className={styles.section} data-aos="fade-up">
        <div className={styles.inner} data-aos="fade-up" data-aos-delay="80">
          {items.length === 0 ? (
            <div className={styles.empty}>
              <p>Sold vehicle history will appear here as listings retire from the forecourt.</p>
              <Link href="/used-cars" className={styles.emptyCta}>
                See current stock
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <ul className={styles.grid}>
              {items.map((v: any, idx: number) => {
                const title = [v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle'
                const img = (v.images && v.images[0]) || v.image || ''
                const price = Number(v.price)
                return (
                  <li key={idx} className={styles.card} data-aos="fade-up" data-aos-delay={String((idx % 4) * 80)}>
                    <div className={styles.cardMedia}>
                      {img ? (
                        <img src={img} alt="" width="640" height="420" loading="lazy" className={styles.cardImg} />
                      ) : (
                        <div className={styles.cardImgFallback} aria-hidden="true" />
                      )}
                      <span className={styles.soldBanner} aria-hidden="true">SOLD</span>
                    </div>
                    <div className={styles.cardBody}>
                      <h2 className={styles.cardTitle}>{title}</h2>
                      <p className={styles.cardPrice}>{Number.isFinite(price) && price > 0 ? gbp.format(price) : '—'}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {items.length > 0 ? (
            <div className={styles.tail}>
              <Link href="/used-cars" className={styles.tailCta}>
                See current stock
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}

export default AutoRecentlySoldPage
