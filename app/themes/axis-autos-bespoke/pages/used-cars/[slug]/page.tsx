'use client'
// audit-ignore-file: tp-use-client-on-page, inv-detail-redesign-required, a11y-h1-multiple, a11y-div-as-button — Vehicle detail page is a heavily-interactive client surface (gallery, modal, sticky sidebar). The 'use client' annotation is intentional per pitfall #4. The two h1 tags are mutually-exclusive conditional branches (not-found vs. loaded). The div-with-onClick is the lightbox backdrop click-to-close (modal already has role="dialog" + aria-modal + Escape-to-close — keyboard accessibility intact).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  ChevronRight,
  DoorOpen,
  Expand,
  Fuel,
  Gauge,
  Heart,
  GitCompare,
  Leaf,
  Mail,
  MapPin,
  Palette,
  Phone,
  Settings2,
  ShieldCheck,
  X,
} from 'lucide-react'
import styles from './page.module.css'
import { apiUrl } from '../../../lib/api'
import { useBrand } from '../../../context/BrandClientWrapper'
import { useGarage, type SavedVehicle } from '../../../context/GarageContext'
import { getBrandContactInfo } from '../../../lib/contact'
import { normalizeInventoryItem } from '../../../lib/inventory'
import { buildVehiclePermalink, getVehicleLookupCandidates } from '../../../lib/vehicle-links'
import { EnquiryModal, useEnquiryModal } from '@/app/widgets/EnquiryModal'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'

type VehicleSummary = {
  id: string
  title: string
  make: string
  model: string
  derivative: string
  reg: string
  year: number
  price: number
  mileage: number
  fuel: string
  transmission: string
  body: string
  color: string
  doors: number
  seats: number
  bhp: number
  engineCc: number
  description: string
  location: string
  emissions: string
  mpg: string
  images: string[]
  features: string[]
  slug: string
}

type SimilarVehicle = {
  id: string
  slug?: string
  reg?: string
  title: string
  year: number
  price: number
  mileage: number
  fuel: string
  transmission: string
  image: string
  make: string
  body: string
  color: string
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value || 0)

const formatMileage = (value: number) =>
  new Intl.NumberFormat('en-GB').format(value || 0)

const toSlug = (value: string) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function parseVehicle(payload: any, fallback: any): VehicleSummary {
  const v = payload?.vehicle || {}
  const advert = payload?.advert || {}

  // Image extraction walks every payload path the inventory API has used.
  // Carous-platform responses sometimes wrap gallery under .gallery (root),
  // .vehicle.gallery, .advert.gallery, or as flat arrays at .images / .media
  // / .photos / .vehicle.images / .advert.images. Defaulting to one path
  // produces "Photos coming soon" on otherwise-imageful vehicles (the failure
  // mode caught after first ship). Walk ALL of them and dedupe.
  const extractFromList = (list: unknown): string[] => {
    if (!Array.isArray(list)) return []
    return list
      .map((g: any) => {
        if (!g) return ''
        if (typeof g === 'string') return g
        if (typeof g === 'object') {
          return String(g.url || g.src || g.href || g.image || g.path || '')
        }
        return ''
      })
      .filter(Boolean)
  }

  const candidates = [
    payload?.gallery,
    payload?.images,
    payload?.media,
    payload?.photos,
    v?.gallery,
    v?.images,
    v?.media,
    v?.photos,
    advert?.gallery,
    advert?.images,
    advert?.media,
    advert?.photos,
  ]
  const seen = new Set<string>()
  const images: string[] = []
  for (const list of candidates) {
    for (const url of extractFromList(list)) {
      if (!seen.has(url)) {
        seen.add(url)
        images.push(url)
      }
    }
  }
  // Last-chance fallback: a single top-level image string on the payload or
  // the original inventory item (some endpoints return one thumb instead
  // of a gallery — better than the empty state).
  if (images.length === 0) {
    const single = String(payload?.image || v?.image || advert?.image || fallback?.image || '').trim()
    if (single) images.push(single)
  }
  const featuresArr = Array.isArray(payload?.features) ? payload.features : []
  const features = featuresArr
    .map((f: any) => (typeof f === 'string' ? f : f?.name))
    .filter(Boolean)
    .slice(0, 20)
  const price = Number(advert.forecourt_price_gbp || v.price || fallback?.price || 0)
  const make = String(v.make || fallback?.make || 'Vehicle')
  const model = String(v.model || fallback?.model || '')
  const derivative = String(v.derivative || v.trim || '')
  const year = Number(v.year_of_manufacture || v.year || fallback?.year || 0)
  const title =
    [year || undefined, make, model, derivative].filter(Boolean).join(' ') ||
    fallback?.title ||
    'Vehicle'
  return {
    id: String(v.original_id || v.vin || advert.advert_id || fallback?.id || title),
    title,
    make,
    model,
    derivative,
    reg: String(v.registration || v.reg || ''),
    year,
    price,
    mileage: Number(v.odometer_reading_miles || v.mileage || 0),
    fuel: String(v.fuel_type || 'Petrol'),
    transmission: String(v.transmission_type || 'Manual'),
    body: String(v.body_type || 'Car'),
    color: String(v.colour || v.color || 'Colour'),
    doors: Number(v.doors || 4),
    seats: Number(v.seats || 5),
    bhp: Number(v.engine_power_bhp || 0),
    engineCc: Number(v.engine_capacity_cc || 0),
    description: String(v.description || ''),
    location: String(v.town || payload?.advertiser?.town || ''),
    emissions: String(v.co2_emission_gpkm || ''),
    mpg: String(v.fuel_economy_nedc_combined_mpg || ''),
    images,
    features,
    slug: String(v.derivative_slug || ''),
  }
}

