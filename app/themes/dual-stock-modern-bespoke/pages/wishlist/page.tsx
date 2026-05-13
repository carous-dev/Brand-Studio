'use client'
// audit-ignore-file: tp-use-client-on-page

import Link from 'next/link'
import { useGarage } from '../../context/GarageContext'
import { buildVehicleHref } from '../../lib/vehicle-links'
import styles from './page.module.css'

const formatPrice = (n: number) =>
  Number.isFinite(n) && n > 0
    ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
    : 'POA'

export function DualWishlistPage() {
  const { wishlist, removeWishlist, clearWishlist } = useGarage()

  return (
    <main>
      <section className="dual-page-hero dual-page-hero--wishlist">
        <div className="dual-page-hero__inner">
          <nav className="dual-page-hero__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Wishlist</span>
          </nav>
          <h1 className="dual-page-hero__title">Your wishlist</h1>
          <p className="dual-page-hero__lead">
            Saved vehicles, ready to enquire about. Comes back when you return — saved on your device.
          </p>
        </div>
      </section>

      <section className="dual-section">
        <div className="dual-container">
          {wishlist.length === 0 ? (
            <div className={styles.empty}>
              <h2>No saved vehicles yet</h2>
              <p>Tap the heart icon on any vehicle card to save it here.</p>
              <Link href="/used-cars" className="dual-btn dual-btn--primary">Browse stock</Link>
            </div>
          ) : (
            <>
              <div className={styles.actions}>
                <span className={styles.count}>{wishlist.length} saved</span>
                <button type="button" onClick={clearWishlist} className={styles.clearBtn}>Clear all</button>
              </div>
              <ul className={styles.list}>
                {wishlist.map((v) => (
                  <li key={v.id} className={styles.row}>
                    <div className={styles.rowImage} style={{ backgroundImage: `url(${v.image})` }} />
                    <div className={styles.rowBody}>
                      <Link href={buildVehicleHref(v.slug || v.id, v as any)} className={styles.rowTitle}>{v.title}</Link>
                      <p className={styles.rowMeta}>
                        {v.year} · {v.make} · {v.body} · {v.mileage.toLocaleString('en-GB')} mi
                      </p>
                      <span className={styles.rowPrice}>{formatPrice(v.price)}</span>
                    </div>
                    <button type="button" onClick={() => removeWishlist(v.id)} className={styles.removeBtn} aria-label={`Remove ${v.title}`}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default DualWishlistPage
