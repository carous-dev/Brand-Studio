'use client'

import Link from 'next/link'
import { Heart, Trash2, ArrowRight, GitCompare } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

export default function WishlistIsland() {
  const { wishlist, removeWishlist, clearWishlist, toggleCompare, isCompared } = useGarage()

  if (!wishlist.length) {
    return (
      <section className={styles.section}>
        <div className={styles.empty} data-aos="fade-up">
          <span className={styles.emptyIcon} aria-hidden="true">
            <Heart size={36} strokeWidth={1.6} />
          </span>
          <h2 className={styles.emptyTitle}>No cars saved yet</h2>
          <p className={styles.emptyBody}>
            Browse the showroom and tap the heart on any vehicle to save it here.
          </p>
          <Link href="/used-cars" className={styles.emptyCta}>
            Browse stock
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <p className={styles.count}>{wishlist.length} saved {wishlist.length === 1 ? 'car' : 'cars'}</p>
          <button type="button" className={styles.clearBtn} onClick={clearWishlist}>
            <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
            Clear all
          </button>
        </header>

        <ul className={styles.grid}>
          {wishlist.map((v, i) => {
            const compared = isCompared(v.id)
            return (
              <li
                key={v.id}
                className={styles.card}
                data-aos="zoom-in"
                data-aos-delay={String((i % 3) * 60)}
              >
                <Link
                  href={buildVehiclePermalink({ slug: v.slug, reg: v.reg })}
                  className={styles.cardMedia}
                  style={{ backgroundImage: `url(${v.image})` }}
                  aria-label={v.title}
                />
                <div className={styles.cardBody}>
                  <p className={styles.cardYear}>{v.year}</p>
                  <Link
                    href={buildVehiclePermalink({ slug: v.slug, reg: v.reg })}
                    className={styles.cardTitle}
                  >
                    {v.title}
                  </Link>
                  <p className={styles.cardPrice}>{formatPrice(v.price)}</p>
                  <ul className={styles.cardSpecs}>
                    <li>{v.mileage.toLocaleString()} mi</li>
                    <li>{v.fuel}</li>
                    <li>{v.transmission}</li>
                  </ul>
                </div>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${compared ? styles.actionBtnActive : ''}`}
                    onClick={() => toggleCompare(v)}
                    aria-pressed={compared}
                    aria-label={compared ? 'Remove from compare' : 'Add to compare'}
                  >
                    <GitCompare size={14} strokeWidth={2} aria-hidden="true" />
                    {compared ? 'In compare' : 'Compare'}
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={() => removeWishlist(v.id)}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
