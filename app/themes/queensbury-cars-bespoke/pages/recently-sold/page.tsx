import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import VehicleCard from '../../components/VehicleCard'
import styles from './page.module.css'

function fmtPrice(value: any) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `£${n.toLocaleString('en-GB')}`
}

function normalizeSoldItem(v: any) {
  const title = [v.year, v.make, v.model].filter(Boolean).join(' ') || v.title || 'Vehicle'
  const img = (v.images && v.images[0]) || v.image || ''
  return {
    id: String(v.id ?? v.vin ?? title),
    title,
    slug: v.slug,
    price: Number(v.price) || 0,
    year: Number(v.year) || 0,
    mileage: Number(v.mileage) || 0,
    fuel: v.fuel || v.fuel_type || '',
    transmission: v.transmission || v.transmission_type || '',
    body: v.body || v.body_type || '',
    make: v.make || '',
    color: v.color || v.colour || '',
    doors: Number(v.doors) || 4,
    image: img,
    availability: 'sold' as const,
  }
}

export function QueensburyRecentlySoldPage({ initialInventory, brand }: ThemePageProps) {
  const items = Array.isArray(initialInventory) ? initialInventory : []
  const brandName = brand?.name || 'Queensbury Cars'

  return (
    <>
      <section className="qb-page-hero qb-page-hero--recently-sold" data-aos="fade-up">
        <div className="qb-page-hero__inner">
          <span className="qb-page-hero__eyebrow">Sold history</span>
          <h1 className="qb-page-hero__title">Cars that found their next driver.</h1>
          <p className="qb-page-hero__lead">
            A glimpse of recently retired stock. Proof we move cars — and a reminder that the right one doesn't
            sit around for long.
          </p>
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-container">
          {items.length === 0 ? (
            <div className={styles.empty}>
              <h2>No sold history yet.</h2>
              <p>
                As cars leave the floor with new owners, you'll see them here. In the meantime, browse what's in
                right now.
              </p>
              <Link href="/used-cars" className="qb-btn qb-btn--gradient">
                Browse current stock
              </Link>
            </div>
          ) : (
            <>
              <p className={styles.summary}>
                <strong>{items.length}</strong> {items.length === 1 ? 'car' : 'cars'} recently sold by {brandName}.
              </p>
              <ul className={styles.grid}>
                {items.map((raw: any, i: number) => {
                  const v = normalizeSoldItem(raw)
                  return (
                    <li key={v.id} data-aos="fade-up" data-aos-delay={i * 40}>
                      <VehicleCard vehicle={v as any} variant="sold" showActions={false} />
                    </li>
                  )
                })}
              </ul>
              <div className={styles.footerCta}>
                <Link href="/used-cars" className="qb-btn qb-btn--gradient mfx-shimmer">
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

export default QueensburyRecentlySoldPage
