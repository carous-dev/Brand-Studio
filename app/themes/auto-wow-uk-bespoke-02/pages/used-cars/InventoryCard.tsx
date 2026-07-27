'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  GitCompare,
  Heart,
  Settings2,
} from 'lucide-react'
import styles from './page.module.css'
import { optimizeImageUrl } from '@/app/lib/imageOptimize'
import type { InventoryVehicle } from '../../lib/inventory'

type Props = {
  vehicle: InventoryVehicle
  detailHref: string
  view: 'grid' | 'list'
  wishlisted: boolean
  compared: boolean
  onToggleWishlist: () => void
  onToggleCompare: () => void
  formatPrice: (value: number) => string
}

/**
 * Modern inventory card with an on-card image carousel (huntsmotors parity):
 * a sliding image track with hover prev/next controls, dot indicators and a
 * "n/total" counter. Falls back to a single static image when only one photo
 * exists. Supports a compact grid layout and a wide two-column list layout.
 */
export default function InventoryCard({
  vehicle,
  detailHref,
  view,
  wishlisted,
  compared,
  onToggleWishlist,
  onToggleCompare,
  formatPrice,
}: Props) {
  const images = vehicle.images?.length ? vehicle.images : [vehicle.image]
  const hasMany = images.length > 1
  const [index, setIndex] = useState(0)
  const active = Math.min(index, images.length - 1)

  const go = (next: number) => {
    const count = images.length
    setIndex(((next % count) + count) % count)
  }

  const subtitle = [vehicle.make, vehicle.body].filter(Boolean).join(' · ')
  const monthly = vehicle.price > 0 ? Math.max(15, Math.round(vehicle.price / 60)) : null

  const media = (
    <div className={styles.cardImageWrap}>
      <div
        className={styles.cardImageTrack}
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {images.map((src, i) => (
          <div
            key={`${vehicle.id}-img-${i}`}
            className={styles.cardImage}
            style={{ backgroundImage: `url("${optimizeImageUrl(src, { width: 640 })}")` }}
            role="img"
            aria-label={`${vehicle.title} photo ${i + 1}`}
          />
        ))}
      </div>

      <span className={styles.imageCount} aria-hidden="true">
        <Camera size={11} strokeWidth={2} />
        {active + 1}/{images.length}
      </span>

      {hasMany ? (
        <>
          <div className={styles.sliderControls} aria-hidden="true">
            <button
              type="button"
              className={styles.sliderBtn}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                go(active - 1)
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft size={17} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              className={styles.sliderBtn}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                go(active + 1)
              }}
              aria-label="Next photo"
            >
              <ChevronRight size={17} strokeWidth={2.4} />
            </button>
          </div>
          <div className={styles.sliderDots} aria-hidden="true">
            {images.slice(0, 6).map((_, i) => (
              <button
                key={`${vehicle.id}-dot-${i}`}
                type="button"
                className={`${styles.sliderDot} ${i === active ? styles.sliderDotActive : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  go(i)
                }}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}

      <div className={styles.quickActions}>
        <button
          type="button"
          className={styles.iconButton}
          data-active={wishlisted}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? 'Saved to wishlist' : 'Save to wishlist'}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleWishlist()
          }}
        >
          <Heart size={14} strokeWidth={2} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          data-active={compared}
          aria-pressed={compared}
          aria-label={compared ? 'Remove from compare' : 'Add to compare'}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleCompare()
          }}
        >
          <GitCompare size={14} strokeWidth={2} />
        </button>
      </div>

      {vehicle.featured ? <span className={styles.featured}>Featured</span> : null}
    </div>
  )

  const specs = (
    <div className={styles.cardSpecs}>
      <span><Calendar size={13} strokeWidth={2} />{vehicle.year || '—'}</span>
      <span><Gauge size={13} strokeWidth={2} />{vehicle.mileage.toLocaleString()} miles</span>
      <span><Fuel size={13} strokeWidth={2} />{vehicle.fuel}</span>
      <span><Settings2 size={13} strokeWidth={2} />{vehicle.transmission}</span>
    </div>
  )

  return (
    <article className={`${styles.card} ${view === 'list' ? styles.cardList : ''}`}>
      <Link href={detailHref} className={styles.cardLink} aria-label={`View ${vehicle.title}`}>
        <span className={styles.srOnly}>View details</span>
      </Link>

      {media}

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle} title={vehicle.title}>{vehicle.title}</h3>
        {subtitle ? <p className={styles.cardSubtitle}>{subtitle}</p> : null}

        {specs}

        <div className={styles.cardFooter}>
          {monthly ? (
            <span className={styles.fromMonthly}>From £{monthly}/mo</span>
          ) : <span />}
          <span className={styles.cardPrice}>{formatPrice(vehicle.price)}</span>
        </div>
      </div>
    </article>
  )
}
