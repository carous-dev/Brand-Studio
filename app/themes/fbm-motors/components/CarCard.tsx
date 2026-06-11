import Link from 'next/link'
import { Calendar, Gauge, Palette, Fuel, Cog } from 'lucide-react'
import type { InventoryVehicle } from '../lib/inventory'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import styles from './CarCard.module.css'

const FALLBACK_IMAGE = '/images/image.png'

function fmtPrice(n: number) {
  if (!Number.isFinite(n) || n <= 0) return 'POA'
  return `£${n.toLocaleString('en-GB')}`
}

function fmtMileage(n: number) {
  if (!Number.isFinite(n) || n <= 0) return 'Mileage N/A'
  return `${n.toLocaleString('en-GB')} mi`
}

export type CarCardProps = {
  vehicle: InventoryVehicle & { reserved?: boolean }
}

/**
 * Inventory card — renders an `InventoryVehicle` normalised by
 * `normalizeInventoryItem()`. The whole card links to the canonical vehicle
 * permalink (`/used-cars/<slug>-<reg>`) so cards are clickable end-to-end and
 * search engines can crawl the listing.
 */
export function CarCard({ vehicle }: CarCardProps) {
  const href = buildVehiclePermalink(
    { slug: vehicle.slug, reg: vehicle.reg },
    '/used-cars',
  )
  const image = vehicle.image && vehicle.image.trim() ? vehicle.image : FALLBACK_IMAGE

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.linkOverlay} aria-label={`View details for ${vehicle.title}`} />
      <div className={styles.media}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={vehicle.title}
          loading="lazy"
          width={640}
          height={400}
          className={styles.image}
        />
        <div className={styles.mediaOverlay} aria-hidden />
        <span className={styles.warrantyBadge}>3-MO WARRANTY</span>
        <span className={styles.priceBadge}>{fmtPrice(vehicle.price)}</span>
        {vehicle.reserved && (
          <div className="fbm-stamp-reserved">
            <span className="fbm-stamp-reserved-pill">VEHICLE RESERVED</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{vehicle.title}</h3>
        <dl className={styles.specs}>
          <div className={styles.spec}>
            <Calendar className={styles.specIcon} aria-hidden />
            <dt className="sr-only">Year</dt>
            <dd>{vehicle.year || '—'}</dd>
          </div>
          <div className={styles.spec}>
            <Gauge className={styles.specIcon} aria-hidden />
            <dt className="sr-only">Mileage</dt>
            <dd>{fmtMileage(vehicle.mileage)}</dd>
          </div>
          <div className={styles.spec}>
            <Palette className={styles.specIcon} aria-hidden />
            <dt className="sr-only">Colour</dt>
            <dd>{vehicle.color || '—'}</dd>
          </div>
          <div className={styles.spec}>
            <Fuel className={styles.specIcon} aria-hidden />
            <dt className="sr-only">Fuel</dt>
            <dd>{vehicle.fuel || '—'}</dd>
          </div>
          <div className={styles.spec}>
            <Cog className={styles.specIcon} aria-hidden />
            <dt className="sr-only">Transmission</dt>
            <dd>{vehicle.transmission || '—'}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

export default CarCard
