'use client'

import Link from 'next/link'
import { ArrowRight, Camera, Gauge } from 'lucide-react'
import type { InventoryVehicle } from '../lib/inventory'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import { optimizeImageUrl } from '@/app/lib/imageOptimize'
import styles from './VehicleCard.module.css'

const gbp = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

export default function VehicleCard({ vehicle }: { vehicle: InventoryVehicle }) {
  const href = buildVehiclePermalink(vehicle)
  const hasImage = typeof vehicle.image === 'string' && vehicle.image.trim().length > 0

  return (
    <Link href={href} className={styles.card} aria-label={vehicle.title}>
      <div className={styles.imageWrap}>
        {hasImage ? (
          <img src={optimizeImageUrl(vehicle.image, { width: 640 })} alt={vehicle.title} width={640} height={480} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.placeholder} aria-hidden>
            <Camera size={32} strokeWidth={1.6} className={styles.placeholderIcon} />
            <span className={styles.placeholderText}>Image coming soon</span>
          </div>
        )}
        {vehicle.year > 0 ? (
          <span className={styles.yearBadge}>{vehicle.year}</span>
        ) : null}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{vehicle.title}</h3>
        <p className={styles.meta}>
          <span className={styles.metaItem}>
            <Gauge size={13} strokeWidth={2.2} aria-hidden />
            {vehicle.mileage ? `${vehicle.mileage.toLocaleString('en-GB')} mi` : '—'}
          </span>
          <span className={styles.metaDot} aria-hidden />
          <span className={styles.metaItem}>{vehicle.transmission || '—'}</span>
        </p>
        <p className={styles.price}>{vehicle.price > 0 ? gbp(vehicle.price) : 'POA'}</p>
        <span className={styles.viewDetails}>
          View Details
          <ArrowRight size={13} strokeWidth={2.6} aria-hidden />
        </span>
      </div>
    </Link>
  )
}
