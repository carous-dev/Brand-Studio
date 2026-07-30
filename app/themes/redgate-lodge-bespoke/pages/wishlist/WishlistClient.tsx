'use client'

import Link from 'next/link'
import { useBrand } from '../../context/BrandClientWrapper'
import { useGarage } from '../../context/GarageContext'
import { resolveText } from '../../lib/brand-text'
import VehicleCard from '../../components/VehicleCard'
import styles from './page.module.css'

/**
 * WishlistClient — the saved-cars showroom grid (design-language §7: /wishlist
 * section on `bg`, wide container). Reads the per-brand garage store via
 * `useGarage()` and renders each saved car with the shared VehicleCard; a
 * hairline "remove" control sits under each. Empty state is a warm invitation
 * back to the showroom. Every string routes through `resolveText`.
 */

export default function WishlistClient() {
  const brand = useBrand()
  const { wishlist, removeWishlist, clearWishlist } = useGarage()

  const savedLabel = resolveText(brand, 'garage.saved_count')
  const removeLabel = resolveText(brand, 'garage.remove')
  const clearLabel = resolveText(brand, 'garage.clear')
  const browseLabel = resolveText(brand, 'garage.browse')

  if (!wishlist || wishlist.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.empty}>
            <p className={styles.emptyTitle} data-aos="fade-up">{resolveText(brand, 'garage.wishlist_empty_title')}</p>
            <p className={styles.emptyBody} data-aos="fade-up" data-aos-delay="80">{resolveText(brand, 'garage.wishlist_empty_body')}</p>
            <Link href="/used-cars" className={styles.emptyLink}>
              {browseLabel}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.count}>
            <span className={styles.countNumeral}>{wishlist.length}</span> {savedLabel}
          </p>
          <button type="button" className={styles.clear} onClick={() => clearWishlist()}>
            {clearLabel}
          </button>
        </header>

        <ul className={styles.grid}>
          {wishlist.map((v, idx) => (
            <li key={v.id} className={styles.cell} data-aos="fade-up" data-aos-delay={Math.min(idx, 8) * 60}>
              <VehicleCard vehicle={v} />
              <button
                type="button"
                className={styles.remove}
                onClick={() => removeWishlist(v.id)}
                aria-label={`${removeLabel}: ${v.title}`}
              >
                {removeLabel}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
