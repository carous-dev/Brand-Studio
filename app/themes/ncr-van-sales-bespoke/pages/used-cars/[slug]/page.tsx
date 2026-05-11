'use client'
// audit-ignore-file: tp-use-client-on-page
// Configurator-led detail page (rugged archetype, finance-dominant per
// inventory-design-library pattern D). Client-side because of slider state,
// gallery thumbs and lead form interactivity.

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Cog,
  DoorOpen,
  Fuel,
  Gauge,
  Heart,
  GitCompare,
  MapPin,
  Mail,
  Palette,
  Phone,
  Sparkles,
  Wallet,
} from 'lucide-react'
import styles from './page.module.css'
import { useLeadsForm } from '../../../../../hooks/useLeadsForm'
import { apiUrl } from '../../../lib/api'
import { useBrand } from '../../../context/BrandClientWrapper'
import { useGarage, type SavedVehicle } from '../../../context/GarageContext'
import { getBrandContactInfo } from '../../../lib/contact'
import { isValidUkPhone } from '../../../lib/uk-phone'
import { normalizeInventoryItem, type InventoryVehicle } from '../../../lib/inventory'
import { getVehicleLookupCandidates } from '../../../lib/vehicle-links'

type ApiVehicle = any

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

function calculateMonthly(price: number, deposit: number, termMonths: number, apr: number): number {
  const principal = Math.max(0, price - deposit)
  const r = apr / 100 / 12
  if (r === 0) return principal / termMonths
  const factor = Math.pow(1 + r, termMonths)
  const monthly = (principal * r * factor) / (factor - 1)
  return monthly
}

function VehicleNotFoundTemplate({ brandName, contact }: { brandName: string; contact: ReturnType<typeof getBrandContactInfo> }) {
  return (
    <main className={styles.page}>
      <section className={styles.notFoundHero}>
        <div className={styles.notFoundInner}>
          <p className={styles.eyebrow}>404 · stock</p>
          <h1 className={styles.notFoundTitle}>This van just sold.</h1>
          <p className={styles.notFoundLead}>
            Stock turns over fast at {brandName}. The vehicle you were looking at is no longer listed — but we'll have a similar one on the forecourt.
          </p>
          <div className={styles.notFoundActions}>
            <Link href="/used-cars" className={styles.ctaPrimary}>Browse current stock</Link>
            {contact.phoneDisplay ? (
              <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={styles.ctaSecondary}>
                <Phone size={16} strokeWidth={2.2} aria-hidden="true" /> {contact.phoneDisplay}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}

function EnquiryForm({ vehicleTitle, vehicleReg }: { vehicleTitle: string; vehicleReg: string }) {
  const form = useLeadsForm<{ name: string; email: string; phone: string; message: string; url: string }>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      message: `Hi, I'm interested in the ${vehicleTitle}${vehicleReg ? ` (${vehicleReg})` : ''}. Please get in touch.`,
      url: '',
    },
    leadType: 'vehicle-enquiry',
    leadSource: 'vehicle-detail',
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (v) => (/\S+@\S+\.\S+/.test(String(v || '')) ? null : 'Enter a valid email address.'),
      },
      phone: {
        required: true,
        validate: (v) => (isValidUkPhone(v) ? null : 'Enter a valid UK phone number.'),
      },
    },
    buildPayload: (values, meta) => ({
      name: values.name,
      email: values.email,
      phone: values.phone,
      message: values.message,
      subject: `Vehicle enquiry: ${vehicleTitle}`,
      reg: vehicleReg,
      vehicleTitle,
      url: values.url || (typeof window !== 'undefined' ? window.location.href : ''),
      leadType: 'vehicle-enquiry',
      leadSource: 'vehicle-detail',
      formTs: meta.formTs,
      [meta.honeypotField]: meta.honeypotValue,
    }),
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && !form.values.url) {
      form.setFieldValue('url', window.location.href)
    }
  }, [form])

  return (
    <form
      className={styles.enquiryForm}
      onSubmit={(e) => { e.preventDefault(); void form.submit() }}
      noValidate
    >
      <input type="text" {...form.honeypotProps} className={styles.honeypot} aria-hidden="true" tabIndex={-1} />

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Full name</span>
        <input type="text" required aria-required="true"
          aria-invalid={Boolean(form.errors.name)} {...form.getFieldProps('name')} />
        {form.errors.name ? <span className={styles.fieldError}>{form.errors.name}</span> : null}
      </label>

      <div className={styles.fieldRow}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Email</span>
          <input type="email" required aria-required="true"
            aria-invalid={Boolean(form.errors.email)} {...form.getFieldProps('email')} />
          {form.errors.email ? <span className={styles.fieldError}>{form.errors.email}</span> : null}
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Phone</span>
          <input type="tel" required aria-required="true"
            aria-invalid={Boolean(form.errors.phone)} {...form.getFieldProps('phone')} />
          {form.errors.phone ? <span className={styles.fieldError}>{form.errors.phone}</span> : null}
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Message</span>
        <textarea rows={4} {...form.getFieldProps('message')} />
      </label>

      {form.errorMessage ? <p className={styles.fieldError} role="alert">{form.errorMessage}</p> : null}
      {form.status === 'success' ? (
        <p className={styles.formSuccess} role="status">Thanks — we'll be in touch.</p>
      ) : null}

      <button type="submit"
        className={`${styles.submitBtn} mfx-shimmer`}
        disabled={form.status === 'submitting'}>
        {form.status === 'submitting' ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  )
}

