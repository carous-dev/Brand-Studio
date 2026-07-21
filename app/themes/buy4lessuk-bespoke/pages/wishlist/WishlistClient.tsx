'use client'

import Link from 'next/link'
import { Heart, Trash2 } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import PageShell from '../../components/PageShell'
import styles from './page.module.css'

const gbp = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

export default function WishlistClient() {
  const { wishlist, removeWishlist, clearWishlist } = useGarage()

  return (
    <PageShell>
      {wishlist.length === 0 ? (
        <div className={styles.empty}>
          <Heart size={40} strokeWidth={1.5} aria-hidden />
          <h2>No saved cars yet</h2>
          <p>Tap the heart on any car you like — they'll appear here so you can come back to them.</p>
          <Link href="/used-cars" className={styles.ctaPrimary}>Browse stock</Link>
        </div>
      ) : (
        <>
          <div className={styles.actionsHead}>
            <button type="button" onClick={() => clearWishlist()} className={styles.clear}>
              <Trash2 size={14} strokeWidth={2.2} aria-hidden /> Clear all
            </button>
          </div>
          <ul className={styles.list}>
            {wishlist.map((v) => (
              <li key={v.id} className={styles.item}>
                <Link href={buildVehiclePermalink(v)} className={styles.itemLink}>
                  <div className={styles.imageWrap}>
                    {v.image ? <img src={v.image} alt={v.title} loading="lazy" /> : <div className={styles.imagePlaceholder} />}
                  </div>
                  <div className={styles.body}>
                    <h3>{v.title}</h3>
                    <p className={styles.meta}>
                      {[v.year, v.mileage ? `${v.mileage.toLocaleString('en-GB')} mi` : null, v.transmission, v.fuel]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <span className={styles.price}>{v.price > 0 ? gbp(v.price) : 'POA'}</span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => removeWishlist(v.id)}
                  className={styles.remove}
                  aria-label={`Remove ${v.title} from shortlist`}
                >
                  <Trash2 size={16} strokeWidth={2.2} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </PageShell>
  )
}
