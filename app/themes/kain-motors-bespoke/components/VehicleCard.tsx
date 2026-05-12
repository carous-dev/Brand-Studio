'use client'

import Link from 'next/link'
import { useGarage } from '../context/GarageContext'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import styles from './VehicleCard.module.css'

type Vehicle = {
  slug?: string
  reg?: string
  registration?: string
  make?: string
  model?: string
  year?: number | string
  price?: number | string
  monthly?: number | string
  image?: string
  images?: string[]
  mileage?: number | string
  fuel?: string
  fuel_type?: string
  transmission?: string
  body?: string
  body_type?: string
  derivative?: string
  engine?: string
  engine_size?: string
  hp?: number | string
  doors?: number | string
  seats?: number | string
  ulez?: boolean | string
  warranty?: string
  tags?: string[]
  status?: string
}

function fmtPrice(value: any) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `£${n.toLocaleString('en-GB')}`
}
function fmtMileage(value: any) {
  if (value == null || value === '') return ''
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `${n.toLocaleString('en-GB')} mi`
}
function fmtMonthly(value: any) {
  if (value == null || value === '') return ''
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return `from £${n.toLocaleString('en-GB')}/mo`
}

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>
)
const CompareIcon = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>
)

type Props = {
  vehicle: Vehicle
  variant?: 'standard' | 'compact'
  sold?: boolean
}

export default function VehicleCard({ vehicle, variant = 'standard', sold = false }: Props) {
  const { isWishlisted, isCompared, toggleWishlist, toggleCompare } = useGarage()
  const slug = vehicle.slug || vehicle.reg || vehicle.registration || ''
  const href = buildVehiclePermalink(vehicle)

  const titleParts = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean)
  const title = titleParts.join(' ') || 'Vehicle'
  const derivative = vehicle.derivative || ''
  const img = (vehicle.images && vehicle.images[0]) || vehicle.image || ''
  const fuel = vehicle.fuel || vehicle.fuel_type
  const body = vehicle.body || vehicle.body_type
  const engine = vehicle.engine || vehicle.engine_size
  const monthly = vehicle.monthly
  const isUlez = vehicle.ulez === true || vehicle.ulez === 'true' || vehicle.ulez === '1'
  const tags = Array.isArray(vehicle.tags) ? vehicle.tags : []
  const isReserved = vehicle.status === 'reserved'

  const saved = isWishlisted(slug)
  const inCompare = isCompared(slug)

  function payload() {
    return {
      slug,
      title,
      price: typeof vehicle.price === 'number' ? vehicle.price : Number(vehicle.price) || 0,
      image: img,
    }
  }

  return (
    <article className={`${styles.card} ${variant === 'compact' ? styles.compact : ''} ${sold ? styles.soldCard : ''}`}>
      <div className={styles.media}>
        <Link href={href} className={styles.mediaLink} aria-label={title}>
          {img ? (
            <img src={img} alt={title} loading="lazy" />
          ) : (
            <span className={styles.mediaPlaceholder} aria-hidden="true">Image coming soon</span>
          )}
        </Link>
        {sold && (
          <span className={styles.soldStamp} aria-hidden="true">
            <span className={styles.soldStampInner}>Sold</span>
          </span>
        )}
        {!sold && (
          <div className={styles.actionRail}>
            <button
              type="button"
              className={`${styles.actionGlyph} ${saved ? styles.actionOn : ''}`}
              aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-pressed={saved}
              onClick={(e) => { e.preventDefault(); toggleWishlist(payload() as any) }}
            >
              <HeartIcon filled={saved} />
            </button>
            <button
              type="button"
              className={`${styles.actionGlyph} ${inCompare ? styles.actionOn : ''}`}
              aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
              aria-pressed={inCompare}
              onClick={(e) => { e.preventDefault(); toggleCompare(payload() as any) }}
            >
              <CompareIcon filled={inCompare} />
            </button>
          </div>
        )}
        {(tags[0] || isUlez || vehicle.warranty || isReserved) && (
          <div className={styles.badgeRow}>
            {isReserved && <span className={`${styles.badge} ${styles.badgeReserved}`}>Reserved</span>}
            {tags[0] && !isReserved && <span className={styles.badge}>{tags[0]}</span>}
            {isUlez && <span className={`${styles.badge} ${styles.badgeUlez}`}>ULEZ</span>}
            {vehicle.warranty && <span className={`${styles.badge} ${styles.badgeWarranty}`}>Warranty</span>}
          </div>
        )}
      </div>

      <div className={styles.body}>
        <Link href={href} className={styles.titleLink}>
          <h3 className={styles.title}>{title}</h3>
        </Link>
        {derivative && <p className={styles.derivative}>{derivative}</p>}

        <ul className={styles.specs} aria-label="Key specs">
          {vehicle.mileage != null && vehicle.mileage !== '' && <li>{fmtMileage(vehicle.mileage)}</li>}
          {body && <li>{body}</li>}
          {fuel && <li>{fuel}</li>}
          {vehicle.transmission && <li>{vehicle.transmission}</li>}
          {engine && <li>{engine}</li>}
          {vehicle.doors && <li>{vehicle.doors} dr</li>}
          {vehicle.hp && <li>{vehicle.hp} bhp</li>}
        </ul>

        <div className={styles.priceRow}>
          {sold ? (
            <>
              <span className={styles.soldLabel}>Sold price</span>
              <span className={styles.priceSold}>{fmtPrice(vehicle.price)}</span>
            </>
          ) : (
            <>
              <span className={styles.price}>{fmtPrice(vehicle.price)}</span>
              {monthly && <span className={styles.monthly}>{fmtMonthly(monthly)}</span>}
            </>
          )}
        </div>

        {!sold && (
          <div className={styles.ctaRow}>
            <Link href={href} className={styles.ctaPrimary}>View details</Link>
            <Link href={`${href}?reserve=1`} className={styles.ctaGhost}>Reserve</Link>
          </div>
        )}
      </div>
    </article>
  )
}
