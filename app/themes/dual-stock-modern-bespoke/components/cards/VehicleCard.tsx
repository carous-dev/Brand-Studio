'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useGarage } from '../../context/GarageContext'
import type { InventoryVehicle } from '../../lib/inventory'
import { buildVehicleHref } from '../../lib/vehicle-links'
import { optimizeImageUrl } from '@/app/lib/imageOptimize'
import styles from './VehicleCard.module.css'

interface VehicleCardProps {
  vehicle: InventoryVehicle
  compact?: boolean
  sold?: boolean
  hideActions?: boolean
}

const formatPrice = (price: number) => {
  if (!Number.isFinite(price) || price <= 0) return 'POA'
  return `£${Math.round(price).toLocaleString('en-GB')}`
}

const formatMonthly = (price: number) => {
  if (!Number.isFinite(price) || price <= 0) return '—'
  // Indicative HP estimate (60 months @ 9.9% APR, no deposit)
  const monthly = Math.round((price * 0.0212) / 5) * 5
  return `£${monthly}`
}

const formatMileage = (mileage: number) => {
  if (!Number.isFinite(mileage) || mileage <= 0) return 'New / unspecified'
  return `${mileage.toLocaleString('en-GB')} mi`
}

export default function VehicleCard({ vehicle, compact = false, sold = false, hideActions = false }: VehicleCardProps) {
  const { isWishlisted, isCompared, toggleWishlist, toggleCompare, compareCount } = useGarage()
  const href = buildVehicleHref(vehicle.slug || vehicle.id, vehicle as any)
  const isBike = vehicle.vehicleClass === 'bike'
  const inWishlist = isWishlisted(vehicle.id)
  const inCompare = isCompared(vehicle.id)
  const compareDisabled = !inCompare && compareCount >= 3

  const savedVehicle = {
    id: vehicle.id,
    title: vehicle.title,
    slug: vehicle.slug,
    reg: vehicle.reg,
    year: vehicle.year,
    price: vehicle.price,
    mileage: vehicle.mileage,
    fuel: vehicle.fuel,
    transmission: vehicle.transmission,
    body: vehicle.body,
    make: vehicle.make,
    color: vehicle.color,
    doors: vehicle.doors,
    location: vehicle.location,
    image: vehicle.image,
  }

  const specChips = isBike
    ? [
        vehicle.mileage > 0 && { icon: 'gauge', label: formatMileage(vehicle.mileage) },
        vehicle.engineSize && { icon: 'engine', label: vehicle.engineSize },
        vehicle.body && { icon: 'body', label: vehicle.body },
        vehicle.fuel && { icon: 'fuel', label: vehicle.fuel },
      ]
    : [
        vehicle.mileage > 0 && { icon: 'gauge', label: formatMileage(vehicle.mileage) },
        vehicle.transmission && { icon: 'trans', label: vehicle.transmission },
        vehicle.fuel && { icon: 'fuel', label: vehicle.fuel },
        vehicle.body && { icon: 'body', label: vehicle.body },
      ]

  const chips = specChips.filter(Boolean) as Array<{ icon: string; label: string }>

  return (
    <article
      className={`${styles.card} ${compact ? styles.cardCompact : ''} ${sold ? styles.cardSold : ''}`}
      data-vehicle-class={vehicle.vehicleClass}
    >
      <Link href={href} className={styles.cardLink} aria-label={`View ${vehicle.title}`}>
        <span className="dual-vh-only">View {vehicle.title}</span>
      </Link>

      <div className={styles.media}>
        <div
          className={styles.mediaImage}
          style={{ backgroundImage: `url('${optimizeImageUrl(vehicle.image, { width: 640 })}')` }}
          role="img"
          aria-label={vehicle.title}
        />
        {sold && <span className={styles.soldStamp}>Sold</span>}
        {!hideActions && (
        <div className={styles.mediaTopLeft}>
          <button
            type="button"
            className={`${styles.iconAction} ${inWishlist ? styles.iconActionOn : ''}`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={inWishlist}
            onClick={(e) => { e.preventDefault(); toggleWishlist(savedVehicle) }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.iconAction} ${inCompare ? styles.iconActionOn : ''}`}
            aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
            aria-pressed={inCompare}
            disabled={compareDisabled}
            onClick={(e) => {
              if (compareDisabled) return
              e.preventDefault()
              toggleCompare(savedVehicle)
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
        )}
        {vehicle.featured && (
          <div className={styles.mediaBadges}>
            <span className={styles.featuredBadge}>Featured</span>
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{vehicle.title}</h3>
        <p className={styles.meta}>
          {vehicle.year > 0 && <span>{vehicle.year}</span>}
          {vehicle.make && <span>· {vehicle.make}</span>}
          {vehicle.color && <span>· {vehicle.color}</span>}
        </p>

        {chips.length > 0 && !compact && (
          <ul className={styles.specs} aria-label="Vehicle specs">
            {chips.map((chip) => (
              <li key={chip.icon + chip.label}>
                <SpecIcon icon={chip.icon} />
                <span>{chip.label}</span>
              </li>
            ))}
          </ul>
        )}
        {chips.length > 0 && compact && (
          <ul className={styles.specsCompact} aria-label="Vehicle specs">
            {chips.slice(0, 3).map((chip) => (
              <li key={chip.icon + chip.label}>{chip.label}</li>
            ))}
          </ul>
        )}

        <div className={styles.priceRow}>
          <div className={styles.priceBlock}>
            <span className={styles.priceLabel}>Price</span>
            <span className={`${styles.priceValue} ${sold ? styles.priceValueSold : ''}`}>
              {formatPrice(vehicle.price)}
            </span>
          </div>
          <div className={styles.priceBlock}>
            <span className={styles.priceLabel}>HP from</span>
            <span className={styles.priceMonthly}>{formatMonthly(vehicle.price)}/mo</span>
          </div>
        </div>

        {!compact && !sold && !hideActions && (
          <div className={styles.cta}>
            <span className={styles.cardCtaPrimary}>
              View {isBike ? 'bike' : 'car'} <span aria-hidden="true">→</span>
            </span>
            {vehicle.location && (
              <span className={styles.locationChip}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {vehicle.location.split(',')[0]}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function SpecIcon({ icon }: { icon: string }) {
  const c = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': true as const }
  if (icon === 'gauge') {
    return <svg {...c}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
  }
  if (icon === 'trans') {
    return <svg {...c}><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="1" fill="currentColor" /></svg>
  }
  if (icon === 'fuel') {
    return <svg {...c}><rect x="3" y="3" width="11" height="18" rx="1" /><path d="M14 8h3l3 3v8a2 2 0 0 1-2 2h-1" /></svg>
  }
  if (icon === 'body') {
    return <svg {...c}><rect x="3" y="8" width="18" height="9" rx="2" /><circle cx="8" cy="17" r="2" fill="currentColor" /><circle cx="16" cy="17" r="2" fill="currentColor" /></svg>
  }
  if (icon === 'engine') {
    return <svg {...c}><path d="M5 9h3V6h6v3h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" /><path d="M10 13h4" /></svg>
  }
  return null
}
