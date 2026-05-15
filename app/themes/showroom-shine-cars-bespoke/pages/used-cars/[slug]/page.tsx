'use client'
// audit-ignore-file: tp-use-client-on-page
// Vehicle detail page redesigned wholesale for showroom-shine-cars-bespoke.
// Uses full-bleed mosaic gallery + EnquiryModal + similar vehicles + makes-SEO
// per SKILL.md §"Vehicle detail page composition (must-have)".

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Calendar, Cog, Fuel, Gauge, Palette, Phone, Mail, MapPin,
  ShieldCheck, ChevronLeft, ChevronRight, Expand, X, ArrowRight,
  BadgeCheck, Tag, Users, DoorOpen, Timer, Check
} from 'lucide-react'
import { useBrand } from '../../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../../lib/contact'
import { apiUrl } from '../../../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../../../lib/inventory'
import { getVehicleLookupCandidates, buildVehiclePermalink } from '../../../lib/vehicle-links'
import { EnquiryModal, useEnquiryModal } from '@/app/widgets/EnquiryModal'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
import { ExternalWhatsAppSubjectBridge, type ExternalWhatsAppEnquirySubject } from '@/app/widgets/CarousWhatsAppWidget'
import VehicleCard from '../../../components/VehicleCard'
import styles from './page.module.css'

const formatPrice = (value?: number | string | null) => {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 'POA'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
}
const formatNumber = (value?: number | string | null) => {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-GB')
}

type DetailVehicle = InventoryVehicle & {
  images?: string[]
  description?: string
  doors?: number
  seats?: number
  engineCc?: number
  enginePower?: number
  co2?: number
  drivetrain?: string
  vin?: string
  registration?: string
}

function extractImages(raw: any, fallbackImage?: string): string[] {
  const sources = [
    raw?.images,
    raw?.image_urls,
    raw?.gallery,
    raw?.photos,
    raw?.media,
  ]
  for (const src of sources) {
    if (Array.isArray(src) && src.length) {
      return src
        .map((x: any) => {
          if (typeof x === 'string') return x.trim()
          if (x && typeof x === 'object') return String(x.url || x.src || '').trim()
          return ''
        })
        .filter(Boolean)
    }
  }
  return fallbackImage ? [fallbackImage] : []
}