export function NcrVehicleDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = String(params?.slug || '')
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'NCR Van Sales Ltd'
  const garage = useGarage()

  const [vehicle, setVehicle] = useState<InventoryVehicle | null>(null)
  const [raw, setRaw] = useState<ApiVehicle | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [activeImage, setActiveImage] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ok' | 'notfound'>('loading')

  const [deposit, setDeposit] = useState(2000)
  const [term, setTerm] = useState(48)
  const apr = 11.9

  useEffect(() => {
    let aborted = false
    const controller = new AbortController()

    async function load() {
      const candidates = getVehicleLookupCandidates(slug)
      const brandSlug = brand?.slug || ''
      let found: ApiVehicle | null = null
      for (const c of candidates) {
        try {
          const params = new URLSearchParams()
          if (c.slug) params.set('slug', c.slug)
          if (c.reg) params.set('reg', c.reg)
          if (brandSlug) params.set('brand', brandSlug)
          const res = await fetch(apiUrl(`/vehicle?${params.toString()}`), {
            signal: controller.signal,
            cache: 'no-store',
          })
          if (res.ok) {
            const payload = await res.json()
            if (payload && (payload.vehicle || payload.advert || payload.id || payload.title)) {
              found = payload
              break
            }
          }
        } catch {
          /* try next */
        }
      }
      if (aborted) return
      if (!found) {
        // Fallback: try the inventory list and find matching slug/reg
        try {
          const params = new URLSearchParams()
          params.set('per_page', '60')
          if (brandSlug) params.set('brand', brandSlug)
          const res = await fetch(apiUrl(`/inventory?${params.toString()}`), {
            signal: controller.signal,
            cache: 'no-store',
          })
          if (res.ok) {
            const payload = await res.json()
            const items: any[] = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []
            for (const c of candidates) {
              const match = items.find((it: any) => {
                const n = normalizeInventoryItem(it)
                if (!n) return false
                if (c.slug && (n.slug === c.slug || n.id === c.slug)) return true
                if (c.reg && n.reg && String(n.reg).replace(/\s+/g, '').toUpperCase() === c.reg) return true
                return false
              })
              if (match) { found = match; break }
            }
          }
        } catch { /* ignore */ }
      }

      if (!found) {
        setStatus('notfound')
        return
      }

      const normalized = normalizeInventoryItem(found)
      if (!normalized) {
        setStatus('notfound')
        return
      }
      setVehicle(normalized)
      setRaw(found)
      const galleryRaw = Array.isArray(found.gallery)
        ? found.gallery.map((g: any) => (typeof g === 'string' ? g : g?.url || ''))
        : Array.isArray(found.images) ? found.images : []
      const imgs = (galleryRaw.filter(Boolean) as string[])
      setImages(imgs.length > 0 ? imgs : [normalized.image].filter(Boolean) as string[])
      setStatus('ok')

      // Sensible defaults for finance calc
      const tenPercent = Math.round((normalized.price || 0) / 10)
      setDeposit(Math.max(500, Math.min(tenPercent, 5000)))
    }

    load()
    return () => { aborted = true; controller.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, brand?.slug])

  const monthly = useMemo(() => {
    if (!vehicle) return 0
    return calculateMonthly(vehicle.price || 0, deposit, term, apr)
  }, [vehicle, deposit, term])

  if (status === 'loading') {
    return (
      <main className={styles.page}>
        <div className={styles.loadingState} role="status" aria-live="polite">
          <span className={`${styles.loadingDot} mfx-pulse-dot`} aria-hidden="true" />
          <p>Loading vehicle…</p>
        </div>
      </main>
    )
  }

  if (status === 'notfound' || !vehicle) {
    return <VehicleNotFoundTemplate brandName={brandName} contact={contact} />
  }

  const wishlisted = garage.isWishlisted(vehicle.id)
  const compared = garage.isCompared(vehicle.id)
  const savedVehicle: SavedVehicle = {
    id: vehicle.id,
    title: vehicle.title,
    slug: vehicle.slug,
    reg: vehicle.reg,
    year: vehicle.year,
    price: vehicle.price,
    mileage: vehicle.mileage,
    fuel: vehicle.fuel,
    transmission: vehicle.transmission,
    body: vehicle.body,
    make: vehicle.make,
    color: vehicle.color,
    doors: vehicle.doors,
    location: vehicle.location,
    image: vehicle.image,
  }

  const description = String(raw?.vehicle?.description || raw?.description || '').trim()
  const engineCc = Number(raw?.vehicle?.engine_capacity_cc || 0)
  const enginePower = Number(raw?.vehicle?.engine_power_bhp || 0)
  const features: Array<{ name: string; category?: string }> = Array.isArray(raw?.features) ? raw.features : []

  return (
    <main className={styles.page}>
      <nav className={styles.crumb} aria-label="Breadcrumb">
        <div className={styles.crumbInner}>
          <Link href="/used-cars" className={styles.crumbLink}>
            <ArrowLeft size={14} strokeWidth={2.4} aria-hidden="true" /> All stock
          </Link>
          <span aria-hidden="true">/</span>
          <span>{vehicle.make}</span>
          <span aria-hidden="true">/</span>
          <span className={styles.crumbCurrent}>{vehicle.title}</span>
        </div>
      </nav>

      <section className={styles.layout}>
        <div className={styles.leftCol}>
          <div className={styles.gallery}>
            <div className={styles.galleryMain}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[activeImage] || vehicle.image} alt={`${vehicle.title} — image ${activeImage + 1}`} />
              {vehicle.featured ? (
                <span className={styles.featuredBadge}>
                  <Sparkles size={12} strokeWidth={2.4} aria-hidden="true" /> Featured
                </span>
              ) : null}
            </div>
            {images.length > 1 ? (
              <ul className={styles.thumbs}>
                {images.slice(0, 8).map((src, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ''}`}
                      onClick={() => setActiveImage(i)}
                      aria-label={`View image ${i + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <header className={styles.titleBlock}>
            <p className={styles.eyebrow}>{vehicle.make} · {vehicle.body}</p>
            {/* audit-ignore: a11y-h1-multiple — paired conditional h1 with the 404 branch (mutually exclusive) */}
            <h1 className={styles.title}>{vehicle.title}</h1>
            <div className={styles.titleActions}>
              <button
                type="button"
                className={styles.iconActionBtn}
                data-active={wishlisted}
                aria-pressed={wishlisted}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                onClick={() => garage.toggleWishlist(savedVehicle)}
              >
                <Heart size={16} strokeWidth={2} fill={wishlisted ? 'currentColor' : 'none'} />
                {wishlisted ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                className={styles.iconActionBtn}
                data-active={compared}
                aria-pressed={compared}
                aria-label={compared ? 'Remove from compare' : 'Add to compare'}
                onClick={() => garage.toggleCompare(savedVehicle)}
              >
                <GitCompare size={16} strokeWidth={2} />
                {compared ? 'Comparing' : 'Compare'}
              </button>
            </div>
          </header>

          <ul className={styles.keyFacts}>
            <li><Calendar size={16} aria-hidden="true" /> <span>Year</span><strong>{vehicle.year || '—'}</strong></li>
            <li><Gauge size={16} aria-hidden="true" /> <span>Mileage</span><strong>{vehicle.mileage.toLocaleString()} mi</strong></li>
            <li><Fuel size={16} aria-hidden="true" /> <span>Fuel</span><strong>{vehicle.fuel}</strong></li>
            <li><Cog size={16} aria-hidden="true" /> <span>Transmission</span><strong>{vehicle.transmission}</strong></li>
            <li><DoorOpen size={16} aria-hidden="true" /> <span>Doors</span><strong>{vehicle.doors || '—'}</strong></li>
            <li><Palette size={16} aria-hidden="true" /> <span>Colour</span><strong>{vehicle.color}</strong></li>
          </ul>

          {description ? (
            <section className={styles.descBlock} aria-label="Description">
              <h2>Description</h2>
              <p>{description}</p>
            </section>
          ) : null}

          {(engineCc > 0 || enginePower > 0 || features.length > 0) ? (
            <section className={styles.specBlock} aria-label="Spec & features">
              <h2>Spec & features</h2>
              <dl className={styles.specGrid}>
                {engineCc > 0 ? (<><dt>Engine</dt><dd>{engineCc.toLocaleString()} cc</dd></>) : null}
                {enginePower > 0 ? (<><dt>Power</dt><dd>{enginePower} bhp</dd></>) : null}
                <dt>Location</dt><dd><MapPin size={14} aria-hidden="true" /> {vehicle.location}</dd>
                <dt>Stock reference</dt><dd>{vehicle.reg || vehicle.id}</dd>
              </dl>
              {features.length > 0 ? (
                <ul className={styles.featureList}>
                  {features.slice(0, 20).map((f: any, i: number) => (
                    <li key={i}>{f.name || String(f)}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
        </div>

        <aside className={styles.rightCol}>
          <div className={styles.priceCard}>
            <div className={styles.priceHead}>
              <p className={styles.priceLabel}>Forecourt price</p>
              <p className={styles.priceValue}>{formatPrice(vehicle.price)}</p>
            </div>

            <section className={styles.configurator} aria-label="Finance calculator">
              <header className={styles.configHead}>
                <span className={styles.configIcon} aria-hidden="true">
                  <Wallet size={18} strokeWidth={2} />
                </span>
                <div>
                  <h2>Build your finance</h2>
                  <p>Indicative monthly cost — adjust deposit and term.</p>
                </div>
              </header>

              <div className={styles.monthlyResult}>
                <span className={styles.monthlyLabel}>Monthly from</span>
                <span className={styles.monthlyValue}>{formatPrice(Math.round(monthly))}</span>
                <span className={styles.monthlyAt}>at {apr}% APR representative</span>
              </div>

              <div className={styles.sliderRow}>
                <label htmlFor="deposit-slider" className={styles.sliderLabel}>
                  <span>Deposit</span>
                  <strong>{formatPrice(deposit)}</strong>
                </label>
                <input
                  id="deposit-slider"
                  type="range"
                  min={0}
                  max={Math.max(500, Math.round((vehicle.price || 0) * 0.5))}
                  step={250}
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className={styles.slider}
                  aria-valuetext={`${formatPrice(deposit)} deposit`}
                />
              </div>

              <div className={styles.sliderRow}>
                <label htmlFor="term-slider" className={styles.sliderLabel}>
                  <span>Term</span>
                  <strong>{term} months</strong>
                </label>
                <input
                  id="term-slider"
                  type="range"
                  min={24}
                  max={72}
                  step={12}
                  value={term}
                  onChange={(e) => setTerm(Number(e.target.value))}
                  className={styles.slider}
                  aria-valuetext={`${term} month term`}
                />
              </div>

              <p className={styles.disclaimer}>
                Indicative only. Finance is subject to status and acceptance. {brandName} is a credit broker, not a lender.
              </p>
            </section>

            <div className={styles.contactRow}>
              {contact.phoneDisplay ? (
                <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={styles.contactPrimary}>
                  <Phone size={16} strokeWidth={2.2} aria-hidden="true" />
                  {contact.phoneDisplay}
                </a>
              ) : null}
              {contact.email ? (
                <a href={`mailto:${contact.email}?subject=Enquiry: ${encodeURIComponent(vehicle.title)}`} className={styles.contactSecondary}>
                  <Mail size={16} strokeWidth={2.2} aria-hidden="true" />
                  Email us
                </a>
              ) : null}
            </div>
          </div>

          <div className={styles.enquiryCard} id="enquire">
            <header>
              <p className={styles.eyebrow}>Make an enquiry</p>
              <h2 className={styles.enquiryTitle}>Reserve or ask a question.</h2>
            </header>
            <EnquiryForm vehicleTitle={vehicle.title} vehicleReg={vehicle.reg || ''} />
          </div>
        </aside>
      </section>

      <section className={styles.backRow}>
        <Link href="/used-cars" className={styles.backLink}>
          <ArrowLeft size={14} strokeWidth={2.4} aria-hidden="true" /> Back to all stock
          <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
        </Link>
      </section>
    </main>
  )
}

export default NcrVehicleDetailPage
