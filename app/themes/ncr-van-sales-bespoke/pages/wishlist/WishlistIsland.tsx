'use client'

import Link from 'next/link'
import { Heart, Trash2, ArrowUpRight } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

const toSlug = (value: string) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function WishlistIsland() {
  const { wishlist, removeWishlist, clearWishlist } = useGarage()

  if (wishlist.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true"><Heart size={36} strokeWidth={1.8} /></span>
          <h2>No saved vans yet</h2>
          <p>Tap the heart icon on any vehicle to save it here.</p>
          <Link href="/used-cars" className={`${styles.cta} mfx-shimmer`}>Browse stock</Link>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <h2>{wishlist.length} saved van{wishlist.length === 1 ? '' : 's'}</h2>
          <button type="button" className={styles.clearBtn} onClick={clearWishlist}>
            <Trash2 size={14} strokeWidth={2} aria-hidden="true" /> Clear all
          </button>
        </header>

        <ul className={styles.grid}>
          {wishlist.map((v, i) => (
            <li key={v.id} className={styles.card} data-aos="fade-up" data-aos-delay={(i % 3) * 80}>
              <div className={styles.media} style={{ backgroundImage: `url(${v.image})` }} role="img" aria-label={v.title} />
              <div className={styles.body}>
                <h3 className={styles.title}>{v.title}</h3>
                <p className={styles.price}>{formatPrice(v.price)}</p>
                <p className={styles.meta}>
                  {v.year ? `${v.year} · ` : ''}{v.mileage.toLocaleString()} mi · {v.fuel}
                </p>
                <div className={styles.actions}>
                  <Link
                    href={buildVehiclePermalink({ slug: v.slug || toSlug(v.title), reg: v.reg }, '/used-cars')}
                    className={styles.viewBtn}
                  >
                    View details
                    <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeWishlist(v.id)}
                    aria-label={`Remove ${v.title} from wishlist`}
                  >
                    <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