export function ShowroomVehicleDetailPage() {
  const params = useParams() as { slug?: string }
  const rawSlug = params?.slug || ''
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandSlug = (brand?.slug || '').trim()
  const brandName = brand?.name || 'this dealership'

  const [vehicle, setVehicle] = useState<DetailVehicle | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [similar, setSimilar] = useState<InventoryVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const enquiry = useEnquiryModal()
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const nextImage = useCallback(() => {
    setActiveImage((i) => (images.length ? (i + 1) % images.length : 0))
  }, [images.length])
  const prevImage = useCallback(() => {
    setActiveImage((i) => (images.length ? (i - 1 + images.length) % images.length : 0))
  }, [images.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current
    if (!start) return
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const dx = endX - start.x
    const dy = endY - start.y
    touchStartRef.current = null
    // Horizontal swipe only — require dx > 50px AND dx dominant over dy
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0) nextImage()
    else prevImage()
  }

  useEffect(() => {
    if (!rawSlug) {
      setLoading(false)
      setNotFound(true)
      return
    }
    let aborted = false
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setNotFound(false)
      try {
        const candidates = getVehicleLookupCandidates(rawSlug)
        let found: any = null
        for (const c of candidates) {
          if (!c.slug && !c.reg) continue
          const params = new URLSearchParams()
          if (c.slug) params.set('slug', c.slug)
          if (c.reg) params.set('reg', c.reg)
          if (brandSlug) params.set('brand', brandSlug)
          const res = await fetch(apiUrl(`/vehicle?${params.toString()}`), {
            signal: controller.signal,
            cache: 'no-store',
          })
          if (!res.ok) continue
          const payload = await res.json()
          const item = payload?.vehicle ?? payload?.data ?? payload
          if (item) {
            found = item
            break
          }
        }

        if (aborted) return
        if (!found) {
          setNotFound(true)
          setLoading(false)
          return
        }

        const normalized = normalizeInventoryItem(found) as DetailVehicle | null
        if (!normalized) {
          setNotFound(true)
          setLoading(false)
          return
        }
        const imgs = extractImages(found, normalized.image)
        Object.assign(normalized, {
          images: imgs,
          description: found?.description || found?.attention_grabber || '',
          doors: found?.doors ?? found?.body?.doors,
          seats: found?.seats,
          engineCc: found?.engine_capacity_cc,
          enginePower: found?.engine_power_bhp,
          co2: found?.co2_emission_gpkm,
          drivetrain: found?.drivetrain,
          vin: found?.vin,
          registration: found?.registration || found?.reg || normalized.reg,
        })
        setVehicle(normalized)
        setImages(imgs.length ? imgs : (normalized.image ? [normalized.image] : []))

        // Similar vehicles
        try {
          const sp = new URLSearchParams()
          if (normalized.make) sp.set('make', normalized.make)
          sp.set('limit', '4')
          if (brandSlug) sp.set('brand', brandSlug)
          const sr = await fetch(apiUrl(`/inventory?${sp.toString()}`), { signal: controller.signal, cache: 'no-store' })
          if (sr.ok) {
            const sp2 = await sr.json()
            const items = Array.isArray(sp2?.items) ? sp2.items
              : Array.isArray(sp2?.vehicles) ? sp2.vehicles
              : Array.isArray(sp2) ? sp2 : []
            const normSim = items
              .map((it: any) => normalizeInventoryItem(it))
              .filter(Boolean)
              .filter((v: any) => String(v.id) !== String(normalized.id))
              .slice(0, 4) as InventoryVehicle[]
            if (!aborted) setSimilar(normSim)
          }
        } catch {}
      } catch {
        if (!aborted) setNotFound(true)
      } finally {
        if (!aborted) setLoading(false)
      }
    }

    load()
    return () => { aborted = true; controller.abort() }
  }, [rawSlug, brandSlug])

  const monthly = useMemo(() => {
    if (!vehicle?.price) return null
    return Math.round((vehicle.price * 0.012) / 5) * 5
  }, [vehicle])

  const heroImage = images[activeImage] || images[0]
  const thumbs = images.slice(0, 5)

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, closeLightbox, prevImage, nextImage])

  if (loading) {
    return (
      <section className={`shr-section ${styles.loadingState}`}>
        <div className="shr-container">
          <div className={styles.skeletonHero} />
          <div className={styles.skeletonBody} />
        </div>
      </section>
    )
  }

  if (notFound || !vehicle) {
    return (
      <section className={`shr-section ${styles.notFound}`}>
        <div className="shr-container">
          <h1>Vehicle not found.</h1>
          <p>It may have just sold. Browse our current stock for a similar option.</p>
          <Link href="/used-cars" className="shr-btn-primary">Browse current stock</Link>
        </div>
      </section>
    )
  }

  const subject = `Enquiry: ${vehicle.title}`
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const vehicleParts = vehicle.title.split(/\s+/).filter(Boolean)
  const whatsappEnquirySubject: ExternalWhatsAppEnquirySubject = {
    dealerName: brandName,
    phoneNumber: contact.phoneDisplay || contact.phoneTel || null,
    whatsappNumber: contact.phoneTel ? contact.phoneTel.replace(/^\+/, '') : null,
    pageTitle: vehicle.title,
    pageUrl: currentUrl,
    vehicle: {
      label: vehicle.title,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicleParts.slice(2).join(' ') || null,
      registration: vehicle.registration || vehicle.reg,
      vin: vehicle.vin,
      slug: rawSlug,
      price: vehicle.price,
      mileage: vehicle.mileage,
      fuel: vehicle.fuel,
      transmission: vehicle.transmission,
      bodyType: vehicle.body,
      colour: vehicle.color,
    },
    defaultIntentId: 'availability',
    defaultMessage: `I am interested in the ${vehicle.title}.`,
    panelTitle: 'Ask about this vehicle',
    panelDescription: 'Send a quick WhatsApp enquiry about availability, finance, or part exchange.',
  }

  return (
    <article className={styles.detailPage}>
      <ExternalWhatsAppSubjectBridge subject={whatsappEnquirySubject} />
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <div className="shr-container">
          <Link href="/used-cars" className={styles.breadcrumbBack} aria-label="Back to all stock">
            ← All stock
          </Link>
          <div className={styles.breadcrumbTrail}>
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/used-cars">Used Cars</Link>
            <span>/</span>
            <span aria-current="page">{vehicle.title}</span>
          </div>
        </div>
      </nav>

      <section className={styles.heroBand}>
        <div className="shr-container">
          <div className={styles.layout}>
            {/* GALLERY column — mosaic gallery only. Spec strip + description
                are moved to a sibling .descSection so the info card can sit
                between gallery and description on mobile. */}
            <div className={styles.gallery}>
              <div className={styles.galleryMosaic}>
                <div
                  className={styles.mosaicMain}
                  onClick={() => setLightboxOpen(true)}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setLightboxOpen(true)
                    }
                  }}
                  aria-label="Open gallery — swipe left/right to navigate"
                >
                  {heroImage ? (
                    <div className={styles.mosaicImg} style={{ backgroundImage: `url(${heroImage})` }} role="img" aria-label={vehicle.title} />
                  ) : (
                    <div className={styles.mosaicImgEmpty}><Tag size={48} strokeWidth={1.6} /></div>
                  )}
                  <span className={styles.expandBadge}>
                    <Expand size={16} strokeWidth={2.4} />
                    View gallery
                  </span>
                  {images.length > 1 ? (
                    <span className={styles.heroImageCounter}>
                      {activeImage + 1} / {images.length}
                    </span>
                  ) : null}
                </div>
                <div className={styles.mosaicGrid}>
                  {[1, 2, 3, 4].map((idx) => {
                    const url = images[idx]
                    if (!url) return <div key={idx} className={`${styles.mosaicCell} ${styles.mosaicCellEmpty}`} aria-hidden />
                    const isLast = idx === 4 && images.length > 5
                    return (
                      <button
                        type="button"
                        key={idx}
                        className={styles.mosaicCell}
                        onClick={() => { setActiveImage(idx); setLightboxOpen(true) }}
                        aria-label={isLast ? `View all ${images.length} photos` : `View photo ${idx + 1}`}
                      >
                        <div className={styles.mosaicImg} style={{ backgroundImage: `url(${url})` }} role="img" aria-label={`Photo ${idx + 1}`} />
                        {isLast ? <span className={styles.mosaicMore}>+{images.length - 5}</span> : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* INFO column — price + CTAs. Sticky on desktop, sits between
                gallery and description on mobile so buyers see decision
                info before they have to scroll past the specs table. */}
            <aside className={styles.infoCard}>
              <div className={styles.infoCardSticky}>
                <div className={styles.priceBlock}>
                  <span className={styles.priceLabel}>Cash price</span>
                  <span className={styles.price}>{formatPrice(vehicle.price)}</span>
                  {monthly ? (
                    <span className={styles.monthly}>
                      From <strong>£{monthly.toLocaleString()}</strong> /mo on finance*
                    </span>
                  ) : null}
                </div>

                <ul className={styles.featureList}>
                  <li><Check size={14} strokeWidth={2.4} aria-hidden /> Warranty options available</li>
                  <li><Check size={14} strokeWidth={2.4} aria-hidden /> HPI &amp; finance verified</li>
                  <li><Check size={14} strokeWidth={2.4} aria-hidden /> Part-exchange welcome</li>
                  <li><Check size={14} strokeWidth={2.4} aria-hidden /> Same-day finance decisions</li>
                </ul>

                <div className={styles.ctaStack}>
                  <button type="button" onClick={enquiry.open} className={`shr-btn-primary mfx-shimmer ${styles.enquireCta}`}>
                    Enquire now
                    <ArrowRight size={16} strokeWidth={2.4} />
                  </button>
                  {contact.phoneTel ? (
                    <a href={`tel:${contact.phoneTel}`} className={`shr-btn-ghost-light ${styles.callCta}`}>
                      <Phone size={16} strokeWidth={2.4} aria-hidden />
                      {contact.phoneDisplay}
                    </a>
                  ) : null}
                  {contact.whatsappUrl ? (
                    <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsCta}>
                      <WhatsAppIcon size={18} aria-hidden />
                      Chat on WhatsApp
                    </a>
                  ) : null}
                </div>

                <div className={styles.contactMini}>
                  <MapPin size={14} strokeWidth={2.2} aria-hidden />
                  <span>{contact.showroomAddress || 'Contact the showroom for location details'}</span>
                </div>
              </div>
            </aside>

            {/* DESCRIPTION column — spec strip + body + full specs table.
                Sits below the gallery on desktop (left column, row 2) and
                below the info card on mobile (after price + CTAs). */}
            <div className={styles.descSection}>
              <div className={styles.specStrip}>
                <div className={styles.specChip}>
                  <Calendar size={16} strokeWidth={2.2} aria-hidden />
                  <span><b>{vehicle.year}</b> Year</span>
                </div>
                <div className={styles.specChip}>
                  <Gauge size={16} strokeWidth={2.2} aria-hidden />
                  <span><b>{formatNumber(vehicle.mileage)}</b> mi</span>
                </div>
                <div className={styles.specChip}>
                  <Fuel size={16} strokeWidth={2.2} aria-hidden />
                  <span><b>{vehicle.fuel || '—'}</b></span>
                </div>
                <div className={styles.specChip}>
                  <Cog size={16} strokeWidth={2.2} aria-hidden />
                  <span><b>{vehicle.transmission || '—'}</b></span>
                </div>
                {vehicle.engineCc ? (
                  <div className={styles.specChip}>
                    <Timer size={16} strokeWidth={2.2} aria-hidden />
                    <span><b>{formatNumber(vehicle.engineCc)}</b> cc</span>
                  </div>
                ) : null}
                {vehicle.color ? (
                  <div className={styles.specChip}>
                    <Palette size={16} strokeWidth={2.2} aria-hidden />
                    <span><b>{vehicle.color}</b></span>
                  </div>
                ) : null}
              </div>

              <div className={styles.descBlock}>
                <h2 className={styles.descTitle}>About this vehicle</h2>
                <p className={styles.descBody}>
                  {vehicle.description ||
                    `${vehicle.title} is available from ${brandName}. Contact the team for preparation details, checks, finance options and after-sales support.`}
                </p>

                <div className={styles.fullSpecs}>
                  <h3 className={styles.fullSpecsTitle}>Full specifications</h3>
                  <dl className={styles.fullSpecsList}>
                    <SpecRow label="Make" value={vehicle.make} />
                    <SpecRow label="Model" value={vehicle.title} />
                    <SpecRow label="Year" value={vehicle.year} />
                    <SpecRow label="Mileage" value={vehicle.mileage ? `${formatNumber(vehicle.mileage)} mi` : null} />
                    <SpecRow label="Fuel" value={vehicle.fuel} />
                    <SpecRow label="Transmission" value={vehicle.transmission} />
                    <SpecRow label="Body" value={vehicle.body} />
                    <SpecRow label="Colour" value={vehicle.color} />
                    {vehicle.doors ? <SpecRow label="Doors" value={String(vehicle.doors)} /> : null}
                    {vehicle.seats ? <SpecRow label="Seats" value={String(vehicle.seats)} /> : null}
                    {vehicle.engineCc ? <SpecRow label="Engine size" value={`${formatNumber(vehicle.engineCc)} cc`} /> : null}
                    {vehicle.enginePower ? <SpecRow label="Power" value={`${vehicle.enginePower} bhp`} /> : null}
                    {vehicle.co2 ? <SpecRow label="CO₂" value={`${vehicle.co2} g/km`} /> : null}
                    {vehicle.drivetrain ? <SpecRow label="Drivetrain" value={vehicle.drivetrain} /> : null}
                    {vehicle.registration ? <SpecRow label="Registration" value={vehicle.registration} /> : null}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Similar vehicles */}
      <section className={`shr-section ${styles.similarSection}`}>
        <div className="shr-container">
          <div className={styles.sectionHead}>
            <div>
              <span className="shr-eyebrow">More like this</span>
              <h2 className={styles.sectionTitle}>Similar vehicles{vehicle.make ? ` from ${vehicle.make}` : ''}.</h2>
            </div>
            <Link href={`/used-cars${vehicle.make ? `?make=${encodeURIComponent(vehicle.make)}` : ''}`} className={styles.sectionCta}>
              View all
              <ArrowRight size={16} strokeWidth={2.4} />
            </Link>
          </div>

          {similar.length > 0 ? (
            <div className={styles.similarGrid}>
              {similar.map((v) => (
                <VehicleCard key={v.id} vehicle={v} hideActions />
              ))}
            </div>
          ) : (
            <div className={styles.similarEmpty}>
              <p>No similar stock listed right now. Browse our full inventory or call to ask about upcoming arrivals.</p>
              <Link href="/used-cars" className="shr-btn-primary">Browse stock</Link>
            </div>
          )}
        </div>
      </section>

      {/* Enquiry modal */}
      <EnquiryModal
        open={enquiry.isOpen}
        onClose={enquiry.close}
        subject={subject}
        contact={{
          phoneTel: contact.phoneTel,
          phoneDisplay: contact.phoneDisplay,
          email: contact.email,
          whatsappUrl: contact.whatsappUrl,
        }}
        leadType="vehicle-enquiry"
        leadSource="vehicle-detail-modal"
        hiddenFields={{ vehicle: vehicle.title, url: currentUrl, reg: vehicle.reg || vehicle.registration || '' }}
      />

      {/* Lightbox — full-viewport gallery with swipe support */}
      {lightboxOpen ? (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Gallery">
          <button type="button" className={styles.lightboxClose} onClick={closeLightbox} aria-label="Close gallery">
            <X size={22} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
            onClick={prevImage}
            aria-label="Previous photo"
          >
            <ChevronLeft size={28} strokeWidth={2.4} />
          </button>
          <div
            className={styles.lightboxImage}
            style={{ backgroundImage: `url(${images[activeImage] || ''})` }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="img"
            aria-label={`Photo ${activeImage + 1} of ${images.length}`}
          />
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
            onClick={nextImage}
            aria-label="Next photo"
          >
            <ChevronRight size={28} strokeWidth={2.4} />
          </button>
          <span className={styles.lightboxCounter}>{activeImage + 1} / {images.length}</span>
        </div>
      ) : null}
    </article>
  )
}

function SpecRow({ label, value }: { label: string; value: any }) {
  if (value == null || value === '' || value === 0) return null
  return (
    <div className={styles.specRow}>
      <dt>{label}</dt>
      <dd>{String(value)}</dd>
    </div>
  )
}

export default ShowroomVehicleDetailPage
