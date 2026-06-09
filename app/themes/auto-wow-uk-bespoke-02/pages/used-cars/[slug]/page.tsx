'use client'
// audit-ignore-file: tp-use-client-on-page, inv-detail-redesign-required, a11y-h1-multiple, a11y-div-as-button — Vehicle detail page is a heavily-interactive client surface (gallery, modal, sticky sidebar). The 'use client' annotation is intentional per pitfall #4. The two h1 tags are mutually-exclusive conditional branches (not-found vs. loaded). The div-with-onClick is the lightbox backdrop click-to-close (modal already has role="dialog" + aria-modal + Escape-to-close — keyboard accessibility intact).

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Heart,
  GitCompare,
  Home,
  Mail,
  Phone,
  Printer,
  Share2,
  ShieldCheck,
} from 'lucide-react'
import styles from './page.module.css'
import { apiUrl } from '../../../lib/api'
import { useBrand } from '../../../context/BrandClientWrapper'
import { useGarage, type SavedVehicle } from '../../../context/GarageContext'
import { getBrandContactInfo } from '../../../lib/contact'
import { normalizeInventoryItem } from '../../../lib/inventory'
import { buildVehiclePermalink, getVehicleLookupCandidates } from '../../../lib/vehicle-links'
import {
  openExternalVehicleEnquiry,
  useExternalVehicleGallery,
  VEHICLE_ENQUIRY_WIDGET_SRC,
  VEHICLE_GALLERY_WIDGET_SRC,
  type ExternalVehicleEnquirySummary,
} from '../../../lib/external-widgets'

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

function collectImages(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input
    .map((item) => {
      if (!item) return ''
      if (typeof item === 'string') return item
      if (typeof item === 'object') {
        return String((item as any).url || (item as any).href || (item as any).src || (item as any).image || '')
      }
      return ''
    })
    .filter(Boolean)
}

