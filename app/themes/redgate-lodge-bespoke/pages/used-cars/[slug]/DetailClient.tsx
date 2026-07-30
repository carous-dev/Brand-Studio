'use client'

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { CalendarDays, Car, Check, Cog, Fuel, Gauge, Mail, Phone, Settings2 } from 'lucide-react'
import { useBrand } from '../../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../../lib/contact'
import { resolveText } from '../../../lib/brand-text'
import VehicleCard from '../../../components/VehicleCard'
import { EnquiryModal, useEnquiryModal } from '@/app/widgets/EnquiryModal'
import {
  isExternalEnquiryReady,
  openExternalVehicleEnquiry,
  type ExternalVehicleEnquirySummary,
} from '../../../lib/external-widgets'
import CanvasFX from '@/app/widgets/CanvasFX/CanvasFX'
import GalleryMosaic from './GalleryMosaic'
import { parseVehicleDescription } from './parseDescription'
import styles from './page.module.css'

export type DetailVehicle = {
  id: string
  slug?: string
  title: string
  make: string
  model: string
  derivative: string
  reg: string
  year: number
  price: number
  mileage: number
  fuel: string
  gearbox: string
  engine: string
  body: string
  color: string
  doors: number
  description: string
  advertiserPhone: string
  gallery: string[]
  sold: boolean
}

export type DetailSimilarVehicle = {
  id: string
  slug?: string
  reg?: string
  title: string
  make: string
  year: number
  price: number
  mileage: number
  fuel: string
  transmission: string
  image: string
}

const DASH = '—'

function formatPrice(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)
}

function formatMileage(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  return `${new Intl.NumberFormat('en-GB').format(value)} mi`
}

