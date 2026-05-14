'use client'
// audit-ignore-file: tp-use-client-on-page, data-useeffect-fetch, a11y-h1-multiple, perf-raw-img, perf-img-no-dimensions, mobile-max-width-query, brand-hardcoded-color — vehicle detail page is the canonical client-component exception; vehicle lookup is slug-driven so initial fetch must happen client-side; multiple h1s are mutually-exclusive render branches (loading / error / content); gallery + similar images are dynamic remote URLs (next/image remote host config differs per dealer); UK number plate yellow + WhatsApp official green are intentionally outside brand-token system; the mobile-only sticky bar uses max-width to scope to small screens only.

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { EnquiryModal, useEnquiryModal } from '@/app/widgets/EnquiryModal'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
import { apiUrl } from '../../../lib/api'
import { useBrand } from '../../../context/BrandClientWrapper'
import { useGarage } from '../../../context/GarageContext'
import { getBrandContactInfo } from '../../../lib/contact'
import { normalizeInventoryItem, type InventoryVehicle } from '../../../lib/inventory'
import { getVehicleLookupCandidates } from '../../../lib/vehicle-links'
import VehicleCard from '../../../components/VehicleCard'
import styles from './page.module.css'

type VehicleDetails = {
  vehicle: InventoryVehicle
  raw: Record<string, any>
  gallery: string[]
  description: string
  features: string[]
  specs: Array<{ label: string; value: string }>
}

function fmtPrice(n: number | string) {
  const num = Number(n)
  if (!Number.isFinite(num) || num <= 0) return '£—'
  return `£${num.toLocaleString('en-GB')}`
}
function fmtMileage(n: number | string) {
  const num = Number(n)
  if (!Number.isFinite(num) || num <= 0) return '—'
  return `${num.toLocaleString('en-GB')} mi`
}
function fmtNumber(n: number | string) {
  const num = Number(n)
  if (!Number.isFinite(num)) return '—'
  return num.toLocaleString('en-GB')
}
function pickString(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim()
    if (typeof c === 'number' && Number.isFinite(c)) return String(c)
  }
  return ''
}

function buildSpecs(raw: Record<string, any>, normalized: InventoryVehicle) {
  const v = raw?.vehicle || raw
  const advert = raw?.advert || raw
  return [
    { label: 'Year', value: pickString(v.year_of_manufacture, v.year, normalized.year) || '—' },
    { label: 'Mileage', value: fmtMileage(pickString(v.odometer_reading_miles, v.mileage, normalized.mileage)) },
    { label: 'Fuel', value: pickString(v.fuel_type, normalized.fuel) || '—' },
    { label: 'Transmission', value: pickString(v.transmission_type, normalized.transmission) || '—' },
    { label: 'Body', value: pickString(v.body_type, normalized.body) || '—' },
    { label: 'Doors', value: pickString(v.doors, normalized.doors) || '—' },
    { label: 'Seats', value: pickString(v.seats) || '—' },
    { label: 'Engine', value: pickString(v.engine_capacity_cc) ? `${v.engine_capacity_cc}cc` : '—' },
    { label: 'BHP', value: pickString(v.engine_power_bhp) || '—' },
    { label: 'Drive', value: pickString(v.drivetrain) || '—' },
    { label: 'CO₂', value: pickString(v.co2_emission_gpkm) ? `${v.co2_emission_gpkm} g/km` : '—' },
    { label: 'Colour', value: pickString(v.colour, normalized.color) || '—' },
    { label: 'Registration', value: pickString(v.registration, normalized.reg) || '—' },
    { label: 'Stock status', value: pickString(advert.stock_status, v.stock_status) || 'In stock' },
  ]
}

