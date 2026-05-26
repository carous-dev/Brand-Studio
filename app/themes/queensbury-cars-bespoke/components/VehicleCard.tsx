'use client'

import Link from 'next/link'
import { useCallback, useMemo } from 'react'
import { useGarage, type SavedVehicle } from '../context/GarageContext'
import styles from './VehicleCard.module.css'

export type VehicleCardData = {
  id: string
  slug?: string
  title: string
  make?: string
  model?: string
  year?: number
  price?: number | string
  mileage?: number | string
  fuel?: string
  transmission?: string
  body?: string
  doors?: number
  engineSize?: string
  horsepower?: string | number
  color?: string
  ulez?: string | boolean
  warranty?: string | boolean
  reg?: string
  image?: string
  monthlyFrom?: number | string
  tags?: string[]
  availability?: 'available' | 'reserved' | 'sold' | string
}

type Variant = 'standard' | 'compact' | 'sold'
type Props = {
  vehicle: VehicleCardData
  variant?: Variant
  className?: string
  showActions?: boolean
}

function formatPrice(p: number | string | undefined): string {
  if (p == null || p === '') return 'POA'
  const n = typeof p === 'string' ? Number(p.replace(/[£,]/g, '')) : p
  if (!Number.isFinite(n)) return String(p)
  return `£${Math.round(n as number).toLocaleString('en-GB')}`
}
function formatMileage(m: number | string | undefined): string | null {
  if (m == null || m === '') return null
  const n = typeof m === 'string' ? Number(m.replace(/[,mi]/gi, '').trim()) : m
  if (!Number.isFinite(n)) return String(m)
  return `${(n as number).toLocaleString('en-GB')} mi`
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
function CompareIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 3h5v5M4 20l16-16M21 16v5h-5M4 4l5 5" />
    </svg>
  )
}

export default function VehicleCard({ vehicle, variant = 'standard', className, showActions = true }: Props) {
  const garage = useGarage()
  const isWishlisted = garage.isWishlisted(vehicle.id)
  const isCompared = garage.isCompared(vehicle.id)

  const href = vehicle.slug ? `/used-cars/${vehicle.slug}` : `/used-cars/${vehicle.id}`
  const isSold = variant === 'sold' || vehicle.availability === 'sold'

  const saved: SavedVehicle = useMemo(
    () => ({
      id: vehicle.id,
      title: vehicle.title,
      slug: vehicle.slug,
      reg: vehicle.reg,
      year: Number(vehicle.year) || 0,
      price: Number(vehicle.price) || 0,
      mileage: Number(vehicle.mileage) || 0,
      fuel: vehicle.fuel || '',
      transmission: vehicle.transmission || '',
      body: vehicle.body || '',
      make: vehicle.make || '',
      color: vehicle.color || '',
      doors: Number(vehicle.doors) || 0,
      location: '',
      image: vehicle.image || '',
    }),
    [vehicle],
  )

  const toggleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      garage.toggleWishlist(saved)
    },
    [garage, saved],
  )
  const toggleCompare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      garage.toggleCompare(saved)
    },
    [garage, saved],
  )

  const specs: string[] = []
  if (vehicle.year) specs.push(String(vehicle.year))
  if (vehicle.mileage != null) {
    const m = formatMileage(vehicle.mileage)
    if (m) specs.push(m)
  }
  if (vehicle.fuel) specs.push(vehicle.fuel)
  if (vehicle.transmission) specs.push(vehicle.transmission)

  const tagList = (vehicle.tags || []).slice(0, 2)

  return (
    <article
      className={`${styles.card} ${styles[`variant-${variant}`]} ${isSold ? styles.cardSold : ''} ${className || ''}`}
      aria-label={vehicle.title}
    >
      <Link href={href} className={styles.cardLink} aria-label={vehicle.title}>
        <span className={styles.linkSr}>{vehicle.title}</span>
      </Link>

      <div className={styles.media}>
        {vehicle.image ? (
          <img src={vehicle.image} alt={vehicle.title} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            <span>{(vehicle.make || vehicle.title || '?').slice(0, 1)}</span>
          </div>
        )}
        {isSold && (
          <div className={styles.soldBanner} aria-hidden="true">
            <span>SOLD</span>
          </div>
        )}
        {showActions && variant !== 'compact' && (
          <div className={styles.actionRow}>
            <button
              type="button"
              className={`${styles.actionIcon} ${isWishlisted ? styles.actionIconActive : ''}`}
              onClick={toggleWishlist}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isWishlisted}
            >
              <HeartIcon filled={isWishlisted} />
            </button>
            <button
              type="button"
              className={`${styles.actionIcon} ${isCompared ? styles.actionIconActive : ''}`}
              onClick={toggleCompare}
              aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
              aria-pressed={isCompared}
            >
              <CompareIcon filled={isCompared} />
            </button>
          </div>
        )}
        {tagList.length > 0 && (
          <div className={styles.tagRow}>
            {tagList.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{vehicle.title}</h3>
        {specs.length > 0 && (
          <ul className={styles.specs}>
            {specs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        <div className={styles.footer}>
          <div className={styles.priceCol}>
            <span className={styles.price}>{isSold ? formatPrice(vehicle.price) : formatPrice(vehicle.price)}</span>
            {vehicle.monthlyFrom && !isSold && (
              <span className={styles.priceMonthly}>from £{Number(vehicle.monthlyFrom).toLocaleString('en-GB')}/mo</span>
            )}
            {isSold && <span className={styles.soldPriceLabel}>Sold</span>}
          </div>
          {!isSold && variant !== 'compact' && (
            <span className={styles.viewCta} aria-hidden="true">
              View →
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
