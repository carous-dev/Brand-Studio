import Link from 'next/link'
import { ArrowUpRight, CheckCircle2 } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

function fmtPrice(value: any) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `£${n.toLocaleString('en-GB')}`
}

export function ShowroomRecentlySoldPage({ initialInventory, brand }: ThemePageProps) {
  const items = Array.isArray(initialInventory) ? initialInventory : []
  const brandName = brand?.name || 'this dealership'

  return (
    <article>
      <section className="shr-page-hero shr-page-hero--recently-sold">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Recently Sold</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            A glimpse of what&apos;s gone.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Cars that have recently driven away from {brandName}. Use them as a guide for
            what we typically stock — current inventory updates daily.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.sold}`}>
        <div className="shr-container">
          {items.length === 0 ? (
            <div className={styles.empty} data-aos="fade-up">
              <h2>No sold history to show yet.</h2>
              <p>Recently sold listings appear here as stock retires.</p>
              <Link href="/used-cars" className="shr-btn-primary">See current stock</Link>
            </div>
          ) : (
            <>
              <div className={styles.intro} data-aos="fade-up">
                <p>
                  {items.length} {items.length === 1 ? 'vehicle' : 'vehicles'} retired from the forecourt recently.
                  See something you like? Tell us — we may be able to source the same again.
                </p>
              </div>

              <div className={styles.grid}>
                {items.map((v: any, idx: number) => {
                  const title = [v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle'
                  const img = (v.images && v.images[0]) || v.image || ''
                  return (
                    <article key={idx} className={styles.card} data-aos="fade-up" data-aos-delay={`${(idx % 6) * 60}`}>
                      <div className={styles.mediaWrap}>
                        <div
                          className={styles.media}
                          style={img ? { backgroundImage: `url(${img})` } : undefined}
                          role="img"
                          aria-label={title}
                        />
                        <span className={styles.soldStamp}>
                          <CheckCircle2 size={14} strokeWidth={2.4} aria-hidden />
                          Sold
                        </span>
                      </div>
                      <div className={styles.body}>
                        <h3 className={styles.title}>{title}</h3>
                        <p className={styles.price}>{fmtPrice(v.price)}</p>
                        {v.mileage ? (
                          <p className={styles.meta}>{Number(v.mileage).toLocaleString()} mi · {v.fuel || ''}</p>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          )}

          <div className={styles.cta} data-aos="fade-up">
            <h2 className={styles.ctaTitle}>Source something similar.</h2>
            <p>If a recently-sold car ticked your boxes, tell us — our buying network finds matching stock fast.</p>
            <div className={styles.ctaActions}>
              <Link href="/used-cars" className="shr-btn-primary">Browse current stock</Link>
              <Link href="/contact" className="shr-btn-ghost-light">Ask us to source</Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}

export default ShowroomRecentlySoldPage