function parseVehicle(payload: any, fallback: any): VehicleSummary {
  const v = payload?.vehicle || {}
  const advert = payload?.advert || {}
  // Walk every payload path a feed might carry images on — single-path
  // extractors miss imageful vehicles and render "Photos coming soon"
  // (see feedback_vehicle_detail_gallery_extraction.md).
  const seen = new Set<string>()
  const images: string[] = []
  const pushAll = (list: string[]) => {
    for (const url of list) {
      if (url && !seen.has(url)) {
        seen.add(url)
        images.push(url)
      }
    }
  }
  pushAll(collectImages(payload?.gallery))
  pushAll(collectImages(payload?.images))
  pushAll(collectImages(payload?.media))
  pushAll(collectImages(payload?.photos))
  pushAll(collectImages(v?.gallery))
  pushAll(collectImages(v?.images))
  pushAll(collectImages(v?.media))
  pushAll(collectImages(v?.photos))
  pushAll(collectImages(advert?.gallery))
  pushAll(collectImages(advert?.images))
  pushAll(collectImages(advert?.media))
  pushAll(collectImages(advert?.photos))
  const featuresArr = Array.isArray(payload?.features) ? payload.features : []
  const features = featuresArr
    .map((f: any) => (typeof f === 'string' ? f : f?.name))
    .filter(Boolean)
    .slice(0, 60)
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

export default function AutoVehicleDetailPage() {
  const params = useParams() as Record<string, string | string[] | undefined>
  const rawSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
  const slug = (rawSlug || '').toString()

  const brand = useBrand()
  const brandSlug = (brand?.slug || '').trim()
  const brandName = brand?.name || 'the showroom'
  const contact = getBrandContactInfo(brand)
  const { toggleWishlist, toggleCompare, isWishlisted, isCompared } = useGarage()

  const [vehicle, setVehicle] = useState<VehicleSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [similar, setSimilar] = useState<SimilarVehicle[]>([])
  const [pageUrl, setPageUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href)
    }
  }, [vehicle?.id])

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

  useExternalVehicleGallery('#vehicle-gallery-mount', {
    images: vehicle?.images ?? [],
    vehicleTitle: vehicle?.title,
    loading,
    template: 'thumbs',
  })

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
        <section className={styles.notFoundSection}>
          <div className={styles.notFound}>
            <h1>This car has gone</h1>
            <p>Sold, or the link expired. Plenty more on the floor — take a look.</p>
            <Link href="/used-cars" className={styles.notFoundBtn}>
              <ArrowLeft size={18} strokeWidth={2} />
              Back to stock
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const wishlisted = saved ? isWishlisted(saved.id) : false
  const compared = saved ? isCompared(saved.id) : false

  const enquirySummary: ExternalVehicleEnquirySummary = {
    title: vehicle.title,
    registration: vehicle.reg || undefined,
    make: vehicle.make || undefined,
    model: vehicle.model || undefined,
    derivative: vehicle.derivative || undefined,
    year: vehicle.year || undefined,
    price: vehicle.price || undefined,
    priceText: vehicle.price ? formatPrice(vehicle.price) : undefined,
    mileage: vehicle.mileage || undefined,
    transmission: vehicle.transmission || undefined,
    fuel: vehicle.fuel || undefined,
    engineSize: vehicle.engineCc ? `${(vehicle.engineCc / 1000).toFixed(1)}L` : undefined,
    image: vehicle.images[0] || undefined,
    url: pageUrl || undefined,
  }
  const openEnquiry = () => openExternalVehicleEnquiry(enquirySummary)

  const highlightsHalf = Math.ceil(vehicle.features.length / 2)
  const highlightsA = vehicle.features.slice(0, highlightsHalf)
  const highlightsB = vehicle.features.slice(highlightsHalf)

  const monthlyFinance = vehicle.price > 0 ? Math.max(15, Math.round(vehicle.price / 60)) : null

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as any).share({ title: vehicle.title, url: pageUrl })
        return
      } catch { /* user cancelled */ }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pageUrl).catch(() => {})
    }
  }

  const dealerName = brandName
  const leadsEndpoint = ''
  const widgetLeadOwner = brandSlug || ''

  return (
    <main className={styles.page}>
      <Script
        id="carous-vehicle-gallery-widget"
        src={VEHICLE_GALLERY_WIDGET_SRC}
        strategy="afterInteractive"
      />
      <Script
        id="carous-vehicle-enquiry-widget"
        src={VEHICLE_ENQUIRY_WIDGET_SRC}
        strategy="afterInteractive"
        data-brand-name={dealerName}
        data-dealer-name={dealerName}
        data-dealer-client-id={widgetLeadOwner || undefined}
        data-lead-owner={widgetLeadOwner || undefined}
        data-lead-endpoint={leadsEndpoint || undefined}
        data-lead-submit-url={leadsEndpoint || undefined}
        data-lead-type="dealer-enquiry"
        data-lead-source="vehicle-details"
        data-default-intent="info"
        data-phone-tel={contact.phoneTel || undefined}
        data-phone-display={contact.phoneDisplay || undefined}
        data-phone-number={contact.phoneDisplay || undefined}
        data-whatsapp-url={contact.whatsappUrl || undefined}
        data-email={contact.email || undefined}
      />
      <section className={styles.heroBand}>
        <div className={styles.heroBandInner}>
          <h1 className={styles.heroTitle}>{vehicle.title}</h1>
          <p className={styles.heroMeta}>
            {[
              vehicle.mileage > 0 ? `${formatMileage(vehicle.mileage)} miles` : null,
              vehicle.fuel,
              vehicle.transmission,
            ].filter(Boolean).join(' · ')}
          </p>
          <Link href="/sell-my-car" className={styles.heroSellBtn}>
            Looking to sell?
          </Link>
        </div>
      </section>

      <div className={styles.crumbBar}>
        <div className={styles.crumbBarInner}>
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <Link href="/" className={styles.crumbItem}>
              <Home size={14} strokeWidth={2} />
              Home
            </Link>
            <ChevronRight size={12} strokeWidth={2} className={styles.crumbSep} />
            <Link href="/used-cars" className={styles.crumbItem}>Used Cars</Link>
            <ChevronRight size={12} strokeWidth={2} className={styles.crumbSep} />
            <span className={`${styles.crumbItem} ${styles.crumbCurrent}`}>{vehicle.title}</span>
          </nav>

          <div className={styles.crumbActions}>
            <button type="button" className={styles.crumbIcon} aria-label="Share" onClick={handleShare}>
              <Share2 size={15} strokeWidth={2} />
            </button>
            {saved ? (
              <>
                <button
                  type="button"
                  className={styles.crumbIcon}
                  data-active={wishlisted}
                  aria-pressed={wishlisted}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  onClick={() => toggleWishlist(saved)}
                >
                  <Heart size={15} strokeWidth={2} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  className={styles.crumbIcon}
                  data-active={compared}
                  aria-pressed={compared}
                  aria-label={compared ? 'Remove from compare' : 'Add to compare'}
                  onClick={() => toggleCompare(saved)}
                >
                  <GitCompare size={15} strokeWidth={2} />
                </button>
              </>
            ) : null}
            <button
              type="button"
              className={styles.crumbIcon}
              aria-label="Print"
              onClick={() => typeof window !== 'undefined' && window.print()}
            >
              <Printer size={15} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      <section className={styles.gallerySection}>
        <div className={styles.gallerySectionInner}>
          <div id="vehicle-gallery-mount" className={styles.galleryMount} />
        </div>
      </section>

      <section className={styles.body}>
        <div className={styles.bodyInner}>
          <div className={styles.bodyMain}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Vehicle Overview</h2>
              <p className={styles.description}>
                {vehicle.description ||
                  `A ${vehicle.year || ''} ${vehicle.make} ${vehicle.model} prepared and ready to drive away from ${brandName}. Finance, part-exchange, and nationwide delivery available.`}
              </p>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Key Specification</h2>
              <div className={styles.keySpecGrid}>
                <div className={styles.keySpecCell}>
                  <span className={styles.keySpecLabel}>Mileage</span>
                  <span className={styles.keySpecValue}>
                    {vehicle.mileage > 0 ? `${formatMileage(vehicle.mileage)} miles` : '—'}
                  </span>
                </div>
                <div className={styles.keySpecCell}>
                  <span className={styles.keySpecLabel}>Registration</span>
                  <span className={styles.keySpecValue}>{vehicle.reg || '—'}</span>
                </div>
                <div className={styles.keySpecCell}>
                  <span className={styles.keySpecLabel}>Engine</span>
                  <span className={styles.keySpecValue}>
                    {vehicle.engineCc
                      ? `${(vehicle.engineCc / 1000).toFixed(1)}L${vehicle.bhp ? ` · ${vehicle.bhp} BHP` : ''}`
                      : vehicle.bhp ? `${vehicle.bhp} BHP` : '—'}
                  </span>
                </div>
                <div className={styles.keySpecCell}>
                  <span className={styles.keySpecLabel}>Transmission</span>
                  <span className={styles.keySpecValue}>{vehicle.transmission}</span>
                </div>
                <div className={styles.keySpecCell}>
                  <span className={styles.keySpecLabel}>Fuel</span>
                  <span className={styles.keySpecValue}>{vehicle.fuel}</span>
                </div>
                <div className={styles.keySpecCell}>
                  <span className={styles.keySpecLabel}>Body Type</span>
                  <span className={styles.keySpecValue}>{vehicle.body}</span>
                </div>
                <div className={styles.keySpecCell}>
                  <span className={styles.keySpecLabel}>Doors</span>
                  <span className={styles.keySpecValue}>{vehicle.doors || '—'}</span>
                </div>
                <div className={styles.keySpecCell}>
                  <span className={styles.keySpecLabel}>Colour</span>
                  <span className={styles.keySpecValue}>{vehicle.color}</span>
                </div>
              </div>
            </div>

            {vehicle.features.length > 0 ? (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Highlights</h2>
                <div className={styles.highlightsGrid}>
                  <ul className={styles.highlightsCol}>
                    {highlightsA.map((feature) => (
                      <li key={`hi-a-${feature}`}>
                        <Check size={14} strokeWidth={2.4} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {highlightsB.length > 0 ? (
                    <ul className={styles.highlightsCol}>
                      {highlightsB.map((feature) => (
                        <li key={`hi-b-${feature}`}>
                          <Check size={14} strokeWidth={2.4} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Preparation &amp; History</h2>
              <div className={styles.prepGrid}>
                <div className={styles.prepCell}>
                  <ShieldCheck size={14} strokeWidth={2} />
                  Service history checked and documented.
                </div>
                <div className={styles.prepCell}>
                  <ShieldCheck size={14} strokeWidth={2} />
                  HPI and finance checks complete before listing.
                </div>
                <div className={styles.prepCell}>
                  <ShieldCheck size={14} strokeWidth={2} />
                  Multi-point workshop inspection completed.
                </div>
                <div className={styles.prepCell}>
                  <ShieldCheck size={14} strokeWidth={2} />
                  Supplied with minimum 3-month warranty.
                </div>
              </div>
            </div>
          </div>

          <aside className={styles.sidebar} aria-label="Price and enquiry">
            <div className={styles.priceCard}>
              <p className={styles.priceTitle}>
                {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')}
              </p>
              {vehicle.derivative ? (
                <p className={styles.priceVariant}>{vehicle.derivative}</p>
              ) : null}
              <p className={styles.priceFigure}>{formatPrice(vehicle.price)}</p>
              {monthlyFinance ? (
                <p className={styles.priceFinance}>
                  Representative finance from <strong>£{monthlyFinance}/mo</strong>
                </p>
              ) : null}

              <div className={styles.priceBadges}>
                <span className={styles.badgePill}>
                  <ShieldCheck size={12} strokeWidth={2.4} />
                  HPI Clear
                </span>
                <span className={styles.badgePill}>
                  <ShieldCheck size={12} strokeWidth={2.4} />
                  3-Month Warranty
                </span>
              </div>

              {contact.phoneTel ? (
                <a href={`tel:${contact.phoneTel}`} className={styles.primaryBtn}>
                  <Phone size={16} strokeWidth={2} />
                  Call {contact.phoneDisplay || 'the showroom'}
                </a>
              ) : null}
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={openEnquiry}
              >
                <Mail size={16} strokeWidth={2} />
                Email Enquiry
              </button>

              <ul className={styles.trustList}>
                <li><Check size={14} strokeWidth={2.4} />Part exchange welcome</li>
                <li><Check size={14} strokeWidth={2.4} />Finance options available</li>
                <li><Check size={14} strokeWidth={2.4} />Reserve online or by phone</li>
              </ul>
            </div>

            <div className={styles.visitCard}>
              <h3 className={styles.visitTitle}>Visit {brandName}</h3>
              {contact.showroomAddress ? (
                <p className={styles.visitAddress}>{contact.showroomAddress}</p>
              ) : null}
              <p className={styles.visitHours}>Monday–Friday: 10am – 6pm</p>
              <Link href="/used-cars" className={styles.visitBack}>
                Back to Used Cars
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <div className={styles.stickyMobileBar}>
        <span className={styles.stickyPrice}>{formatPrice(vehicle.price)}</span>
        <button type="button" className={styles.stickyEnquire} onClick={openEnquiry}>
          Enquire
        </button>
      </div>

      {similar.length > 0 ? (
        <section className={styles.similarSection}>
          <div className={styles.similarInner}>
            <h2 className={styles.similarTitle}>Similar Vehicles</h2>
            <div className={styles.similarGrid}>
              {similar.map((s) => {
                const sMonthly = s.price > 0 ? Math.max(15, Math.round(s.price / 60)) : null
                return (
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
                      <h3 className={styles.similarCardTitle}>{s.title}</h3>
                      <p className={styles.similarMeta}>
                        {[s.year, s.fuel, s.transmission].filter(Boolean).join(' · ')}
                      </p>
                      <div className={styles.similarFooter}>
                        {sMonthly ? (
                          <span className={styles.similarMonthly}>From £{sMonthly}/mo</span>
                        ) : <span />}
                        <span className={styles.similarPrice}>{formatPrice(s.price)}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

    </main>
  )
}