export default function DetailClient({
  vehicle,
  similar,
}: {
  vehicle: DetailVehicle
  similar: DetailSimilarVehicle[]
}) {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const { isOpen: enquiryOpen, open: openEnquiry, close: closeEnquiry } = useEnquiryModal()

  const enquireLabel = resolveText(brand, 'detail.enquire') || 'Enquire about this car'
  const callLabel = resolveText(brand, 'detail.call') || 'Call us'
  const financeLine = resolveText(brand, 'detail.finance_line')
  const keyFactsLabel = resolveText(brand, 'detail.key_facts') || 'Key facts'
  const similarLabel = resolveText(brand, 'detail.similar_title') || 'More like this'
  const soldChip = resolveText(brand, 'detail.sold_chip') || 'Recently sold'
  const poaLabel = resolveText(brand, 'card.poa') || 'Price on request'
  const priceLabel = resolveText(brand, 'detail.price_label') || 'Price'
  const highlightsTitle = resolveText(brand, 'detail.highlights_title') || 'Highlights'
  const aboutTitle = resolveText(brand, 'detail.about_title') || 'About this car'
  const specTitle = resolveText(brand, 'detail.spec_title') || 'Specification'

  const priceText = formatPrice(vehicle.price) || poaLabel
  const headline = useMemo(
    () => [vehicle.year || '', vehicle.make, vehicle.model].map((p) => String(p ?? '').trim()).filter(Boolean).join(' ') || vehicle.title,
    [vehicle.year, vehicle.make, vehicle.model, vehicle.title],
  )
  const subLine = useMemo(
    () => [vehicle.derivative, vehicle.reg].map((p) => p.trim()).filter(Boolean).join(` ${DASH} `),
    [vehicle.derivative, vehicle.reg],
  )

  // Claret ledger band — populated facts only (mileage, year, fuel, gearbox,
  // engine, body); empties dropped BEFORE render so no "—"/blank cell and the
  // per-cell hairlines stay count-robust.
  const specs = [
    { icon: Gauge, label: resolveText(brand, 'detail.spec_mileage') || 'Mileage', value: formatMileage(vehicle.mileage) },
    { icon: CalendarDays, label: resolveText(brand, 'detail.spec_year') || 'Year', value: vehicle.year > 0 ? String(vehicle.year) : '' },
    { icon: Fuel, label: resolveText(brand, 'detail.spec_fuel') || 'Fuel', value: vehicle.fuel },
    { icon: Cog, label: resolveText(brand, 'detail.spec_gearbox') || 'Gearbox', value: vehicle.gearbox },
    { icon: Settings2, label: resolveText(brand, 'detail.spec_engine') || 'Engine', value: vehicle.engine },
    { icon: Car, label: resolveText(brand, 'detail.spec_body') || 'Body', value: vehicle.body },
  ].filter((s) => s.value)

  // Content-column "Specification" — NON-band identity fields only (the band
  // owns Mileage/Year/Fuel/Gearbox/Engine/Body); empties hidden.
  const specGrid = [
    { label: 'Make', value: vehicle.make },
    { label: 'Model', value: vehicle.model },
    { label: 'Derivative', value: vehicle.derivative },
    { label: 'Colour', value: vehicle.color },
    { label: 'Doors', value: vehicle.doors > 0 ? String(vehicle.doors) : '' },
    { label: 'Registration', value: vehicle.reg },
  ].filter((row) => row.value)

  // Curated identity facts for the "Key facts" hairline list.
  const keyFacts = [
    { label: 'Registration', value: vehicle.reg },
    { label: 'Colour', value: vehicle.color },
    { label: resolveText(brand, 'detail.spec_body') || 'Body', value: vehicle.body },
    { label: 'Doors', value: vehicle.doors > 0 ? String(vehicle.doors) : '' },
  ].filter((row) => row.value)

  // Refine the raw feed blurb into highlights + prose; dealer contact /
  // payment / booking / identity-dup noise is dropped (see parseDescription).
  const { highlights, prose } = useMemo(
    () =>
      parseVehicleDescription(vehicle.description, {
        make: vehicle.make,
        model: vehicle.model,
        derivative: vehicle.derivative,
        reg: vehicle.reg,
        title: vehicle.title,
        priceText,
      }),
    [vehicle.description, vehicle.make, vehicle.model, vehicle.derivative, vehicle.reg, vehicle.title, priceText],
  )

  const enquirySummary = useMemo<ExternalVehicleEnquirySummary>(() => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined
    return {
      title: vehicle.title,
      registration: vehicle.reg || undefined,
      make: vehicle.make || undefined,
      model: vehicle.model || undefined,
      derivative: vehicle.derivative || undefined,
      year: vehicle.year || undefined,
      price: vehicle.price || undefined,
      priceText: formatPrice(vehicle.price) || undefined,
      mileage: vehicle.mileage || undefined,
      transmission: vehicle.gearbox || undefined,
      fuel: vehicle.fuel || undefined,
      engineSize: vehicle.engine || undefined,
      image: vehicle.gallery[0] || undefined,
      url: pageUrl,
    }
  }, [vehicle])

  // CDN-first: open the hosted Carous enquiry widget once its bundle has loaded,
  // otherwise fall back to the theme's local <EnquiryModal> (which still captures
  // the lead). This handler is owned by component 14 downstream.
  const handleEnquiry = useCallback(() => {
    if (isExternalEnquiryReady()) openExternalVehicleEnquiry(enquirySummary)
    else openEnquiry()
  }, [enquirySummary, openEnquiry])

  const phoneTel = contact.phoneTel
  const locationLabel = contact.locationLabel || contact.cityOrShowroom

  // Reveal-on-mount (respects reduced motion via CSS).
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setVisible(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  const renderCta = (extraClass = '') =>
    vehicle.sold ? (
      <Link href="/used-cars" className={`${styles.soldChip} ${extraClass}`.trim()}>
        {soldChip}
      </Link>
    ) : (
      <button type="button" className={`${styles.enquireBtn} ${extraClass}`.trim()} onClick={handleEnquiry}>
        <Mail size={16} strokeWidth={2} aria-hidden="true" />
        <span>{enquireLabel}</span>
      </button>
    )

  return (
    <article className={`${styles.page} ${visible ? styles.pageVisible : ''}`.trim()}>
      {/* Title strip + gallery — CSS `order` swaps them at ≥768 so the title
          sits ABOVE the gallery on desktop and BELOW it on mobile. */}
      <div className={styles.leadWrap}>
        <section className={styles.titleStrip} aria-labelledby="detail-title">
          <div className={styles.titleInner} data-aos="fade-up">
            <div className={styles.titleText}>
              <h1 id="detail-title" className={styles.title}>
                {headline}
              </h1>
              {subLine ? <p className={styles.subLine}>{subLine}</p> : null}
            </div>
            <div className={styles.titlePrice}>
              <span className={styles.priceEyebrow}>{vehicle.sold ? soldChip : priceLabel}</span>
              <span className={`${styles.priceValue} ${vehicle.sold ? styles.priceStruck : ''}`.trim()}>{priceText}</span>
              {financeLine && !vehicle.sold ? <span className={styles.priceFinance}>{financeLine}</span> : null}
            </div>
          </div>
        </section>

        <section className={styles.gallerySection} aria-label="Vehicle photos">
          <div className={styles.galleryInner}>
            <GalleryMosaic images={vehicle.gallery} alt={vehicle.title} />
          </div>
        </section>
      </div>

      {/* Claret ledger — the route's single primary band (design-language §9).
          Furnishing (luxury→refined): the same soft brand-light aurora the
          px-invite band gets, mounted behind the claret plate. Self-guards
          (static token wash under reduced-motion / ≤640px, pauses off-screen).
          Decorative + aria-hidden. On-primary text rides above at z-index 1. */}
      <section className={styles.specsBand} aria-label="Key specification">
        <CanvasFX variant="aurora-light" density={0.6} className={styles.aurora} />
        <div className={styles.specsInner}>
          <dl className={styles.specsGrid} style={{ '--spec-cols': specs.length } as CSSProperties}>
            {specs.map((spec, index) => {
              const Icon = spec.icon
              return (
                <div
                  className={styles.specCol}
                  key={spec.label}
                  data-aos="fade"
                  data-aos-delay={index * 60}
                >
                  <span className={styles.specIcon} aria-hidden="true">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <dt className={styles.specLabel}>{spec.label}</dt>
                  <dd className={styles.specValue}>{spec.value}</dd>
                </div>
              )
            })}
          </dl>
        </div>
      </section>

      {/* Content grid — description + spec table (left), sticky sidebar (right). */}
      <section className={styles.contentSection}>
        <div className={styles.contentInner}>
          <div className={styles.contentGrid}>
            <div className={styles.mainCol}>
              {highlights.length ? (
                <div className={styles.highlights} data-aos="fade-up">
                  <h2 className={styles.blockTitle}>{highlightsTitle}</h2>
                  <ul className={styles.highlightGrid}>
                    {highlights.map((item) => (
                      <li className={styles.highlightItem} key={item}>
                        <Check size={16} strokeWidth={2.25} aria-hidden="true" className={styles.highlightTick} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {prose.length ? (
                <div className={styles.about} data-aos="fade-up" data-aos-delay="60">
                  <h2 className={styles.blockTitle}>{aboutTitle}</h2>
                  <div className={styles.aboutBody}>
                    {prose.map((p, i) => (
                      <p key={`p-${i}`}>{p}</p>
                    ))}
                  </div>
                </div>
              ) : null}

              {specGrid.length ? (
                <div className={styles.specGridWrap} data-aos="fade-up" data-aos-delay="80">
                  <h2 className={styles.blockTitle}>{specTitle}</h2>
                  <dl className={styles.specGrid}>
                    {specGrid.map((row) => (
                      <div className={styles.specGridRow} key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              {/* Mobile-only key facts (the sidebar carries these ≥1024). */}
              {keyFacts.length ? (
                <div className={styles.keyFactsMobile} data-aos="fade-up">
                  <h2 className={styles.blockTitle}>{keyFactsLabel}</h2>
                  <dl className={styles.factsList}>
                    {keyFacts.map((row) => (
                      <div className={styles.factRow} key={`m-${row.label}`}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </div>

            <aside className={styles.sidebar} aria-label="Price and enquiry">
              <div className={styles.priceCard} data-aos="fade-up" data-aos-delay="120">
                <div className={styles.priceZone}>
                  <span className={styles.priceEyebrow}>{vehicle.sold ? soldChip : priceLabel}</span>
                  <span className={`${styles.cardPrice} ${vehicle.sold ? styles.priceStruck : ''}`.trim()}>{priceText}</span>
                  {financeLine && !vehicle.sold ? <p className={styles.financeLine}>{financeLine}</p> : null}
                </div>

                {/* Furnishing: the sidebar enquiry CTA gets ONE refined effect —
                    a token-driven shimmer sweep on hover/focus (self-freezes
                    under reduced-motion + ≤720px). Sticky/mobile CTAs stay calm. */}
                <div className={styles.cardActions}>
                  {renderCta(vehicle.sold ? styles.cardCta : `${styles.cardCta} mfx-shimmer`)}

                  {phoneTel ? (
                    <a href={`tel:${phoneTel}`} className={styles.callLink}>
                      <Phone size={15} strokeWidth={2} aria-hidden="true" />
                      <span>
                        {callLabel}
                        {contact.phoneDisplay ? ` ${DASH} ${contact.phoneDisplay}` : ''}
                      </span>
                    </a>
                  ) : null}
                </div>

                {keyFacts.length ? (
                  <div className={styles.sidebarFacts}>
                    <h2 className={styles.factsHeading}>{keyFactsLabel}</h2>
                    <dl className={styles.factsList}>
                      {keyFacts.map((row) => (
                        <div className={styles.factRow} key={`s-${row.label}`}>
                          <dt>{row.label}</dt>
                          <dd>{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Similar rail (surface). */}
      {similar.length ? (
        <section className={styles.similarSection} aria-labelledby="similar-title">
          <div className={styles.similarInner}>
            <header className={styles.similarHeader}>
              <h2 id="similar-title" className={styles.similarTitle}>
                {similarLabel}
              </h2>
              <Link href="/used-cars" className={styles.similarLink}>
                View all stock
              </Link>
            </header>
            <div className={styles.similarGrid}>
              {similar.map((item, index) => (
                <div
                  className={styles.similarCell}
                  key={item.id}
                  data-aos="fade-up"
                  data-aos-delay={index * 60}
                >
                  <VehicleCard
                    compact
                    vehicle={{
                      id: item.id,
                      slug: item.slug,
                      reg: item.reg,
                      title: item.title,
                      make: item.make,
                      year: item.year,
                      price: item.price,
                      mileage: item.mileage,
                      fuel: item.fuel,
                      transmission: item.transmission,
                      image: item.image,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Mobile sticky bottom bar — price + Enquire only (build-rules §8). */}
      <div className={styles.stickyBar}>
        <div className={styles.stickyPrice}>
          <span className={styles.stickyPriceLabel}>{priceLabel}</span>
          <strong className={vehicle.sold ? styles.priceStruck : ''}>{priceText}</strong>
        </div>
        {renderCta(styles.stickyCta)}
      </div>

      {/* Local fallback lead capture — used only when the CDN enquiry bundle
          has not loaded. */}
      <EnquiryModal
        open={enquiryOpen}
        onClose={closeEnquiry}
        subject={`Enquiry: ${vehicle.title}`}
        intro={`Tell us what you'd like to know about this ${[vehicle.year, vehicle.make].filter(Boolean).join(' ') || 'car'}, or when you'd like to come and see it${locationLabel ? ` at ${locationLabel}` : ''}. The kettle's on.`}
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
          reg: vehicle.reg,
          price: String(vehicle.price || ''),
        }}
      />
    </article>
  )
}
