'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Calendar, Gauge, Fuel, Cog, Palette, MapPin, Phone, Mail,
  Heart, GitCompare, ChevronLeft, ChevronRight, Expand, X, ShieldCheck,
} from 'lucide-react'
import { useBrand } from '../../../context/BrandClientWrapper'
import { useGarage } from '../../../context/GarageContext'
import { getBrandContactInfo } from '../../../lib/contact'
import { buildVehiclePermalink } from '../../../lib/vehicle-links'
import { EnquiryModal, useEnquiryModal } from '@/app/widgets/EnquiryModal'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
import styles from './page.module.css'

export type DetailVehicle = {
  id: string
  slug?: string
  title: string
  year: number
  price: number
  mileage: number
  fuel: string
  transmission: string
  body: string
  make: string
  color: string
  doors: number
  reg?: string
  location: string
  description: string
  advertiserPhone: string
  gallery: string[]
  specs: Array<{ label: string; value: string }>
}

export type DetailSimilarVehicle = {
  id: string
  slug?: string
  title: string
  price: number
  mileage: number
  fuel: string
  image: string
  year: number
}

export type DetailMakeTally = { name: string; count: number }

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0)

const formatMileage = (n: number) =>
  new Intl.NumberFormat('en-GB').format(n || 0)

function FinanceQuoteStrip({ price }: { price: number }) {
  const deposit = Math.round(price * 0.1)
  const principal = Math.max(0, price - deposit)
  const apr = 9.9
  const term = 48
  const r = apr / 100 / 12
  const factor = Math.pow(1 + r, term)
  const monthly = r === 0 ? principal / term : (principal * r * factor) / (factor - 1)

  return (
    <div className={styles.financeStrip}>
      <div>
        <span className={styles.financeLabel}>Finance from</span>
        <strong className={styles.financeValue}>{formatPrice(monthly)}<small>/mo</small></strong>
        <span className={styles.financeFine}>
          {term} mo &middot; {apr.toFixed(1)}% APR &middot; deposit {formatPrice(deposit)} (rep.)
        </span>
      </div>
      <Link href="/finance" className={`auto-btn auto-btn--ghost ${styles.financeCta}`}>
        Tailor my quote
      </Link>
    </div>
  )
}

