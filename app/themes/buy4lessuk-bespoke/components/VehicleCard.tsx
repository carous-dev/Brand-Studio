'use client'

import Link from 'next/link'
import { Camera } from 'lucide-react'
import type { InventoryVehicle } from '../lib/inventory'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import styles from './VehicleCard.module.css'

const gbp = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

const monthly = (price: number) => {
  if (!price || price <= 0) return null
  const apr = 0.099
  const term = 60
  const monthlyRate = apr / 12
  const factor = (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1)
  return Math.round(price * factor)
}

export default function VehicleCard({ vehicle }: { vehicle: InventoryVehicle }) {
  const href = buildVehiclePermalink(vehicle)
  const hasImage = typeof vehicle.image === 'string' && vehicle.image.trim().length > 0
  const pm = monthly(vehicle.price)
  const tagline = (vehicle as any).tagline || "You're in safe hands"

  return (
    <Link href={href} className={styles.card} aria-label={vehicle.title}>
      <div className={styles.imageWrap}>
        {hasImage ? (
          <img src={vehicle.image} alt={vehicle.title} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.placeholder} aria-hidden>
            <Camera size={32} strokeWidth={1.6} className={styles.placeholderIcon} />
            <span className={styles.placeholderText}>Image coming soon</span>
          </div>
        )}
        <span className={styles.badge} aria-hidden>
          <span className={styles.badgeDiamond} />
          <span className={styles.badgeText}>QUALITY</span>
        </span>
      </div>
      <div className={styles.bodyWrap}>
        <h3 className={styles.title}>{vehicle.title}</h3>
        <p className={styles.meta}>
          {[vehicle.body, vehicle.transmission, vehicle.fuel].filter(Boolean).join(' ').trim() || ' '}
        </p>
        <div className={styles.specs}>
          <span>{vehicle.year || '—'}</span>
          <span>{vehicle.mileage ? `${vehicle.mileage.toLocaleString('en-GB')} mi` : '—'}</span>
          <span>{vehicle.transmission || '—'}</span>
          <span>{vehicle.fuel || '—'}</span>
        </div>
      </div>
      <div className={styles.safeStrip} aria-hidden>{tagline}</div>
      <div className={styles.priceRow}>
        <span className={styles.price}>{vehicle.price > 0 ? gbp(vehicle.price) : 'POA'}</span>
        <span className={styles.monthly}>
          {pm ? (
            <>
              <span className={styles.monthlyLabel}>From / Month</span>
              <span className={styles.monthlyValue}>{gbp(pm)}</span>
            </>
          ) : (
            <span className={styles.monthlyLabel}>Finance available</span>
          )}
        </span>
      </div>
    </Link>
  )
}
