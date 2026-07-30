'use client'

import type { MouseEvent } from 'react'
import { CalendarDays, Cog, Fuel, Gauge, Heart, Scale } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { resolveText } from '../lib/brand-text'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import { useGarage, type SavedVehicle } from '../context/GarageContext'
import { optimizeImageUrl } from '@/app/lib/imageOptimize'
import styles from './VehicleCard.module.css'

/**
 * VehicleCard — the shared scanning unit for featured-stock, the inventory
 * grid, the similar-vehicles rail, wishlist and recently-sold. Three variants:
 *
 *   default  — full card: 4/3 photo, wishlist+compare glyphs, title, 2-col
 *              spec grid, and the signature "ledger footline" (serif price left
 *              + serif-caps "View" right, hairline-topped). Whole card is one
 *              tap target via a stretched `.cardLink`.
 *   compact  — identical content, tighter padding for narrow rails (specs +
 *              price kept; there are no separate CTA buttons to hide).
 *   sold     — grayscale photo, rotated SOLD plate, struck/muted price, footline
 *              reads "Sold", wishlist/compare hidden. Link stays navigable so a
 *              recently-sold car still reaches its detail page.
 *
 * Every colour is a token/`color-mix` so the card renders correctly on the
 * claret palette AND a light throwaway brand. Copy routes through
 * `resolveText`; the image goes through `optimizeImageUrl` (card width 640).
 */

export interface VehicleCardVehicle {
  id?: string
  slug?: string
  reg?: string
  registration?: string
  title?: string
  year?: number | string
  price?: number | string
  mileage?: number | string
  fuel?: string
  transmission?: string
  trans?: string
  body?: string
  body_type?: string
  make?: string
  model?: string
  derivative?: string
  color?: string
  colour?: string
  doors?: number | string
  location?: string
  image?: string
}

interface VehicleCardProps {
  vehicle?: VehicleCardVehicle
  compact?: boolean
  sold?: boolean
  loading?: boolean
  className?: string
}

function cleanText(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]+/g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function formatPounds(value: number): string {
  return `£${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`
}

function formatMileage(value: number | null): string {
  if (value === null) return 'Miles on request'
  return `${value.toLocaleString('en-GB')} miles`
}

function formatYear(value: number | null): string {
  if (value === null || value <= 0) return 'Year on request'
  return String(Math.trunc(value))
}

