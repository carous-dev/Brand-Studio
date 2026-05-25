import Link from 'next/link'
import { ArrowRight, BadgeCheck } from 'lucide-react'
import { apiUrl } from '../../lib/api'
import { normalizeInventoryItem } from '../../lib/inventory'
import { getBrandSlugFromRequest } from '../../lib/brand-slug.server'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value || 0)

const formatMileage = (value: number) =>
  new Intl.NumberFormat('en-GB').format(value || 0)

async function fetchSold(): Promise<any[]> {
  try {
    const brand = await getBrandSlugFromRequest()
    const params = new URLSearchParams()
    params.set('limit', '12')
    params.set('light', '1')
    if (brand) params.set('brand', brand)
    const res = await fetch(apiUrl(`/recently-sold?${params.toString()}`), { cache: 'no-store' })
    if (!res.ok) return []
    const payload = await res.json()
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.items)) return payload.items
    return []
  } catch {
    return []
  }
}

export async function AxisRecentlySoldPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Axis Autos'
  const raw = await fetchSold()
  const items = raw.map((it) => normalizeInventoryItem(it)).filter(Boolean) as any[]

  return (
    <main>
      <section className="axis-page-hero axis-page-hero--recently-sold" aria-label="Recently sold hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">recently.sold</span>
          <h1>Cars that have already gone</h1>
          <p>
            What&apos;s been driving off the {brandName} forecourt lately. These
            are sold — but they show what we deal in. New arrivals every week.
          </p>
        </div>
      </section>

      <section className={`axis-section ${styles.section}`}>
        <div className={styles.inner}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <BadgeCheck size={36} strokeWidth={1.5} />
              <h2>No sold listings yet</h2>
              <p>Recently sold cars will show here as the lot turns over.</p>
              <Link href="/used-cars" className="axis-btn axis-btn--primary">
                See current stock
                <ArrowRight size={18} strokeWidth={2} />
              </Link>
            </div>
          ) : (
            <>
              <header className={styles.header}>
                <span className={styles.eyebrow}>{'> '}lot.turnover</span>
                <h2>{items.length} car{items.length > 1 ? 's' : ''} recently sold</h2>
                <p>Stock moves quickly. If you see something similar in our live inventory, get in touch.</p>
              </header>

              <ul className={styles.list}>
                {items.map((v: any, idx: number) => (
                  <li key={v.id || idx} className={styles.row}>
                    <span className={styles.rowCode}>{String(idx + 1).padStart(2, '0')}</span>
                    <div
                      className={styles.rowImage}
                      style={{ backgroundImage: `url(${v.image})` }}
                      role="img"
                      aria-label={`${v.title} — sold`}
                    >
                      <span className={styles.soldStamp} aria-hidden="true">SOLD</span>
                    </div>
                    <div className={styles.rowBody}>
                      <h3 className={styles.rowTitle}>{v.title}</h3>
                      <p className={styles.rowMeta}>
                        {v.year} · {formatMileage(v.mileage)} mi · {v.fuel}
                      </p>
                    </div>
                    <div className={styles.rowPrice}>
                      <span className={styles.struckPrice}>{formatPrice(v.price)}</span>
                      <span className={styles.soldLabel}>Sold</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className={styles.cta}>
                <p>Looking for something similar?</p>
                <Link href="/used-cars" className="axis-btn axis-btn--primary">
                  Browse live stock
                  <ArrowRight size={18} strokeWidth={2} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default AxisRecentlySoldPage
