'use client'

import Link from 'next/link'
import { Gauge, Fuel, Settings2, Calendar, Heart, GitCompare, ArrowUpRight } from 'lucide-react'
import { useGarage, type SavedVehicle } from '../context/GarageContext'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import styles from './VehicleCard.module.css'

type VehicleLike = {
  id: string | number
  title?: string
  slug?: string
  reg?: string
  year?: number
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
  featured?: boolean
}

const formatPrice = (value?: number) => {
  if (typeof value !== 'number' || !isFinite(value)) return '£—'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

const toSlug = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function VehicleCard({ vehicle, hideActions = false }: { vehicle: VehicleLike; hideActions?: boolean }) {
  const { toggleWishlist, toggleCompare, isWishlisted, isCompared } = useGarage()
  const wishlisted = isWishlisted(String(vehicle.id))
  const compared = isCompared(String(vehicle.id))

  const slug = vehicle.slug || (vehicle.title ? toSlug(vehicle.title) : String(vehicle.id))
  const href = buildVehiclePermalink({ slug, reg: vehicle.reg }, '/used-cars')

  const monthly = vehicle.price ? Math.round((vehicle.price * 0.012) / 5) * 5 : null

  const saved: SavedVehicle = {
    id: String(vehicle.id),
    title: vehicle.title || '',
    slug,
    reg: vehicle.reg,
    year: vehicle.year ?? 0,
    price: vehicle.price ?? 0,
    mileage: vehicle.mileage ?? 0,
    fuel: vehicle.fuel ?? '',
    transmission: vehicle.transmission ?? '',
    body: vehicle.body ?? '',
    make: vehicle.make ?? '',
    color: vehicle.color ?? '',
    doors: vehicle.doors ?? 0,
    location: vehicle.location ?? '',
    image: vehicle.image ?? '',
  }

  return (
    <article className={styles.card}>
      {hideActions ? <Link href={href} className={styles.cardFullLink} aria-label={`View details for ${vehicle.title || 'vehicle'}`} /> : null}
      <div className={styles.mediaWrap}>
        <Link href={href} className={styles.mediaLink} aria-label={vehicle.title}>
          <div
            className={styles.media}
            style={vehicle.image ? { backgroundImage: `url(${vehicle.image})` } : undefined}
            role="img"
            aria-label={vehicle.title}
          />
        </Link>
        {!hideActions ? (
        <div className={styles.cardTopRow}>
          {vehicle.featured ? <span className={`${styles.badge} ${styles.badgeFeatured}`}>Featured</span> : null}
          <button
            type="button"
            className={`${styles.iconButton} ${compared ? styles.iconButtonActive : ''}`}
            aria-pressed={compared}
            aria-label={compared ? 'Remove from compare' : 'Add to compare'}
            onClick={() => toggleCompare(saved)}
          >
            <GitCompare size={16} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${wishlisted ? styles.iconButtonActive : ''}`}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            onClick={() => toggleWishlist(saved)}
          >
            <Heart size={16} strokeWidth={2.2} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
        ) : null}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title} title={vehicle.title}>
          <Link href={href} className={styles.titleLink}>{vehicle.title || 'Vehicle'}</Link>
        </h3>
        {vehicle.make || vehicle.body || vehicle.color ? (
          <p className={styles.meta}>
            {[vehicle.make, vehicle.body, vehicle.color].filter(Boolean).join(' · ')}
          </p>
        ) : null}

        <ul className={styles.specs}>
          {typeof vehicle.mileage === 'number' ? (
            <li><Gauge size={14} strokeWidth={2} aria-hidden /> {vehicle.mileage.toLocaleString()} mi</li>
          ) : null}
          {vehicle.fuel ? <li><Fuel size={14} strokeWidth={2} aria-hidden /> {vehicle.fuel}</li> : null}
          {vehicle.transmission ? <li><Settings2 size={14} strokeWidth={2} aria-hidden /> {vehicle.transmission}</li> : null}
          {vehicle.year ? <li><Calendar size={14} strokeWidth={2} aria-hidden /> {vehicle.year}</li> : null}
        </ul>

        <div className={styles.priceRow}>
          <div className={styles.priceCol}>
            <span className={styles.priceLabel}>Cash price</span>
            <span className={styles.price}>{formatPrice(vehicle.price)}</span>
          </div>
          {monthly ? (
            <div className={styles.priceCol}>
              <span className={styles.priceLabel}>From / mo</span>
              <span className={styles.monthlyPrice}>£{monthly.toLocaleString()}</span>
            </div>
          ) : null}
        </div>

        {!hideActions ? (
        <Link href={href} className={styles.viewCta}>
          View details
          <ArrowUpRight size={16} strokeWidth={2.4} />
        </Link>
        ) : null}
      </div>
    </article>
  )
}
