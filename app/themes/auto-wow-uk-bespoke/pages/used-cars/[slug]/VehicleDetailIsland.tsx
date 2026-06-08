'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Calendar, Gauge, Fuel, Cog, Car, Palette,
  Phone, Mail, Share2, Heart, GitCompare, Printer,
  ChevronRight as ChevronRightIcon, ChevronDown, ChevronUp,
  Check, FileText, Search, Wrench, ShieldCheck, Home,
} from 'lucide-react'
import { useBrand } from '../../../context/BrandClientWrapper'
import { useGarage } from '../../../context/GarageContext'
import { getBrandContactInfo } from '../../../lib/contact'
import { buildVehiclePermalink } from '../../../lib/vehicle-links'
import { EnquiryModal, useEnquiryModal } from '@/app/widgets/EnquiryModal'
import VehicleGallery from '@/app/widgets/VehicleGallery'
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

const OVERVIEW_PREVIEW_CHAR_LIMIT = 320

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0)

const formatMileage = (n: number) =>
  new Intl.NumberFormat('en-GB').format(n || 0)

function splitPreviewText(text: string, limit: number) {
  const normalized = text.trim()
  if (normalized.length <= limit) return { preview: normalized, remainder: '' }
  const safeCutoff = Math.max(80, Math.floor(limit * 0.6))
  const lastSpace = normalized.lastIndexOf(' ', limit)
  const cutoff = lastSpace >= safeCutoff ? lastSpace : limit
  return {
    preview: normalized.slice(0, cutoff).trimEnd(),
    remainder: normalized.slice(cutoff).trimStart(),
  }
}

async function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  await new Promise<void>((resolve, reject) => {
    const helper = document.createElement('textarea')
    helper.value = text
    helper.setAttribute('readonly', '')
    helper.style.position = 'fixed'
    helper.style.opacity = '0'
    document.body.appendChild(helper)
    helper.select()
    try {
      const copied = document.execCommand('copy')
      document.body.removeChild(helper)
      copied ? resolve() : reject(new Error('Copy failed'))
    } catch (err) {
      document.body.removeChild(helper)
      reject(err)
    }
  })
}

function computeMonthly(price: number) {
  const deposit = Math.round(price * 0.1)
  const principal = Math.max(0, price - deposit)
  const apr = 9.9
  const term = 48
  const r = apr / 100 / 12
  const factor = Math.pow(1 + r, term)
  return r === 0 ? principal / term : (principal * r * factor) / (factor - 1)
}