export default function VehicleCard({
  vehicle,
  compact = false,
  sold = false,
  loading = false,
  className = '',
}: VehicleCardProps) {
  const brand = useBrand()
  const { isWishlisted, isCompared, toggleWishlist, toggleCompare } = useGarage()

  const viewLabel = resolveText(brand, 'card.view')
  const soldLabel = resolveText(brand, 'card.sold')
  const poaLabel = resolveText(brand, 'card.poa')

  if (loading || !vehicle) {
    return (
      <article
        className={[styles.card, styles.skeleton, compact ? styles.compact : '', className]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      >
        <div className={styles.skelMedia} />
        <div className={styles.skelBody}>
          <span className={`${styles.skelBar} ${styles.wide}`} />
          <span className={`${styles.skelBar} ${styles.short}`} />
        </div>
        <div className={styles.skelFoot}>
          <span className={`${styles.skelBar} ${styles.short}`} />
        </div>
      </article>
    )
  }

  const make = cleanText(vehicle.make)
  const model = cleanText(vehicle.model)
  const derivative = cleanText(vehicle.derivative)
  const reg = cleanText(vehicle.reg || vehicle.registration)

  const yearNum = toNumber(vehicle.year)
  const priceNum = toNumber(vehicle.price)
  const mileageNum = toNumber(vehicle.mileage)
  const doorsNum = toNumber(vehicle.doors)

  const fuel = cleanText(vehicle.fuel) || 'Fuel on request'
  const gearbox = cleanText(vehicle.transmission || vehicle.trans) || 'Gearbox on request'
  const body = cleanText(vehicle.body || vehicle.body_type)
  const color = cleanText(vehicle.color || vehicle.colour)

  const title =
    cleanText(vehicle.title) ||
    [yearNum ?? '', make, model, derivative].map((part) => cleanText(part)).filter(Boolean).join(' ') ||
    reg ||
    'Vehicle'

  const priceLabel = priceNum !== null && priceNum > 0 ? formatPounds(priceNum) : poaLabel

  const href = buildVehiclePermalink({ slug: vehicle.slug, reg }, '/used-cars')
  const garageId = cleanText(vehicle.id) || cleanText(vehicle.slug) || reg || title

  const imageSrc = cleanText(vehicle.image)
  const photoStyle = imageSrc
    ? { backgroundImage: `url("${optimizeImageUrl(imageSrc, { width: 640 })}")` }
    : undefined

  const isSaved = isWishlisted(garageId)
  const isComparing = isCompared(garageId)

  const savedVehicle: SavedVehicle = {
    id: garageId,
    title,
    slug: vehicle.slug,
    reg: reg || undefined,
    year: yearNum ?? 0,
    price: priceNum ?? 0,
    mileage: mileageNum ?? 0,
    fuel,
    transmission: gearbox,
    body: body || 'Car',
    make: make || 'Vehicle',
    color: color || 'Colour',
    doors: doorsNum ?? 0,
    location: cleanText(vehicle.location),
    image: imageSrc,
  }

  const handleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    toggleWishlist(savedVehicle)
  }

  const handleCompare = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    toggleCompare(savedVehicle)
  }

  return (
    <article
      className={[
        styles.card,
        compact ? styles.compact : '',
        sold ? styles.sold : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.media}>
        <span className={styles.mediaGlyph} aria-hidden="true">
          <Car22 />
        </span>
        <div className={styles.photo} role="img" aria-label={title} style={photoStyle} />

        {sold ? (
          <span className={styles.soldStamp}>{soldLabel}</span>
        ) : (
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.actionBtn} ${isSaved ? styles.active : ''}`.trim()}
              onClick={handleWishlist}
              aria-pressed={isSaved}
              aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
              title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={styles.actionGlyph} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${isComparing ? styles.active : ''}`.trim()}
              onClick={handleCompare}
              aria-pressed={isComparing}
              aria-label={isComparing ? 'Remove from compare' : 'Add to compare'}
              title={isComparing ? 'Remove from compare' : 'Add to compare'}
            >
              <Scale className={styles.actionGlyph} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <dl className={styles.cardSpecs}>
          <div className={styles.spec}>
            <CalendarDays className={styles.specIcon} aria-hidden="true" />
            <span className={styles.specValue}>{formatYear(yearNum)}</span>
          </div>
          <div className={styles.spec}>
            <Gauge className={styles.specIcon} aria-hidden="true" />
            <span className={styles.specValue}>{formatMileage(mileageNum)}</span>
          </div>
          <div className={styles.spec}>
            <Fuel className={styles.specIcon} aria-hidden="true" />
            <span className={styles.specValue}>{fuel}</span>
          </div>
          <div className={styles.spec}>
            <Cog className={styles.specIcon} aria-hidden="true" />
            <span className={styles.specValue}>{gearbox}</span>
          </div>
        </dl>
      </div>

      <div className={styles.footline}>
        <span className={styles.price}>{priceLabel}</span>
        <span className={styles.view}>{sold ? soldLabel : viewLabel}</span>
      </div>

      <a className={styles.cardLink} href={href} aria-label={`View ${title}`} />
    </article>
  )
}

/**
 * Muted 4/3 fallback glyph shown behind the photo layer — a 404 photo is
 * transparent, so this reads through as an intentional empty panel rather than
 * a broken box. `currentColor` inherits the muted token from `.mediaGlyph`.
 */
function Car22() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
      <path d="M4 13h16a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" />
      <circle cx="7.5" cy="16" r="1" />
      <circle cx="16.5" cy="16" r="1" />
    </svg>
  )
}