function collectGallery(raw: Record<string, any>, fallbackImage: string): string[] {
  const v = raw?.vehicle || raw
  const arr: string[] = []
  const pickUrl = (item: any) => {
    if (!item) return ''
    if (typeof item === 'string') return item.trim()
    if (typeof item !== 'object') return ''
    return pickString(
      item.url,
      item.href,
      item.src,
      item.image,
      item.large_url,
      item.full_url,
      item.original,
      item.large,
      item.thumbnail
    )
  }
  const push = (source: unknown) => {
    if (!source) return
    if (!Array.isArray(source)) {
      const single = pickUrl(source)
      if (single) arr.push(single)
      return
    }
    for (const item of source) {
      const url = pickUrl(item)
      if (url) arr.push(url)
    }
  }
  push(raw?.gallery)
  push(v?.gallery)
  push(raw?.media)
  push(v?.media)
  push(raw?.images)
  push(v?.images)
  push(raw?.photos)
  push(v?.photos)
  push(raw?.vehicle?.images)
  push(raw?.vehicle?.gallery)
  push(raw?.vehicle?.media)
  if (typeof v?.image === 'string' && v.image.trim()) arr.push(v.image.trim())
  if (typeof raw?.image === 'string' && raw.image.trim()) arr.push(raw.image.trim())
  const unique = Array.from(new Set(arr))
  return unique.length ? unique : (fallbackImage ? [fallbackImage] : [])
}

function collectFeatures(raw: Record<string, any>): string[] {
  const v = raw?.vehicle || raw
  const sources = [raw?.features, v?.features, raw?.optional_extras, v?.optional_extras]
  const out: string[] = []
  for (const source of sources) {
    if (!Array.isArray(source)) continue
    for (const item of source) {
      if (typeof item === 'string' && item.trim()) out.push(item.trim())
      else if (item && typeof item === 'object') {
        const name = (item as any).name || (item as any).label || (item as any).feature
        if (typeof name === 'string' && name.trim()) out.push(name.trim())
      }
    }
  }
  return Array.from(new Set(out)).slice(0, 18)
}

/* Inline icon set for the quick-specs band — keeps the page self-contained
   without adding a lucide import just for 6 glyphs. */
const Icon = {
  Calendar: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18" /><path d="M8 2v4" /><path d="M16 2v4" />
    </svg>
  ),
  Gauge: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 13l3-7" /><circle cx="12" cy="14" r="1.5" fill="currentColor" /><path d="M5 19a9 9 0 1 1 14 0" />
    </svg>
  ),
  Fuel: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16" /><path d="M2 21h14" /><path d="M14 8h2a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V8l-3-3" />
    </svg>
  ),
  Gear: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" /><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  ),
  Car: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 17h14l-1.5-6a2 2 0 0 0-2-1.5h-7a2 2 0 0 0-2 1.5L5 17z" /><circle cx="8" cy="18.5" r="1.5" /><circle cx="16" cy="18.5" r="1.5" />
    </svg>
  ),
  Bolt: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
  Heart: ({ filled = false }: { filled?: boolean }) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>
    </svg>
  ),
  Compare: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 3l4 4-4 4" /><path d="M20 7H4" /><path d="M8 21l-4-4 4-4" /><path d="M4 17h16" />
    </svg>
  ),
  Expand: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"/>
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
}