export default function VehicleDetailIsland({
  vehicle,
  similar,
}: {
  vehicle: DetailVehicle
  similar: DetailSimilarVehicle[]
  makes: DetailMakeTally[]
}) {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const { toggleWishlist, toggleCompare, isWishlisted, isCompared } = useGarage()
  const { isOpen: enquiryOpen, open: openEnquiry, close: closeEnquiry } = useEnquiryModal()

  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [shareLabel, setShareLabel] = useState('Share')
  const [isShareDone, setIsShareDone] = useState(false)
  const shareResetTimerRef = useRef<number | null>(null)

  const savedRecord = useMemo(() => ({
    id: vehicle.id, title: vehicle.title, slug: vehicle.slug,
    reg: vehicle.reg, year: vehicle.year, price: vehicle.price,
    mileage: vehicle.mileage, fuel: vehicle.fuel, transmission: vehicle.transmission,
    body: vehicle.body, make: vehicle.make, color: vehicle.color, doors: vehicle.doors,
    location: vehicle.location, image: vehicle.gallery[0] || '',
  }), [vehicle])

  const wishlisted = isWishlisted(vehicle.id)
  const compared = isCompared(vehicle.id)

  useEffect(() => () => {
    if (shareResetTimerRef.current) window.clearTimeout(shareResetTimerRef.current)
  }, [])

  useEffect(() => {
    setOverviewExpanded(false)
  }, [vehicle.description])

  const overviewText = vehicle.description || 'Vehicle description currently unavailable. Contact us for the full specification and history.'
  const { preview: overviewPreview, remainder: overviewRemainder } = useMemo(
    () => splitPreviewText(overviewText, OVERVIEW_PREVIEW_CHAR_LIMIT),
    [overviewText],
  )
  const hasOverviewRemainder = overviewRemainder.length > 0
  const overviewBody = overviewExpanded || !hasOverviewRemainder ? overviewText : `${overviewPreview}...`

  const flashShare = useCallback((label: string, duration = 1500) => {
    setShareLabel(label)
    setIsShareDone(true)
    if (shareResetTimerRef.current) window.clearTimeout(shareResetTimerRef.current)
    shareResetTimerRef.current = window.setTimeout(() => {
      setShareLabel('Share')
      setIsShareDone(false)
    }, duration)
  }, [])

  const handleShare = useCallback(async () => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: document.title, text: `Check out: ${vehicle.title}`, url: pageUrl })
        flashShare('Shared', 1200)
        return
      } catch (err) {
        if (err && typeof err === 'object' && 'name' in err && (err as any).name === 'AbortError') return
      }
    }
    try {
      await copyToClipboard(pageUrl)
      flashShare('Link copied', 1500)
    } catch {
      flashShare('Copy failed', 1200)
    }
  }, [vehicle.title, flashShare])

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') window.print()
  }, [])

  // Sidebar summary facts — 6 items in a 2-col grid
  const summaryFacts = [
    { icon: Calendar, label: 'Year', value: vehicle.year ? String(vehicle.year) : 'On request' },
    { icon: Gauge, label: 'Mileage', value: vehicle.mileage ? `${formatMileage(vehicle.mileage)} mi` : 'On request' },
    { icon: Fuel, label: 'Fuel', value: vehicle.fuel || 'On request' },
    { icon: Cog, label: 'Transmission', value: vehicle.transmission || 'On request' },
    { icon: Car, label: 'Body', value: vehicle.body || 'On request' },
    { icon: Palette, label: 'Colour', value: vehicle.color || 'On request' },
  ]

  const monthlyFrom = formatPrice(computeMonthly(vehicle.price))
  const locationLabel = vehicle.location || contact.showroomAddress || 'our showroom'

  return (
    <article className={styles.page}>
      {/* Breadcrumb + utility actions */}
      <section className={styles.breadcrumbWrap}>
        <div className={styles.breadcrumbShell}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/" className={styles.crumbPill}>
              <Home size={12} aria-hidden="true" />
              <span>Home</span>
            </Link>
            <span className={styles.crumbDivider} aria-hidden="true">
              <ChevronRightIcon size={12} />
            </span>
            <Link href="/used-cars" className={styles.crumbPill}>
              <span>Used cars</span>
            </Link>
            <span className={styles.crumbDivider} aria-hidden="true">
              <ChevronRightIcon size={12} />
            </span>
            <span className={`${styles.crumbPill} ${styles.crumbPillCurrent}`} aria-current="page">
              {vehicle.title}
            </span>
          </nav>

          <div className={styles.utilityActions}>
            <button
              type="button"
              className={`${styles.utilityBtn} ${isShareDone ? styles.utilityBtnDone : ''}`}
              aria-label={`Share: ${shareLabel}`}
              data-tooltip={shareLabel}
              onClick={handleShare}
            >
              <Share2 size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.utilityBtn} ${wishlisted ? styles.utilityBtnActive : ''}`}
              aria-label="Save to wishlist"
              aria-pressed={wishlisted}
              data-tooltip={wishlisted ? 'Saved' : 'Wishlist'}
              onClick={() => toggleWishlist(savedRecord)}
            >
              <Heart size={14} aria-hidden="true" fill={wishlisted ? 'currentColor' : 'transparent'} />
            </button>
            <button
              type="button"
              className={`${styles.utilityBtn} ${compared ? styles.utilityBtnActive : ''}`}
              aria-label="Add to compare"
              aria-pressed={compared}
              data-tooltip={compared ? 'In compare' : 'Compare'}
              onClick={() => toggleCompare(savedRecord)}
            >
              <GitCompare size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.utilityBtn}
              aria-label="Print brochure"
              data-tooltip="Print"
              onClick={handlePrint}
            >
              <Printer size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* MAIN — 2-col shell: gallery + content stack on LEFT, sticky summary card on RIGHT */}
      <section className={styles.detailsMain}>
        <div className={styles.detailsShell}>
          {/* LEFT — primary column */}
          <div className={styles.detailsPrimary}>
            <article className={styles.galleryCard}>
              <VehicleGallery images={vehicle.gallery} alt={vehicle.title} />
            </article>

            <article className={styles.copyCard}>
              <h2 className={styles.cardHeading}>Vehicle Overview</h2>
              <p className={styles.overviewText}>{overviewBody}</p>
              {hasOverviewRemainder ? (
                <button
                  type="button"
                  className={styles.overviewToggle}
                  aria-expanded={overviewExpanded}
                  onClick={() => setOverviewExpanded((v) => !v)}
                >
                  <span>{overviewExpanded ? 'Read Less' : 'Read More'}</span>
                  {overviewExpanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
                </button>
              ) : null}
            </article>

            {vehicle.specs.length > 0 ? (
              <article className={styles.specsCard}>
                <h2 className={styles.cardHeading}>Key Specification</h2>
                <div className={styles.specGrid}>
                  {vehicle.specs.map((spec) => (
                    <div className={styles.specItem} key={spec.label}>
                      <span>{spec.label}</span>
                      <strong>{spec.value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            <article className={styles.historyCard}>
              <h2 className={styles.cardHeading}>Preparation &amp; History</h2>
              <div className={styles.historyItems}>
                <div className={styles.historyItem}>
                  <FileText size={18} aria-hidden="true" />
                  <p>Service history checked and documented.</p>
                </div>
                <div className={styles.historyItem}>
                  <Search size={18} aria-hidden="true" />
                  <p>HPI &amp; finance checks complete before listing.</p>
                </div>
                <div className={styles.historyItem}>
                  <Wrench size={18} aria-hidden="true" />
                  <p>Multi-point workshop inspection completed.</p>
                </div>
                <div className={styles.historyItem}>
                  <ShieldCheck size={18} aria-hidden="true" />
                  <p>Free 3-month warranty + 12-month AA Breakdown Cover.</p>
                </div>
              </div>
            </article>
          </div>

          {/* RIGHT — sticky summary card */}
          <aside className={styles.detailsSide}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryPanel}>
                <h2 className={styles.summaryTitle}>{vehicle.title}</h2>
                <p className={styles.summaryPrice}>{formatPrice(vehicle.price)}</p>
                <p className={styles.summaryFinance}>
                  From <strong>{monthlyFrom}</strong>/mo*
                </p>

                <div className={styles.summaryFacts} aria-label="Important vehicle details">
                  {summaryFacts.map((fact) => {
                    const Icon = fact.icon
                    return (
                      <div className={styles.summaryFact} key={fact.label}>
                        <span className={styles.summaryFactIcon} aria-hidden="true">
                          <Icon size={14} />
                        </span>
                        <span className={styles.summaryFactCopy}>
                          <small>{fact.label}</small>
                          <strong>{fact.value}</strong>
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className={styles.summaryActions}>
                  <button
                    type="button"
                    className={`${styles.summaryBtn} ${styles.summaryBtnEnquire}`}
                    onClick={openEnquiry}
                  >
                    <Mail size={15} aria-hidden="true" />
                    <span>Make an enquiry</span>
                  </button>
                  {contact.phoneTel ? (
                    <a href={`tel:${contact.phoneTel}`} className={`${styles.summaryBtn} ${styles.summaryBtnCall}`}>
                      <Phone size={15} aria-hidden="true" />
                      <span>Call {contact.phoneDisplay || 'dealer'}</span>
                    </a>
                  ) : null}
                  {contact.whatsappUrl ? (
                    <a
                      href={contact.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.summaryBtn} ${styles.summaryBtnReserve}`}
                    >
                      <WhatsAppIcon size={15} />
                      <span>Message on WhatsApp</span>
                    </a>
                  ) : null}
                </div>

                <ul className={styles.summaryList}>
                  <li><Check size={14} aria-hidden="true" /> Free 3-month warranty</li>
                  <li><Check size={14} aria-hidden="true" /> 12-month AA Breakdown Cover</li>
                  <li><Check size={14} aria-hidden="true" /> Multi-point workshop inspection</li>
                  <li><Check size={14} aria-hidden="true" /> Finance &amp; part-ex welcome</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Mobile sticky bottom bar — Price + Enquire (FAB handles WhatsApp) */}
      <div className={styles.mobileBar} aria-hidden="false">
        <div className={styles.mobileBarPrice}>
          <span className={styles.mobileBarPriceLabel}>Price</span>
          <strong>{formatPrice(vehicle.price)}</strong>
        </div>
        <button
          type="button"
          className={`auto-btn auto-btn--primary ${styles.mobileBarCta}`}
          onClick={openEnquiry}
        >
          Enquire
        </button>
      </div>

      {/* Similar vehicles */}
      {similar.length > 0 ? (
        <section className={styles.similarSection} aria-labelledby="similar-heading">
          <header className={styles.similarHeader}>
            <p className="auto-eyebrow">More like this</p>
            <h2 id="similar-heading" className={styles.similarTitle}>
              Similar {vehicle.make || 'vehicles'} from our forecourt
            </h2>
            <Link href="/used-cars" className={styles.similarSeeAll}>View all stock</Link>
          </header>

          <ul className={styles.similarGrid}>
            {similar.map((s) => (
              <li key={s.id} className={styles.similarCard}>
                <Link href={buildVehiclePermalink({ slug: s.slug || s.id }, '/used-cars')}>
                  <div className={styles.similarMedia}>
                    {s.image ? (
                      <img src={s.image} alt={s.title} loading="lazy" />
                    ) : (
                      <div className={styles.similarPlaceholder} aria-hidden="true" />
                    )}
                  </div>
                  <div className={styles.similarBody}>
                    <p className={styles.similarTitleText}>{s.title}</p>
                    <p className={styles.similarPrice}>{formatPrice(s.price)}</p>
                    <p className={styles.similarMeta}>
                      {s.year || '—'} &middot; {formatMileage(s.mileage)} mi &middot; {s.fuel || '—'}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <EnquiryModal
        open={enquiryOpen}
        onClose={closeEnquiry}
        subject={`Enquiry: ${vehicle.title}`}
        intro={`Tell us a bit about what you'd like to know about this ${[vehicle.year, vehicle.make].filter(Boolean).join(' ') || 'vehicle'}. Same-day callbacks are normal. We're based at ${locationLabel}.`}
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
