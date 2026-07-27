'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Gauge, Fuel, Calendar, Cog } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import { optimizeImageUrl } from '@/app/lib/imageOptimize'
import styles from './LatestArrivals.module.css'

const ITEM_LIMIT = 8

const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})
const intFormatter = new Intl.NumberFormat('en-GB')

function formatPrice(price: number): string {
  if (!price || price <= 0) return 'POA'
  return gbpFormatter.format(price)
}
function formatMileage(miles: number): string {
  if (!miles || miles <= 0) return '—'
  return `${intFormatter.format(miles)} mi`
}
function formatYear(year: number): string {
  return year && year > 1900 ? String(year) : '—'
}

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; vehicles: InventoryVehicle[] }
  | { status: 'error'; message: string }

export default function LatestArrivals() {
  const brand = useBrand()
  const brandSlug = brand?.slug || ''
  const [state, setState] = useState<FetchState>({ status: 'idle' })
  const railRef = useRef<HTMLDivElement | null>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  // audit-ignore: data-useeffect-fetch — brand context is client-side; this
  // section lives inside a Server-rendered home composition and consumes
  // useBrand() inside a client island.
  useEffect(() => {
    if (!brandSlug) return
    const ctrl = new AbortController()
    setState({ status: 'loading' })
    const url = apiUrl(`/api/featured-vehicles?brand=${encodeURIComponent(brandSlug)}&limit=${ITEM_LIMIT}`)

    fetch(url, { signal: ctrl.signal })
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((payload: unknown) => {
        const raw: unknown[] = Array.isArray(payload)
          ? payload
          : Array.isArray((payload as any)?.items)
            ? (payload as any).items
            : Array.isArray((payload as any)?.vehicles)
              ? (payload as any).vehicles
              : []
        const vehicles = raw
          .map(normalizeInventoryItem)
          .filter((v): v is InventoryVehicle => v !== null)
        setState({ status: 'ready', vehicles })
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        setState({ status: 'error', message: String(err?.message || err) })
      })

    return () => ctrl.abort()
  }, [brandSlug])

  // Track scroll position to enable/disable prev/next chevrons.
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth - 1
      setCanScrollPrev(rail.scrollLeft > 4)
      setCanScrollNext(rail.scrollLeft < max)
    }
    update()
    rail.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(rail)
    return () => {
      rail.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [state.status])

  const scrollByCard = (direction: 1 | -1) => {
    const rail = railRef.current
    if (!rail) return
    // Scroll by ~1 card-width (first child + gap), or fall back to viewport.
    const firstCard = rail.querySelector(`.${styles.card}`) as HTMLElement | null
    const step = firstCard
      ? firstCard.getBoundingClientRect().width + 24
      : rail.clientWidth * 0.8
    rail.scrollBy({ left: step * direction, behavior: 'smooth' })
  }

  return (
    <section className={styles.section} aria-labelledby="warwick-latest-arrivals-heading" data-aos="fade-up">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <span className={styles.eyebrow}>Just Arrived</span>
            <h2 id="warwick-latest-arrivals-heading" className={styles.heading}>
              The Latest from Our Showroom
            </h2>
            <p className={styles.lead}>
              Fresh stock, hand-picked and prepared for the road. Browse the most
              recent arrivals before they&apos;re gone.
            </p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.railControls} aria-hidden={state.status !== 'ready'}>
              <button
                type="button"
                className={styles.railBtn}
                onClick={() => scrollByCard(-1)}
                disabled={!canScrollPrev}
                aria-label="Show previous vehicles"
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.railBtn}
                onClick={() => scrollByCard(1)}
                disabled={!canScrollNext}
                aria-label="Show next vehicles"
              >
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
            <Link href="/used-cars" className={styles.viewAllDesktop}>
              View all stock
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </header>

        <div className={styles.railWrap}>
          {state.status === 'loading' && (
            <div
              ref={railRef}
              className={styles.rail}
              aria-busy="true"
              aria-live="polite"
              role="region"
              aria-label="Loading recent arrivals"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`${styles.card} ${styles.cardSkeleton}`} aria-hidden="true">
                  <div className={styles.cardImage} />
                  <div className={styles.cardBody}>
                    <div className={styles.skelLine} />
                    <div className={`${styles.skelLine} ${styles.skelLineShort}`} />
                    <div className={`${styles.skelLine} ${styles.skelLineWide}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {state.status === 'ready' && state.vehicles.length > 0 && (
            <div
              ref={railRef}
              className={styles.rail}
              role="region"
              aria-label="Recent vehicle arrivals"
              tabIndex={0}
            >
              {state.vehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}

          {state.status === 'ready' && state.vehicles.length === 0 && <EmptyState />}

          {state.status === 'error' && (
            <EmptyState message="We couldn't reach the stock list just now. Please refresh, or browse the full showroom." />
          )}
        </div>

        <div className={styles.footer}>
          <Link href="/used-cars" className={styles.viewAllMobile}>
            View all stock
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}


function VehicleCard({ vehicle }: { vehicle: InventoryVehicle }) {
  const href = buildVehiclePermalink({ slug: vehicle.slug, reg: vehicle.reg }, '/used-cars')
  const hasImage = Boolean(vehicle.image && vehicle.image !== '/images/image.png')

  return (
    <article className={styles.card}>
      <Link
        href={href}
        className={styles.cardLink}
        aria-label={`View ${vehicle.title}`}
      >
        <span className={styles.srOnly}>View {vehicle.title}</span>
      </Link>

      <div
        className={`${styles.cardImage} ${hasImage ? '' : styles.cardImageEmpty}`}
        style={hasImage ? { backgroundImage: `url("${optimizeImageUrl(vehicle.image, { width: 640 })}")` } : undefined}
        role="img"
        aria-label={hasImage ? `${vehicle.title} photograph` : 'Photo coming soon'}
      >
        <span className={styles.justInBadge}>Just In</span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{vehicle.title}</h3>

        <ul className={styles.cardSpecs}>
          <li>
            <Calendar size={13} aria-hidden="true" />
            <span>{formatYear(vehicle.year)}</span>
          </li>
          <li>
            <Gauge size={13} aria-hidden="true" />
            <span>{formatMileage(vehicle.mileage)}</span>
          </li>
          <li>
            <Fuel size={13} aria-hidden="true" />
            <span>{vehicle.fuel}</span>
          </li>
          <li>
            <Cog size={13} aria-hidden="true" />
            <span>{vehicle.transmission}</span>
          </li>
        </ul>

        <div className={styles.cardFoot}>
          <div className={styles.priceWrap}>
            <span className={styles.priceLabel}>Forecourt price</span>
            <span className={styles.price}>{formatPrice(vehicle.price)}</span>
          </div>
          <span className={styles.cardCta} aria-hidden="true">
            Details
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </article>
  )
}


function EmptyState({ message }: { message?: string }) {
  return (
    <div className={styles.empty}>
      <p>{message || 'New arrivals are landing soon. In the meantime, the full showroom is open.'}</p>
      <Link href="/used-cars" className={styles.emptyCta}>
        Browse the showroom
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  )
}
