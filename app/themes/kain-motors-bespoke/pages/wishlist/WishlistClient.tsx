'use client'

import Link from 'next/link'
import { useGarage } from '../../context/GarageContext'
import VehicleCard from '../../components/VehicleCard'
import styles from './page.module.css'

export default function KainWishlistClient() {
  const { wishlist, removeWishlist, clearWishlist } = useGarage() as any

  if (!wishlist || wishlist.length === 0) {
    return (
      <section className={`kain-section ${styles.section}`}>
        <div className={styles.inner}>
          <div className={styles.empty}>
            <h2>Your wishlist is empty.</h2>
            <p>Tap the heart on any vehicle to save it here for later.</p>
            <Link href="/used-cars" className="kain-btn kain-btn--primary">Browse stock</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`kain-section ${styles.section}`}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <p className="kain-eyebrow">{wishlist.length} saved</p>
            <h2 className={styles.title}>Your wishlist</h2>
          </div>
          <button type="button" className="kain-btn kain-btn--ghost-light kain-btn--small" onClick={() => clearWishlist()}>
            Clear all
          </button>
        </header>
        <ul className={styles.grid}>
          {wishlist.map((v: any) => (
            <li key={v.slug}>
              <VehicleCard vehicle={v} />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeWishlist(v.slug)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