export function KainVehicleDetailPage() {
  const params = useParams() as Record<string, string | string[]> | null
  const slugParam = Array.isArray(params?.slug) ? params!.slug[0] : (params?.slug as string | undefined) || ''

  const brand = useBrand()
  const brandSlug = brand?.slug
  const brandName = brand?.name || 'The showroom'
  const contact = getBrandContactInfo(brand)
  const { isWishlisted, toggleWishlist, isCompared, toggleCompare } = useGarage()
  const enquiry = useEnquiryModal()

  const [details, setDetails] = useState<VehicleDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [similar, setSimilar] = useState<InventoryVehicle[]>([])

  const candidates = useMemo(() => getVehicleLookupCandidates(slugParam), [slugParam])

  useEffect(() => {
    if (!brandSlug || candidates.length === 0) return
    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      let found: { raw: Record<string, any>; vehicle: InventoryVehicle } | null = null

      for (const c of candidates) {
        if (cancelled) return
        const qs = new URLSearchParams({ brand: brandSlug as string })
        if (c.slug) qs.set('slug', c.slug)
        if (c.reg) qs.set('reg', c.reg)
        try {
          const res = await fetch(apiUrl(`/vehicle?${qs.toString()}`), { cache: 'no-store' })
          if (res.ok) {
            const data = await res.json()
            const raw = data?.vehicle ? data : (data?.data || data)
            const normalized = normalizeInventoryItem(raw)
            if (normalized) { found = { raw, vehicle: normalized }; break }
          }
        } catch {}
      }

      if (!found) {
        try {
          const qs = new URLSearchParams({ brand: brandSlug as string, per_page: '500', light: '0' })
          const res = await fetch(apiUrl(`/inventory?${qs.toString()}`), { cache: 'no-store' })
          if (res.ok) {
            const data = await res.json()
            const items: any[] = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : [])
            for (const c of candidates) {
              const match = items.find((it) => {
                const v = it.vehicle || it
                const slugVal = pickString(it.slug, v.slug, v.derivative_slug, it.derivative_slug)
                const regVal = pickString(v.registration, v.reg, it.reg).replace(/\s+/g, '').toUpperCase()
                return (
                  (c.slug && slugVal && slugVal.toLowerCase() === c.slug.toLowerCase()) ||
                  (c.reg && regVal && regVal === c.reg)
                )
              })
              if (match) {
                const normalized = normalizeInventoryItem(match)
                if (normalized) { found = { raw: match, vehicle: normalized }; break }
              }
            }
          }
        } catch {}
      }

      if (cancelled) return
      if (!found) {
        setError('Vehicle not found — it may have just been sold.')
        setLoading(false)
        return
      }

      const gallery = collectGallery(found.raw, found.vehicle.image)
      setDetails({
        vehicle: found.vehicle,
        raw: found.raw,
        gallery,
        description: pickString((found.raw as any).description, (found.raw?.vehicle || {}).description, (found.raw?.advert || {}).description),
        features: collectFeatures(found.raw),
        specs: buildSpecs(found.raw, found.vehicle),
      })
      setLoading(false)
      setGalleryIndex(0)
    }

    load()
    return () => { cancelled = true }
  }, [brandSlug, candidates])

  useEffect(() => {
    if (!brandSlug || !details) return
    let cancelled = false
    const make = details.vehicle.make
    const qs = new URLSearchParams({ brand: brandSlug, per_page: '8', light: '1', sort: 'price_desc' })
    if (make) qs.set('make', make)
    fetch(apiUrl(`/inventory?${qs.toString()}`), { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled || !data) return
        const items: any[] = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : [])
        const norm = items.map((it) => normalizeInventoryItem(it)).filter((v): v is InventoryVehicle => !!v)
        const filtered = norm.filter((v) => v.id !== details.vehicle.id).slice(0, 4)
        if (filtered.length > 0) {
          setSimilar(filtered)
        } else {
          fetch(apiUrl(`/inventory?brand=${encodeURIComponent(brandSlug)}&per_page=4&light=1&sort=date_desc`), { cache: 'no-store' })
            .then((r) => r.ok ? r.json() : null)
            .then((d) => {
              if (cancelled || !d) return
              const fallbackItems: any[] = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])
              const f = fallbackItems.map((it) => normalizeInventoryItem(it)).filter((v): v is InventoryVehicle => !!v && v.id !== details.vehicle.id).slice(0, 4)
              setSimilar(f)
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [brandSlug, details])

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingWrap}>
          <p className={styles.loadingEyebrow}>Loading vehicle…</p>
          <div className={styles.loadingBars} aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>
      </main>
    )
  }

  if (error || !details) {
    return (
      <main className={styles.page}>
        <section className={`kain-section ${styles.notFound}`}>
          <div className={styles.notFoundInner}>
            <p className="kain-eyebrow">Looks like it’s gone</p>
            <h1>Vehicle no longer available</h1>
            <p>{error || 'This car has been sold or moved off the forecourt.'}</p>
            <div className={styles.notFoundActions}>
              <Link href="/used-cars" className="kain-btn kain-btn--primary">Browse current stock</Link>
              <Link href="/recently-sold" className="kain-btn kain-btn--ghost-light">View recently sold</Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const { vehicle, raw, gallery, description, features, specs } = details
  const monthly = vehicle.price ? Math.round((vehicle.price * 1.099) / 48) : 0
  const saved = isWishlisted(vehicle.id)
  const inCompare = isCompared(vehicle.id)

  function vehiclePayload() {
    return { slug: vehicle.id, title: vehicle.title, price: vehicle.price, image: vehicle.image }
  }

  const galleryActive = gallery[galleryIndex] || vehicle.image
  const visibleThumbs = gallery.slice(0, 4)
  const extraCount = Math.max(0, gallery.length - visibleThumbs.length)
  const totalPhotos = gallery.length
  const enquirySubject = `Enquiry: ${vehicle.title}`
  const hiddenFields = {
    vehicle: vehicle.title,
    vehicleId: vehicle.id,
    vehiclePrice: String(vehicle.price),
    vehicleSlug: vehicle.slug || vehicle.id,
  }

  const rawV = raw?.vehicle || raw
  const bhp = pickString(rawV.engine_power_bhp)
  const stockNumber = vehicle.id.slice(-8).toUpperCase()

  return (
    <main className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumbRow}>
        <div className={styles.breadcrumbInner}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span className={styles.crumbSep}>·</span>
            <Link href="/used-cars">All stock</Link>
            <span className={styles.crumbSep}>·</span>
            <span className={styles.crumbCurrent}>{vehicle.title}</span>
          </nav>
        </div>
      </div>

      {/* ========== HERO BAND: title strip above gallery, full-width container ========== */}
      <section className={styles.heroBand} aria-label="Vehicle hero">
        <div className={styles.heroInner}>
          {/* Title strip — eyebrow + h1 + meta chips + save/compare actions */}
          <header className={styles.titleStrip}>
            <div className={styles.titleStripText}>
              <p className={styles.eyebrow}>{vehicle.make}{vehicle.body ? ` · ${vehicle.body}` : ''}</p>
              <h1 className={styles.title}>{vehicle.title}</h1>
              <div className={styles.titleMeta}>
                {vehicle.reg && <span className={styles.regChip} aria-label={`Registration ${vehicle.reg}`}>{vehicle.reg}</span>}
                <span className={styles.stockPill}>Stock&nbsp;#{stockNumber}</span>
                <span className={styles.statusBadge}>
                  <span className="mfx-pulse-dot" aria-hidden="true" />
                  <span>In stock · Reserve online</span>
                </span>
              </div>
            </div>
            <div className={styles.titleStripActions}>
              <button
                type="button"
                className={`${styles.iconAction} ${saved ? styles.iconActionOn : ''}`}
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={saved}
                onClick={() => toggleWishlist(vehiclePayload() as any)}
              >
                <Icon.Heart filled={saved} />
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                type="button"
                className={`${styles.iconAction} ${inCompare ? styles.iconActionOn : ''}`}
                aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
                aria-pressed={inCompare}
                onClick={() => toggleCompare(vehiclePayload() as any)}
              >
                <Icon.Compare />
                <span>{inCompare ? 'In compare' : 'Compare'}</span>
              </button>
            </div>
          </header>

          {/* Gallery: large hero image + 4-up mosaic right (desktop) / scroll rail (mobile) */}
          <section className={styles.gallery} aria-label="Vehicle photos">
            <div
              role="button"
              tabIndex={0}
              className={styles.galleryMain}
              onClick={() => setLightboxOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setLightboxOpen(true)
                }
              }}
              aria-label="Open photo in full screen"
            >
              {galleryActive ? (
                <img src={galleryActive} alt={vehicle.title} />
              ) : (
                <span className={styles.mediaPlaceholder}>Photo coming soon</span>
              )}
              <span className={styles.galleryCounter} aria-hidden="true">
                {galleryIndex + 1} / {totalPhotos}
              </span>
              <span className={styles.galleryExpand} aria-hidden="true">
                <Icon.Expand />
                <span>View all</span>
              </span>
              {totalPhotos > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.galleryMobileNav} ${styles.galleryMobilePrev}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)
                    }}
                    aria-label="Previous photo"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className={`${styles.galleryMobileNav} ${styles.galleryMobileNext}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      setGalleryIndex((i) => (i + 1) % gallery.length)
                    }}
                    aria-label="Next photo"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            <div className={styles.galleryThumbs}>
              {visibleThumbs.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  className={`${styles.thumb} ${galleryIndex === i ? styles.thumbActive : ''}`}
                  onClick={() => (extraCount > 0 && i === visibleThumbs.length - 1 ? setLightboxOpen(true) : setGalleryIndex(i))}
                  aria-label={extraCount > 0 && i === visibleThumbs.length - 1 ? `View all ${totalPhotos} photos` : `Show photo ${i + 1}`}
                >
                  <img src={src} alt="" />
                  {extraCount > 0 && i === visibleThumbs.length - 1 && (
                    <span className={styles.thumbCountBadge}>+{extraCount}</span>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>

      {/* ========== QUICK SPECS BAND: icon-led horizontal strip ========== */}
      <section className={styles.quickSpecs} aria-label="Key specifications">
        <div className={styles.quickSpecsInner}>
          <div className={styles.qsItem}>
            <span className={styles.qsIcon}><Icon.Calendar /></span>
            <span className={styles.qsLabel}>Year</span>
            <span className={styles.qsValue}>{vehicle.year || '—'}</span>
          </div>
          <div className={styles.qsItem}>
            <span className={styles.qsIcon}><Icon.Gauge /></span>
            <span className={styles.qsLabel}>Mileage</span>
            <span className={styles.qsValue}>{fmtMileage(vehicle.mileage)}</span>
          </div>
          <div className={styles.qsItem}>
            <span className={styles.qsIcon}><Icon.Fuel /></span>
            <span className={styles.qsLabel}>Fuel</span>
            <span className={styles.qsValue}>{vehicle.fuel || '—'}</span>
          </div>
          <div className={styles.qsItem}>
            <span className={styles.qsIcon}><Icon.Gear /></span>
            <span className={styles.qsLabel}>Transmission</span>
            <span className={styles.qsValue}>{vehicle.transmission || '—'}</span>
          </div>
          <div className={styles.qsItem}>
            <span className={styles.qsIcon}><Icon.Car /></span>
            <span className={styles.qsLabel}>Body</span>
            <span className={styles.qsValue}>{vehicle.body || '—'}</span>
          </div>
          {bhp && (
            <div className={styles.qsItem}>
              <span className={styles.qsIcon}><Icon.Bolt /></span>
              <span className={styles.qsLabel}>Power</span>
              <span className={styles.qsValue}>{bhp} bhp</span>
            </div>
          )}
        </div>
      </section>

      {/* ========== DETAIL GRID: content + sticky sidebar ========== */}
      <div className={styles.detailGrid}>
        <div className={styles.contentColumn}>
          {description && (
            <section className={styles.section} aria-labelledby="vehicle-description-heading">
              <h2 id="vehicle-description-heading" className={styles.sectionTitle}>
                <span className={styles.sectionEyebrow}>Overview</span>
                From our showroom notes
              </h2>
              <p className={styles.descriptionBody}>{description}</p>
            </section>
          )}

          {features.length > 0 && (
            <section className={styles.section} aria-labelledby="vehicle-features-heading">
              <h2 id="vehicle-features-heading" className={styles.sectionTitle}>
                <span className={styles.sectionEyebrow}>What's included</span>
                Features & extras
              </h2>
              <ul className={styles.featuresList}>
                {features.map((f) => (
                  <li key={f}><span className={styles.featureBullet}><Icon.Check /></span>{f}</li>
                ))}
              </ul>
            </section>
          )}

          <section className={styles.section} aria-labelledby="vehicle-spec-heading">
            <h2 id="vehicle-spec-heading" className={styles.sectionTitle}>
              <span className={styles.sectionEyebrow}>Full breakdown</span>
              Specifications
            </h2>
            <dl className={styles.specGrid}>
              {specs.map((s) => (
                <div key={s.label} className={styles.specRow}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.financeStrip} aria-labelledby="vehicle-finance-heading">
            <div className={styles.financeStripText}>
              <p className={styles.financeEyebrow}>Indicative finance</p>
              <h2 id="vehicle-finance-heading" className={styles.financeTitle}>
                {monthly > 0 ? <>From <em>£{fmtNumber(monthly)}/mo</em></> : 'Apply for a quote'}
              </h2>
              <p className={styles.financeLead}>
                Representative example on a 48-month HP at 9.9% APR with 10% deposit. Subject to status.
              </p>
            </div>
            <div className={styles.financeActions}>
              <Link href="/finance" className="kain-btn kain-btn--gold">Apply for finance</Link>
              <Link href={`/finance?vehicle=${encodeURIComponent(vehicle.title)}`} className="kain-btn kain-btn--ghost-dark">Personalise quote</Link>
            </div>
          </section>
        </div>

        {/* Sticky sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.priceBlock}>
              <p className={styles.sidebarEyebrow}>Forecourt price</p>
              <p className={styles.priceLg}>{fmtPrice(vehicle.price)}</p>
              {monthly > 0 && (
                <p className={styles.monthlyLine}>
                  or from <strong>£{fmtNumber(monthly)}/mo</strong>
                </p>
              )}
            </div>

            <button
              type="button"
              className={`kain-btn kain-btn--primary ${styles.primaryCta} mfx-shimmer`}
              onClick={enquiry.open}
            >
              Enquire Now
            </button>

            <div className={styles.contactGrid}>
              {contact.phoneTel && (
                <a href={`tel:${contact.phoneTel}`} className={styles.contactBtn} aria-label="Call">
                  <Icon.Phone /><span>Call</span>
                </a>
              )}
              {contact.whatsappUrl && (
                <a
                  href={contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.contactBtn} ${styles.contactWhats}`}
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon size={16} /><span>WhatsApp</span>
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}?subject=${encodeURIComponent(enquirySubject)}`}
                  className={styles.contactBtn}
                  aria-label="Email"
                >
                  <Icon.Mail /><span>Email</span>
                </a>
              )}
            </div>

            <div className={styles.sidebarDivider} aria-hidden="true" />

            <ul className={styles.sidebarFacts}>
              <li><span>Stock #</span><strong>{stockNumber}</strong></li>
              {(contact.city || contact.county) && (
                <li><span>Location</span><strong>{contact.city || contact.county}</strong></li>
              )}
              <li><span>Warranty</span><strong>Included</strong></li>
              <li><span>Delivery</span><strong>UK-wide</strong></li>
            </ul>

            <p className={styles.sidebarNote}>
              Viewings are appointment-only. Book online or via WhatsApp — we'll have the car prepped and ready.
            </p>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className={styles.similarSection} aria-labelledby="similar-vehicles-heading">
          <div className={styles.similarInner}>
            <header className={styles.similarHead}>
              <div>
                <p className="kain-eyebrow">More like this</p>
                <h2 id="similar-vehicles-heading" className={styles.similarTitle}>
                  Similar vehicles from {brandName}
                </h2>
              </div>
              <Link href="/used-cars" className="kain-cta-link">Browse all stock</Link>
            </header>
            <div className={styles.similarGrid}>
              {similar.map((v) => (
                <div key={v.id} className={styles.similarCell}>
                  <VehicleCard vehicle={v} hideActions />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {lightboxOpen && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Photo viewer">
          <button type="button" className={styles.lightboxClose} onClick={() => setLightboxOpen(false)} aria-label="Close photo viewer">✕</button>
          <button type="button" className={styles.lightboxNav} data-side="prev" onClick={() => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)} aria-label="Previous photo">‹</button>
          <img src={galleryActive} alt={vehicle.title} className={styles.lightboxImg} />
          <button type="button" className={styles.lightboxNav} data-side="next" onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)} aria-label="Next photo">›</button>
          <div className={styles.lightboxFooter}>{galleryIndex + 1} / {gallery.length}</div>
        </div>
      )}

      <EnquiryModal
        open={enquiry.isOpen}
        onClose={enquiry.close}
        subject={enquirySubject}
        intro={`Tell us when you'd like to see the ${vehicle.title}. We typically reply within the hour during showroom times.`}
        contact={{
          phoneTel: contact.phoneTel,
          phoneDisplay: contact.phoneDisplay,
          email: contact.email,
          whatsappUrl: contact.whatsappUrl,
        }}
        leadType="vehicle-enquiry"
        leadSource="vehicle-detail-modal"
        hiddenFields={hiddenFields}
        submitLabel="Send enquiry"
        successHeading="Enquiry received"
        successBody={`Thanks — the team will be in touch about the ${vehicle.title} during showroom hours.`}
      />
    </main>
  )
}

export default KainVehicleDetailPage