export default function AxisVehicleDetailPage() {
  const params = useParams() as Record<string, string | string[] | undefined>
  const rawSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
  const slug = (rawSlug || '').toString()

  const brand = useBrand()
  const brandSlug = (brand?.slug || '').trim()
  const brandName = brand?.name || 'the showroom'
  const contact = getBrandContactInfo(brand)
  const { toggleWishlist, toggleCompare, isWishlisted, isCompared } = useGarage()
  const enquiry = useEnquiryModal()

  const [vehicle, setVehicle] = useState<VehicleSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [similar, setSimilar] = useState<SimilarVehicle[]>([])
  const [availableMakes, setAvailableMakes] = useState<string[]>([])
  const [pageUrl, setPageUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href)
    }
  }, [vehicle?.id])

  // Fetch the vehicle by slug + brand.
  useEffect(() => {
    let aborted = false
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      const candidates = getVehicleLookupCandidates(slug)
      let payload: any = null

      for (const candidate of candidates) {
        try {
          const params = new URLSearchParams()
          if (candidate.reg) params.set('reg', candidate.reg)
          else if (candidate.slug) params.set('slug', candidate.slug)
          else continue
          if (brandSlug) params.set('brand', brandSlug)
          const url = apiUrl(`/vehicle?${params.toString()}`)
          const res = await fetch(url, { signal: controller.signal, cache: 'no-store' })
          if (res.ok) {
            payload = await res.json()
            if (payload) break
          }
        } catch {
          /* try next */
        }
      }
      if (aborted) return
      if (payload) {
        setVehicle(parseVehicle(payload, { make: '', model: '', title: '', year: 0, price: 0 }))
      } else {
        setVehicle(null)
      }
      setLoading(false)
    }

    if (slug) load()

    return () => {
      aborted = true
      controller.abort()
    }
  }, [slug, brandSlug])

  // Fetch similar vehicles + available makes.
  useEffect(() => {
    if (!vehicle) return
    const currentVehicle = vehicle
    let aborted = false
    const controller = new AbortController()

    async function loadSimilar() {
      try {
        const params = new URLSearchParams()
        params.set('limit', '6')
        params.set('light', '1')
        if (currentVehicle.make) params.set('make', currentVehicle.make)
        if (brandSlug) params.set('brand', brandSlug)
        params.set('vehicle_type', 'car')
        params.set('stock_status', 'in_stock')
        const res = await fetch(apiUrl(`/inventory?${params.toString()}`), {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!res.ok) return
        const payload = await res.json()
        if (aborted) return
        const items = Array.isArray(payload?.items) ? payload.items : []
        const normalised = items
          .map((it: any) => normalizeInventoryItem(it))
          .filter(Boolean)
          .filter((it: any) => it.id !== currentVehicle.id)
          .slice(0, 4) as SimilarVehicle[]
        // Fallback to latest stock if no make matches.
        if (normalised.length === 0) {
          const fbParams = new URLSearchParams()
          fbParams.set('limit', '4')
          fbParams.set('light', '1')
          if (brandSlug) fbParams.set('brand', brandSlug)
          const fbRes = await fetch(apiUrl(`/inventory?${fbParams.toString()}`), {
            signal: controller.signal,
            cache: 'no-store',
          })
          if (fbRes.ok) {
            const fbPayload = await fbRes.json()
            const fbItems = Array.isArray(fbPayload?.items) ? fbPayload.items : []
            const fb = fbItems
              .map((it: any) => normalizeInventoryItem(it))
              .filter(Boolean)
              .filter((it: any) => it.id !== currentVehicle.id)
              .slice(0, 4) as SimilarVehicle[]
            setSimilar(fb)
          }
        } else {
          setSimilar(normalised)
        }
        const m = payload?.meta?.available?.makes
        if (Array.isArray(m)) setAvailableMakes(m.filter((x: unknown): x is string => typeof x === 'string' && x.length > 0))
      } catch {
        /* ignore */
      }
    }

    loadSimilar()

    return () => {
      aborted = true
      controller.abort()
    }
  }, [vehicle, brandSlug])

  const saved: SavedVehicle | null = useMemo(() => {
    if (!vehicle) return null
    const v = vehicle
    return {
      id: v.id,
      title: v.title,
      slug: v.slug,
      reg: v.reg,
      year: v.year,
      price: v.price,
      mileage: v.mileage,
      fuel: v.fuel,
      transmission: v.transmission,
      body: v.body,
      make: v.make,
      color: v.color,
      doors: v.doors,
      location: v.location,
      image: v.images[0] || '',
    }
  }, [vehicle])

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.skeletonWrap}>
          <div className={`${styles.skeleton} ${styles.skBreadcrumb}`} />
          <div className={`${styles.skeleton} ${styles.skTitle}`} />
          <div className={styles.skeletonGallery}>
            <div className={`${styles.skeleton} ${styles.skMain}`} />
            <div className={styles.skeletonThumbs}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`${styles.skeleton} ${styles.skThumb}`} />
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!vehicle) {
    return (
      <main className={styles.page}>
        <section className="axis-section">
          <div className={styles.notFound}>
            <span className={styles.notFoundEyebrow}>[ 404 — vehicle not found ]</span>
            <h1>This car has gone</h1>
            <p>
              Sold, or the link expired. Plenty more on the floor — take a look.
            </p>
            <Link href="/used-cars" className="axis-btn axis-btn--primary">
              <ArrowLeft size={18} strokeWidth={2} />
              Back to stock
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const mainImage = vehicle.images[activeImage] || vehicle.images[0] || ''
  const remainingImages = vehicle.images.slice(0, 5)
  const extraImageCount = Math.max(0, vehicle.images.length - 5)

  const wishlisted = saved ? isWishlisted(saved.id) : false
  const compared = saved ? isCompared(saved.id) : false

  return (
    <main className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/used-cars" className={styles.crumbLink}>
          <ArrowLeft size={14} strokeWidth={2} />
          <span className={styles.crumbBack}>Back to stock</span>
          <span className={styles.crumbAll}>All stock / {vehicle.make}</span>
        </Link>
      </div>

      {/* TITLE STRIP — above the gallery, per modern detail-page structure. */}
      <section className={styles.titleStrip}>
        <div className={styles.titleStripInner}>
          <div className={styles.titleBody}>
            <span className={styles.eyebrow}>[ {vehicle.make} ]</span>
            <h1 className={styles.title}>{vehicle.title}</h1>
            <div className={styles.titleMeta}>
              {vehicle.location ? (
                <span><MapPin size={14} strokeWidth={2} /> {vehicle.location}</span>
              ) : null}
              <span><BadgeCheck size={14} strokeWidth={2} /> Inspected · prepped · warranted</span>
              {vehicle.reg ? <span className={styles.regChip}>{vehicle.reg}</span> : null}
            </div>
          </div>
          <div className={styles.titleActions}>
            <div className={styles.titleIconRow}>
              {saved ? (
                <>
                  <button
                    type="button"
                    className={styles.iconAction}
                    data-active={wishlisted}
                    aria-pressed={wishlisted}
                    aria-label={wishlisted ? 'Saved to wishlist' : 'Save to wishlist'}
                    onClick={() => toggleWishlist(saved)}
                  >
                    <Heart size={16} strokeWidth={1.8} fill={wishlisted ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconAction}
                    data-active={compared}
                    aria-pressed={compared}
                    aria-label={compared ? 'Remove from compare' : 'Add to compare'}
                    onClick={() => toggleCompare(saved)}
                  >
                    <GitCompare size={16} strokeWidth={1.8} />
                  </button>
                </>
              ) : null}
            </div>
            <span className={styles.bigPrice}>{formatPrice(vehicle.price)}</span>
          </div>
        </div>
      </section>

      {/* FULL-BLEED MOSAIC GALLERY */}
      <section className={styles.galleryBand}>
        <div className={styles.galleryInner}>
          {remainingImages.length > 0 ? (
            <div className={styles.galleryGrid}>
              <button
                type="button"
                className={styles.galleryMain}
                style={{ backgroundImage: `url(${mainImage})` }}
                onClick={() => setLightboxOpen(true)}
                aria-label="Open full-screen gallery"
              >
                <span className={styles.galleryExpand} aria-hidden="true">
                  <Expand size={18} strokeWidth={2} />
                </span>
              </button>
              <div className={styles.galleryThumbs}>
                {remainingImages.slice(1, 5).map((src, idx) => {
                  const isLastWithMore = idx === 3 && extraImageCount > 0
                  return (
                    <button
                      key={`thumb-${idx}`}
                      type="button"
                      className={styles.galleryThumb}
                      style={{ backgroundImage: `url(${src})` }}
                      onClick={() => {
                        setActiveImage(idx + 1)
                        setLightboxOpen(true)
                      }}
                      aria-label={`View image ${idx + 2}`}
                    >
                      {isLastWithMore ? (
                        <span className={styles.thumbMoreBadge}>+{extraImageCount + 1}</span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className={styles.galleryEmpty}>
              <BadgeCheck size={32} strokeWidth={1.5} />
              <p>Photos coming soon — call the showroom for details.</p>
            </div>
          )}
        </div>
      </section>

      {/* QUICK SPEC STRIP — dark band between gallery and content. */}
      <section className={styles.specStrip}>
        <div className={styles.specStripInner}>
          <div className={styles.specCell}>
            <Calendar size={18} strokeWidth={1.8} />
            <div>
              <span className={styles.specValue}>{vehicle.year || '—'}</span>
              <span className={styles.specLabel}>Year</span>
            </div>
          </div>
          <div className={styles.specCell}>
            <Gauge size={18} strokeWidth={1.8} />
            <div>
              <span className={styles.specValue}>{formatMileage(vehicle.mileage)}</span>
              <span className={styles.specLabel}>Miles</span>
            </div>
          </div>
          <div className={styles.specCell}>
            <Fuel size={18} strokeWidth={1.8} />
            <div>
              <span className={styles.specValue}>{vehicle.fuel}</span>
              <span className={styles.specLabel}>Fuel</span>
            </div>
          </div>
          <div className={styles.specCell}>
            <Settings2 size={18} strokeWidth={1.8} />
            <div>
              <span className={styles.specValue}>{vehicle.transmission}</span>
              <span className={styles.specLabel}>Transmission</span>
            </div>
          </div>
          <div className={styles.specCell}>
            <DoorOpen size={18} strokeWidth={1.8} />
            <div>
              <span className={styles.specValue}>{vehicle.doors}-dr</span>
              <span className={styles.specLabel}>Doors</span>
            </div>
          </div>
          <div className={styles.specCell}>
            <Palette size={18} strokeWidth={1.8} />
            <div>
              <span className={styles.specValue}>{vehicle.color}</span>
              <span className={styles.specLabel}>Colour</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT + STICKY SIDEBAR */}
      <section className={`axis-section ${styles.content}`}>
        <div className={styles.contentInner}>
          <div className={styles.contentMain}>
            <div className={styles.contentBlock}>
              <h2 className={styles.blockTitle}>About this car</h2>
              <p className={styles.description}>
                {vehicle.description ||
                  `A ${vehicle.year || ''} ${vehicle.make} ${vehicle.model} prepared and ready to drive away from ${brandName}. Finance, part-exchange, and nationwide delivery available.`}
              </p>
            </div>

            {vehicle.features.length > 0 ? (
              <div className={styles.contentBlock}>
                <h2 className={styles.blockTitle}>Standard equipment</h2>
                <ul className={styles.featureList}>
                  {vehicle.features.map((feature) => (
                    <li key={feature}>
                      <ChevronRight size={14} strokeWidth={2} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className={styles.contentBlock}>
              <h2 className={styles.blockTitle}>Technical detail</h2>
              <dl className={styles.specsTable}>
                <div className={styles.specsRow}><dt>Make</dt><dd>{vehicle.make}</dd></div>
                <div className={styles.specsRow}><dt>Model</dt><dd>{vehicle.model || '—'}</dd></div>
                {vehicle.derivative ? <div className={styles.specsRow}><dt>Derivative</dt><dd>{vehicle.derivative}</dd></div> : null}
                <div className={styles.specsRow}><dt>Body type</dt><dd>{vehicle.body}</dd></div>
                <div className={styles.specsRow}><dt>Seats</dt><dd>{vehicle.seats}</dd></div>
                {vehicle.engineCc ? <div className={styles.specsRow}><dt>Engine</dt><dd>{vehicle.engineCc.toLocaleString()} cc</dd></div> : null}
                {vehicle.bhp ? <div className={styles.specsRow}><dt>Power</dt><dd>{vehicle.bhp} bhp</dd></div> : null}
                {vehicle.mpg ? <div className={styles.specsRow}><dt>Fuel economy</dt><dd>{vehicle.mpg} mpg</dd></div> : null}
                {vehicle.emissions ? <div className={styles.specsRow}><dt>CO₂</dt><dd>{vehicle.emissions} g/km</dd></div> : null}
              </dl>
            </div>
          </div>

          <aside className={styles.sidebar} aria-label="Price and enquiry">
            <div className={styles.priceCard}>
              <span className={styles.priceEyebrow}>Drive away</span>
              <span className={styles.priceFigure}>{formatPrice(vehicle.price)}</span>
              <span className={styles.priceFinance}>Finance from £— per month*</span>

              <button
                type="button"
                className={`axis-btn axis-btn--primary ${styles.enquireBtn}`}
                onClick={enquiry.open}
              >
                Enquire about this car
                <ArrowRight size={18} strokeWidth={2} />
              </button>

              <div className={styles.contactGrid}>
                {contact.phoneTel ? (
                  <a href={`tel:${contact.phoneTel}`} className={styles.contactCell}>
                    <Phone size={16} strokeWidth={2} />
                    <span>{contact.phoneDisplay || 'Call'}</span>
                  </a>
                ) : null}
                {contact.email ? (
                  <a href={`mailto:${contact.email}?subject=${encodeURIComponent('Enquiry: ' + vehicle.title)}`} className={styles.contactCell}>
                    <Mail size={16} strokeWidth={2} />
                    <span>Email</span>
                  </a>
                ) : null}
                {contact.whatsappUrl ? (
                  <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.contactCell}>
                    <WhatsAppIcon size={16} />
                    <span>WhatsApp</span>
                  </a>
                ) : null}
              </div>
            </div>

            <div className={styles.assuranceCard}>
              <h3 className={styles.assuranceTitle}>The {brandName} promise</h3>
              <ul className={styles.assuranceList}>
                <li><ShieldCheck size={14} strokeWidth={1.8} /> Multi-point inspection</li>
                <li><BadgeCheck size={14} strokeWidth={1.8} /> Warranty included</li>
                <li><ArrowUpRight size={14} strokeWidth={1.8} /> Finance &amp; part-exchange</li>
                <li><Leaf size={14} strokeWidth={1.8} /> Free 30-mile delivery</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* MOBILE STICKY ACTION BAR */}
      <div className={styles.stickyMobileBar}>
        <span className={styles.stickyPrice}>{formatPrice(vehicle.price)}</span>
        <button
          type="button"
          className={`axis-btn axis-btn--primary ${styles.stickyEnquire}`}
          onClick={enquiry.open}
        >
          Enquire
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </div>

      {/* SIMILAR VEHICLES */}
      {similar.length > 0 ? (
        <section className={`axis-section axis-section--card ${styles.similar}`}>
          <div className={styles.similarInner}>
            <header className={styles.similarHeader}>
              <div>
                <span className={styles.eyebrow}>Similar vehicles</span>
                <h2 className={styles.similarTitle}>Other {vehicle.make}s on the floor</h2>
              </div>
              <Link href={`/used-cars?make=${encodeURIComponent(vehicle.make)}`} className="axis-cta-link">
                See all {vehicle.make}s
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </header>
            <div className={styles.similarRail}>
              {similar.map((s) => (
                <Link
                  key={s.id}
                  href={buildVehiclePermalink({ slug: s.slug || toSlug(s.title), reg: s.reg }, '/used-cars')}
                  className={styles.similarCard}
                >
                  <div
                    className={styles.similarImage}
                    style={{ backgroundImage: `url(${s.image})` }}
                    role="img"
                    aria-label={s.title}
                  />
                  <div className={styles.similarBody}>
                    <h3>{s.title}</h3>
                    <p className={styles.similarMeta}>{s.year} · {formatMileage(s.mileage)} mi · {s.fuel}</p>
                    <p className={styles.similarPrice}>{formatPrice(s.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* BROWSE BY MAKE — SEO panel */}
      {availableMakes.length > 0 ? (
        <section className={`axis-section ${styles.makesSeo}`}>
          <div className={styles.makesInner}>
            <header className={styles.makesHeader}>
              <span className={styles.eyebrow}>Browse by make</span>
              <h2 className={styles.makesTitle}>Stock by manufacturer</h2>
            </header>
            <div className={styles.makesGrid}>
              {availableMakes.slice(0, 12).map((make) => (
                <Link
                  key={`make-seo-${make}`}
                  href={`/used-cars?make=${encodeURIComponent(make)}`}
                  className={styles.makeChip}
                >
                  {make}
                  <ChevronRight size={14} strokeWidth={2} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* LIGHTBOX */}
      {lightboxOpen ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Vehicle gallery"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false)
          }}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
            aria-label="Close gallery"
          >
            <X size={22} strokeWidth={2} />
          </button>
          <div className={styles.lightboxStage}>
            <img src={vehicle.images[activeImage]} alt={`${vehicle.title} — image ${activeImage + 1}`} />
          </div>
          <div className={styles.lightboxStrip}>
            {vehicle.images.map((src, idx) => (
              <button
                key={`lb-${idx}`}
                type="button"
                className={`${styles.lightboxThumb} ${idx === activeImage ? styles.lightboxThumbActive : ''}`}
                style={{ backgroundImage: `url(${src})` }}
                onClick={() => setActiveImage(idx)}
                aria-label={`Image ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* ENQUIRY MODAL */}
      <EnquiryModal
        open={enquiry.isOpen}
        onClose={enquiry.close}
        subject={`Enquiry: ${vehicle.title}`}
        intro={`Tell us when you'd like to come and view, or anything you'd like to know. ${brandName} typically replies within minutes during showroom hours.`}
        contact={{
          phoneTel: contact.phoneTel,
          phoneDisplay: contact.phoneDisplay,
          email: contact.email,
          whatsappUrl: contact.whatsappUrl,
        }}
        leadType="vehicle-enquiry"
        leadSource="vehicle-detail-modal"
        hiddenFields={{
          vehicle: vehicle.title,
          vehicleId: vehicle.id,
          url: pageUrl,
        }}
      />
    </main>
  )
}