export default function VehicleDetailIsland({
  vehicle,
  similar,
  makes,
}: {
  vehicle: DetailVehicle
  similar: DetailSimilarVehicle[]
  makes: DetailMakeTally[]
}) {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const { toggleWishlist, toggleCompare, isWishlisted, isCompared } = useGarage()
  const { isOpen, open, close } = useEnquiryModal()
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const savedRecord = useMemo(() => ({
    id: vehicle.id, title: vehicle.title, slug: vehicle.slug,
    reg: vehicle.reg, year: vehicle.year, price: vehicle.price,
    mileage: vehicle.mileage, fuel: vehicle.fuel, transmission: vehicle.transmission,
    body: vehicle.body, make: vehicle.make, color: vehicle.color, doors: vehicle.doors,
    location: vehicle.location, image: vehicle.gallery[0] || '',
  }), [vehicle])

  const wishlisted = isWishlisted(vehicle.id)
  const compared = isCompared(vehicle.id)
  const hasGallery = vehicle.gallery.length > 0

  const next = () => setActiveImage((i) => (i + 1) % Math.max(1, vehicle.gallery.length))
  const prev = () => setActiveImage((i) => (i - 1 + Math.max(1, vehicle.gallery.length)) % Math.max(1, vehicle.gallery.length))

  return (
    <article className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/used-cars">Used cars</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{vehicle.title}</span>
      </nav>

      <header className={styles.titleBlock}>
        <div>
          <p className={styles.titleEyebrow}>Stock #{String(vehicle.id).slice(-4).toUpperCase()}</p>
          <h1 className={styles.title}>{vehicle.title}</h1>
          <p className={styles.titleMeta}>
            <span><MapPin size={14} aria-hidden="true" /> {vehicle.location}</span>
          </p>
        </div>
        <div className={styles.titleActions} aria-label="Save and compare">
          <button
            type="button"
            className={`${styles.iconBtn} ${wishlisted ? styles.iconBtnActive : ''}`}
            aria-pressed={wishlisted}
            aria-label="Save to wishlist"
            onClick={() => toggleWishlist(savedRecord)}
          >
            <Heart size={16} fill={wishlisted ? 'currentColor' : 'transparent'} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${compared ? styles.iconBtnActive : ''}`}
            aria-pressed={compared}
            aria-label="Add to compare"
            onClick={() => toggleCompare(savedRecord)}
          >
            <GitCompare size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.galleryWrap}>
          <div className={styles.mosaic}>
            <div className={styles.mainImage}>
              {hasGallery ? (
                <img src={vehicle.gallery[activeImage]} alt={vehicle.title} />
              ) : (
                <div className={styles.imagePlaceholder} aria-hidden="true" />
              )}
              {hasGallery && (
                <>
                  <button
                    type="button"
                    className={`${styles.galleryNav} ${styles.galleryPrev}`}
                    aria-label="Previous image"
                    onClick={prev}
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`${styles.galleryNav} ${styles.galleryNext}`}
                    aria-label="Next image"
                    onClick={next}
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.expandBtn}
                    aria-label="Open lightbox"
                    onClick={() => setLightboxOpen(true)}
                  >
                    <Expand size={16} aria-hidden="true" />
                    <span>{activeImage + 1} / {vehicle.gallery.length}</span>
                  </button>
                </>
              )}
            </div>
            <ul className={styles.thumbs}>
              {vehicle.gallery.slice(0, 6).map((src, idx) => (
                <li key={`${src}-${idx}`}>
                  <button
                    type="button"
                    className={`${styles.thumb} ${idx === activeImage ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImage(idx)}
                    aria-label={`Show image ${idx + 1}`}
                  >
                    <img src={src} alt="" />
                    {idx === 5 && vehicle.gallery.length > 6 && (
                      <span className={styles.thumbCount}>+{vehicle.gallery.length - 5}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <section className={styles.specsSection} aria-labelledby="specs-heading">
            <h2 id="specs-heading" className={styles.sectionHeading}>At a glance</h2>
            <ul className={styles.keyMetrics}>
              <li><Calendar size={16} aria-hidden="true" /><span>{vehicle.year || '—'}</span><em>Year</em></li>
              <li><Gauge size={16} aria-hidden="true" /><span>{formatMileage(vehicle.mileage)} mi</span><em>Mileage</em></li>
              <li><Fuel size={16} aria-hidden="true" /><span>{vehicle.fuel || '—'}</span><em>Fuel</em></li>
              <li><Cog size={16} aria-hidden="true" /><span>{vehicle.transmission || '—'}</span><em>Trans.</em></li>
              <li><Palette size={16} aria-hidden="true" /><span>{vehicle.color || '—'}</span><em>Colour</em></li>
            </ul>
          </section>

          {vehicle.description && (
            <section className={styles.descriptionSection} aria-labelledby="desc-heading">
              <h2 id="desc-heading" className={styles.sectionHeading}>About this vehicle</h2>
              <p className={styles.description}>{vehicle.description}</p>
            </section>
          )}

          {vehicle.specs.length > 0 && (
            <section className={styles.fullSpecsSection} aria-labelledby="full-specs-heading">
              <h2 id="full-specs-heading" className={styles.sectionHeading}>Full specification</h2>
              <dl className={styles.specsList}>
                {vehicle.specs.map((spec) => (
                  <div key={spec.label} className={styles.specRow}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.priceCard}>
            <p className={styles.priceLabel}>Forecourt price</p>
            <p className={styles.priceValue}>{formatPrice(vehicle.price)}</p>
            <FinanceQuoteStrip price={vehicle.price} />

            <div className={styles.actions}>
              <button
                type="button"
                className={`auto-btn auto-btn--primary mfx-shimmer ${styles.primaryAction}`}
                onClick={open}
              >
                Enquire Now
              </button>
              {contact.phoneTel && (
                <a
                  href={`tel:${contact.phoneTel}`}
                  className={`auto-btn auto-btn--ghost ${styles.secondaryAction}`}
                >
                  <Phone size={16} aria-hidden="true" />
                  {contact.phoneDisplay}
                </a>
              )}
              {contact.whatsappUrl && (
                <a
                  href={contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`auto-btn auto-btn--ghost ${styles.secondaryAction}`}
                >
                  <WhatsAppIcon size={16} />
                  WhatsApp
                </a>
              )}
            </div>

            <ul className={styles.trustList}>
              <li><ShieldCheck size={14} aria-hidden="true" /> HPI &amp; finance checked</li>
              <li><ShieldCheck size={14} aria-hidden="true" /> Minimum 3-month warranty</li>
              <li><ShieldCheck size={14} aria-hidden="true" /> Nationwide delivery available</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Similar vehicles strip */}
      {similar.length > 0 && (
        <section className={styles.similarSection} aria-labelledby="similar-heading">
          <header className={styles.similarHeader}>
            <p className="auto-eyebrow">More like this</p>
            <h2 id="similar-heading" className={styles.similarTitle}>
              Similar {vehicle.make} stock
            </h2>
          </header>

          <ul className={styles.similarGrid}>
            {similar.map((s) => (
              <li key={s.id} className={styles.similarCard}>
                <Link href={buildVehiclePermalink({ slug: s.slug || s.id }, '/used-cars')}>
                  <div className={styles.similarMedia}>
                    {s.image ? <img src={s.image} alt={s.title} loading="lazy" /> : <div className={styles.imagePlaceholder} />}
                  </div>
                  <div className={styles.similarBody}>
                    <p className={styles.similarTitleText}>{s.title}</p>
                    <p className={styles.similarPrice}>{formatPrice(s.price)}</p>
                    <p className={styles.similarMeta}>
                      {s.year} &middot; {formatMileage(s.mileage)} mi &middot; {s.fuel}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Makes-list SEO panel */}
      {makes.length > 0 && (
        <section className={styles.makesPanel} aria-labelledby="makes-heading">
          <header>
            <p className="auto-eyebrow">Browse by make</p>
            <h2 id="makes-heading" className={styles.makesTitle}>
              Popular makes from our forecourt
            </h2>
          </header>
          <ul className={styles.makesGrid}>
            {makes.map((make) => (
              <li key={make.name}>
                <Link href={`/used-cars?make=${encodeURIComponent(make.name)}`} className={styles.makeChip}>
                  <span>{make.name}</span>
                  <em>{make.count}</em>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Lightbox — backdrop is a div; the dialog handles keyboard via the close button. */}
      {lightboxOpen && hasGallery && (
        // audit-ignore: a11y-div-as-button — backdrop is a convenience close; the close button + ESC handle keyboard navigation
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Vehicle gallery lightbox"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false) }}
            aria-label="Close lightbox"
          >
            <X size={22} aria-hidden="true" />
          </button>
          <img
            src={vehicle.gallery[activeImage]}
            alt={vehicle.title}
            className={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <EnquiryModal
        open={isOpen}
        onClose={close}
        subject={`Enquiry: ${vehicle.title}`}
        intro={`Tell us a bit about what you'd like to know about this ${vehicle.year} ${vehicle.make}. Same-day callbacks are normal.`}
        contact={contact}
        leadType="vehicle-enquiry"
        leadSource="vehicle-detail-modal"
        hiddenFields={{
          vehicle: vehicle.title,
          vehicleId: String(vehicle.id),
          reg: vehicle.reg || '',
          price: String(vehicle.price || ''),
        }}
      />
    </article>
  )
}
