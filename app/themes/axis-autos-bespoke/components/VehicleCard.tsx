'use client'

import Link from 'next/link'
import { Heart, GitCompare, Fuel, Gauge, Settings } from 'lucide-react'
import { useGarage, type SavedVehicle } from '../context/GarageContext'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import { optimizeImageUrl } from '@/app/lib/imageOptimize'
import styles from './VehicleCard.module.css'

type Vehicle = {
  id: string | number
  title: string
  slug?: string
  reg?: string
  year?: number | string
  price?: number
  mileage?: number
  fuel?: string
  transmission?: string
  body?: string
  make?: string
  color?: string
  doors?: number
  location?: string
  image?: string
  thumbnail?: string
  sold?: boolean
}

const toSaved = (v: Vehicle): SavedVehicle => ({
  id: String(v.id),
  title: v.title,
  slug: v.slug,
  reg: v.reg,
  year: Number(v.year) || 0,
  price: Number(v.price) || 0,
  mileage: Number(v.mileage) || 0,
  fuel: v.fuel || '',
  transmission: v.transmission || '',
  body: v.body || '',
  make: v.make || '',
  color: v.color || '',
  doors: Number(v.doors) || 0,
  location: v.location || '',
  image: v.image || v.thumbnail || '',
})

const formatPrice = (value?: number) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)
    : '£POA'

const formatMileage = (value?: number) =>
  typeof value === 'number'
    ? `${new Intl.NumberFormat('en-GB').format(value)} mi`
    : '—'

/**
 * Minimalist VehicleCard. Hairline border, near-zero shadow, 4:3 image (matches
 * UK dealer feeds), 3 spec chips. Whole card is clickable via stretched link
 * overlay. Sold variant: grayscale photo + SOLD stamp + struck price.
 */
export default function VehicleCard({
  vehicle,
  sold = false,
  compact = false,
  brandSlug,
}: {
  vehicle: Vehicle
  sold?: boolean
  compact?: boolean
  brandSlug?: string  // unused — buildVehiclePermalink derives the prefix
}) {
  const garage = useGarage()
  const idStr = String(vehicle.id)
  const wishlisted = garage?.isWishlisted?.(idStr) ?? false
  const compared = garage?.isCompared?.(idStr) ?? false

  const href = buildVehiclePermalink({ slug: vehicle.slug, reg: vehicle.reg })
  const img = vehicle.image || vehicle.thumbnail || ''

  return (
    <article
      className={`${styles.card} ${sold ? styles.cardSold : ''} ${compact ? styles.cardCompact : ''}`}
    >
      <div className={styles.media}>
        {img ? (
          <div className={styles.mediaImage} style={{ backgroundImage: `url("${optimizeImageUrl(img, { width: 640 })}")` }} role="presentation" />
        ) : (
          <div className={styles.mediaPlaceholder} aria-hidden="true">No image</div>
        )}
        {sold ? <span className={styles.soldStamp} aria-label="Sold">Sold</span> : null}
        {!sold ? (
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.actionBtn} ${wishlisted ? styles.actionActive : ''}`}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); garage?.toggleWishlist?.(toSaved(vehicle)) }}
            >
              <Heart size={16} strokeWidth={1.8} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${compared ? styles.actionActive : ''}`}
              aria-label={compared ? 'Remove from compare' : 'Add to compare'}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); garage?.toggleCompare?.(toSaved(vehicle)) }}
            >
              <GitCompare size={16} strokeWidth={1.8} />
            </button>
          </div>
        ) : null}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title} title={vehicle.title}>{vehicle.title}</h3>
        {!compact ? (
          <ul className={styles.specs}>
            {vehicle.mileage != null ? (
              <li><Gauge size={14} strokeWidth={1.6} aria-hidden="true" /><span>{formatMileage(vehicle.mileage)}</span></li>
            ) : null}
            {vehicle.fuel ? (
              <li><Fuel size={14} strokeWidth={1.6} aria-hidden="true" /><span>{vehicle.fuel}</span></li>
            ) : null}
            {vehicle.transmission ? (
              <li><Settings size={14} strokeWidth={1.6} aria-hidden="true" /><span>{vehicle.transmission}</span></li>
            ) : null}
          </ul>
        ) : null}
        <div className={styles.footer}>
          <span className={`${styles.price} ${sold ? styles.priceSold : ''}`}>{formatPrice(vehicle.price)}</span>
          {!sold ? <span className={styles.viewLink}>View details →</span> : null}
        </div>
      </div>

      <Link href={href} className={styles.cardLink} aria-label={`View ${vehicle.title}`}>
        <span className="sr-only">View {vehicle.title}</span>
      </Link>
    </article>
  )
}
