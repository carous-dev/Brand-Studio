'use client'

import Link from 'next/link'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })
const miles = new Intl.NumberFormat('en-GB')

export default function WishlistIsland() {
  const garage = useGarage()

  if (garage.wishlist.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h2 className={styles.emptyHeading}>Nothing saved yet.</h2>
            <p>Tap the heart icon on any vehicle in our stock to keep it here.</p>
            <Link href="/used-cars" className={styles.emptyCta}>
              Browse stock
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.head} data-aos="fade-up">
          <h2 className={styles.heading}>
            {garage.wishlist.length} saved {garage.wishlist.length === 1 ? 'car' : 'cars'}.
          </h2>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => garage.clearWishlist()}
          >
            Clear wishlist
          </button>
        </header>

        <ul className={styles.grid}>
          {garage.wishlist.map((v, idx) => (
            <li key={v.id} className={styles.card} data-aos="fade-up" data-aos-delay={String((idx % 4) * 80)}>
              <Link href={buildVehiclePermalink(v)} className={styles.cardLink}>
                <div className={styles.cardMedia}>
                  {v.image ? (
                    <img src={v.image} alt="" width="640" height="420" loading="lazy" className={styles.cardImg} />
                  ) : (
                    <div className={styles.cardImgFallback} aria-hidden="true" />
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardPrice}>{gbp.format(v.price || 0)}</div>
                  <h3 className={styles.cardTitle}>{v.title}</h3>
                  <p className={styles.cardMeta}>
                    {v.year || '—'} · {v.mileage ? `${miles.format(v.mileage)} mi` : '—'} · {v.fuel}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => garage.removeWishlist(v.id)}
                aria-label={`Remove ${v.title} from wishlist`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
