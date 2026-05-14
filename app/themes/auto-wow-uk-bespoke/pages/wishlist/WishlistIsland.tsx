'use client'

import Link from 'next/link'
import { Heart, ChevronRight, Trash2 } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0)

const formatMileage = (n: number) =>
  new Intl.NumberFormat('en-GB').format(n || 0)

export default function WishlistIsland() {
  const { wishlist, toggleWishlist } = useGarage()
  const list = Array.isArray(wishlist) ? wishlist : []

  if (list.length === 0) {
    return (
      <section className={`auto-section ${styles.section}`}>
        <div className={`auto-container ${styles.emptyState}`}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <Heart size={32} />
          </span>
          <h2 className={styles.emptyTitle}>No saved cars yet.</h2>
          <p className={styles.emptyLead}>
            Tap the heart icon on any stock card to save it for later. Your wishlist lives on this
            device until you clear it.
          </p>
          <Link href="/used-cars" className="auto-btn auto-btn--primary">
            Browse stock
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className={`auto-section ${styles.section}`}>
      <div className="auto-container">
        <ul className={styles.grid}>
          {list.map((v: any) => (
            <li key={v.id} className={styles.card}>
              <button
                type="button"
                className={styles.removeBtn}
                aria-label={`Remove ${v.title} from wishlist`}
                onClick={() => toggleWishlist(v)}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
              <Link href={buildVehiclePermalink({ slug: v.slug || v.id, reg: v.reg }, '/used-cars')} className={styles.cardLink}>
                <div className={styles.media}>
                  {v.image ? <img src={v.image} alt={v.title} loading="lazy" /> : <div className={styles.placeholder} />}
                </div>
                <div className={styles.body}>
                  <p className={styles.title}>{v.title}</p>
                  <p className={styles.price}>{formatPrice(v.price)}</p>
                  <p className={styles.meta}>
                    {v.year || '—'} &middot; {formatMileage(v.mileage)} mi &middot; {v.fuel || '—'}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
