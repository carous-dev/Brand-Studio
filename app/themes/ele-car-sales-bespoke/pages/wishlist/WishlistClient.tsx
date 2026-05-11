'use client'

import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { useGarage, type SavedVehicle } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

function fmtPrice(value: any) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `£${n.toLocaleString('en-GB')}`
}

function fmtMileage(value: any) {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return `${n.toLocaleString('en-GB')} mi`
}

export default function WishlistClient() {
  const garage = useGarage()

  if (garage.wishlist.length === 0) {
    return (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>Your wishlist is empty.</h2>
        <p className={styles.emptyBody}>
          Tap the heart on any vehicle to save it here. You can come back and
          compare them or send us an enquiry on a specific one when you&apos;re ready.
        </p>
        <Link href="/used-cars" className={styles.emptyCta}>
          Browse the stock
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className={styles.toolbar}>
        <p className={styles.toolbarCount}>{garage.wishlist.length} saved</p>
        <button
          type="button"
          className={styles.toolbarClear}
          onClick={() => garage.clearWishlist()}
        >
          <Trash2 size={16} aria-hidden="true" />
          Clear all
        </button>
      </div>

      <ul className={styles.grid} role="list">
        {garage.wishlist.map((v: SavedVehicle) => {
          const mileage = fmtMileage(v.mileage)
          const href = buildVehiclePermalink({ slug: v.slug, reg: v.reg })
          return (
            <li key={v.id} className={styles.card}>
              <Link href={href} className={styles.cardLink}>
                <div className={styles.media}>
                  {v.image ? (
                    <img src={v.image} alt={v.title} loading="lazy" />
                  ) : (
                    <div className={styles.mediaPlaceholder} aria-hidden="true" />
                  )}
                </div>
                <div className={styles.body}>
                  <h3 className={styles.cardTitle}>{v.title}</h3>
                  <p className={styles.cardMeta}>
                    {[mileage, v.fuel, v.transmission].filter(Boolean).join(' · ')}
                  </p>
                  <p className={styles.cardPrice}>{fmtPrice(v.price)}</p>
                </div>
              </Link>
              <button
                type="button"
                className={styles.removeBtn}
                aria-label={`Remove ${v.title} from wishlist`}
                onClick={() => garage.removeWishlist(v.id)}
              >
                <Trash2 size={16} aria-hidden="true" />
                Remove
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
