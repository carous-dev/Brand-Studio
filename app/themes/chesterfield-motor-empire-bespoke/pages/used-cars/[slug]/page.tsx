'use client'
// audit-ignore-file: tp-use-client-on-page, a11y-h1-multiple
// h1 appears in two mutually-exclusive return paths (not-found state and the
// resolved vehicle hero) — only one ever renders at runtime.
// Vehicle detail page — kept as a client component because the gallery,
// lightbox, sticky enquiry, and finance teaser cluster naturally around
// client interactivity. The render layer is freshly designed for the
// Chesterfield rugged theme; the data-fetching helpers are kept verbatim.

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Cog,
  DoorOpen,
  Expand,
  Fuel,
  Gauge,
  Mail,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  ShieldCheck,
  Send,
  Tag,
  Users,
  X,
  CheckCircle2,
} from 'lucide-react'
import styles from './page.module.css'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { apiUrl } from '../../../lib/api'
import { useBrand } from '../../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../../lib/contact'
import { isValidUkPhone } from '../../../lib/uk-phone'
import { normalizeInventoryItem } from '../../../lib/inventory'
import { buildVehiclePermalink, getVehicleLookupCandidates } from '../../../lib/vehicle-links'

// ---------------- Types & helpers (kept from baseline) ----------------

type VehicleRecord = {
  vin: string
  registration: string
  make: string
  model: string
  derivative: string
  trim: string
  body_type: string
  fuel_type: string
  transmission_type: string
  drivetrain: string
  emission_class: string
  colour: string
  ownership_condition: string
  seats: number
  doors: number
  cylinders: number
  engine_capacity_cc: number
  engine_power_bhp: number
  co2_emission_gpkm: number
  odometer_reading_miles: number
  first_registration_date: string
  year_of_manufacture: string
  vehicle_excise_duty_gbp: string
  length_mm: number
  height_mm: number
  width_mm: number
  boot_space_seats_up_litres: number
  boot_space_seats_down_litres: number
  fuel_economy_nedc_combined_mpg: string
  description: string
  derivative_slug: string
  original_id: string
  price: string
  attention_grabber: string
  stock_status: string
  advertiser_phone: string
  advertiser_website: string
  town: string
}

type AdvertRecord = {
  advert_id: string
  forecourt_price_gbp: string
  last_updated: string
  stock_status: string
}

type VehicleHistoryRecord = {
  scrapped: number
  stolen: number
  imported: number
  exported: number
  previous_owners_count: number
}

type VehicleFeature = {
  feature_id: number
  name: string
  category: string
  type: string
}

type VehicleSpecGroup = {
  category: string
  count: string
  items: Array<{ name: string; value: string }>
}

type VehicleGalleryItem = { url: string; label: string; category: string }

type VehicleDetailsPayload = {
  vehicle: VehicleRecord
  advert: AdvertRecord
  vehicle_history: VehicleHistoryRecord
  features: VehicleFeature[]
  specs: VehicleSpecGroup[]
  gallery: VehicleGalleryItem[]
  images: string[]
}

const EMPTY_VEHICLE: VehicleRecord = {
  vin: '', registration: '', make: 'Vehicle', model: '', derivative: '', trim: '',
  body_type: 'Car', fuel_type: 'Petrol', transmission_type: 'Manual', drivetrain: '',
  emission_class: '', colour: '', ownership_condition: 'Used', seats: 5, doors: 4,
  cylinders: 0, engine_capacity_cc: 0, engine_power_bhp: 0, co2_emission_gpkm: 0,
  odometer_reading_miles: 0, first_registration_date: '', year_of_manufacture: '',
  vehicle_excise_duty_gbp: '0', length_mm: 0, height_mm: 0, width_mm: 0,
  boot_space_seats_up_litres: 0, boot_space_seats_down_litres: 0,
  fuel_economy_nedc_combined_mpg: '', description: '',
  derivative_slug: '', original_id: '', price: '0', attention_grabber: '',
  stock_status: 'in_stock', advertiser_phone: '', advertiser_website: '', town: '',
}

function toText(input: unknown): string {
  if (input == null) return ''
  if (typeof input === 'string' || typeof input === 'number') return String(input).trim()
  if (typeof input === 'object') {
    const named = (input as any).name
    if (typeof named === 'string' || typeof named === 'number') return String(named).trim()
    const label = (input as any).label
    if (typeof label === 'string' || typeof label === 'number') return String(label).trim()
  }
  return ''
}

function toNumber(input: unknown, fallback = 0): number {
  if (typeof input === 'number' && Number.isFinite(input)) return input
  const text = toText(input).replace(/[^0-9.-]+/g, '')
  if (!text) return fallback
  const parsed = Number(text)
  return Number.isFinite(parsed) ? parsed : fallback
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function collectImages(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input
    .map((item) => {
      if (!item) return ''
      if (typeof item === 'string') return item
      if (typeof item === 'object') {
        return toText((item as any).url || (item as any).href || (item as any).src || (item as any).image)
      }
      return ''
    })
    .filter(Boolean)
}

function normalizeGallery(input: unknown): VehicleGalleryItem[] {
  if (!Array.isArray(input)) return []
  return input
    .map((item, index) => {
      const url = typeof item === 'string'
        ? item
        : toText((item as any)?.url || (item as any)?.href || (item as any)?.src || (item as any)?.image)
      if (!url) return null
      const label = toText((item as any)?.label || (item as any)?.name) || `Vehicle image ${index + 1}`
      const category = toText((item as any)?.category) || 'Gallery'
      return { url, label, category }
    })
    .filter((item): item is VehicleGalleryItem => Boolean(item))
}

function buildFallbackSpecs(v: VehicleRecord): VehicleSpecGroup[] {
  return [
    {
      category: 'Performance',
      count: '4',
      items: [
        { name: 'Cylinders', value: String(v.cylinders || '—') },
        { name: 'Engine power', value: v.engine_power_bhp ? `${v.engine_power_bhp} bhp` : '—' },
        { name: 'Fuel economy (combined)', value: v.fuel_economy_nedc_combined_mpg || '—' },
        { name: 'CO₂', value: v.co2_emission_gpkm ? `${v.co2_emission_gpkm} g/km` : '—' },
      ],
    },
    {
      category: 'Dimensions',
      count: '4',
      items: [
        { name: 'Height', value: v.height_mm ? `${v.height_mm} mm` : '—' },
        { name: 'Length', value: v.length_mm ? `${v.length_mm} mm` : '—' },
        { name: 'Width', value: v.width_mm ? `${v.width_mm} mm` : '—' },
        { name: 'Seats', value: String(v.seats || '—') },
      ],
    },
  ]
}

function normalizeSpecs(input: unknown, v: VehicleRecord): VehicleSpecGroup[] {
  if (!Array.isArray(input)) return buildFallbackSpecs(v)
  const out = input
    .map((group) => {
      const category = toText((group as any)?.category) || 'Specification'
      const items = Array.isArray((group as any)?.items)
        ? (group as any).items
            .map((item: any) => {
              const name = toText(item?.name)
              const value = toText(item?.value)
              if (!name || !value) return null
              return { name, value }
            })
            .filter((item: any): item is { name: string; value: string } => Boolean(item))
        : []
      if (!items.length) return null
      return { category, count: String((group as any)?.count ?? items.length), items }
    })
    .filter((g): g is VehicleSpecGroup => Boolean(g))
  return out.length ? out : buildFallbackSpecs(v)
}

function resolveVehiclePayload(payload: unknown): Record<string, any> | null {
  if (!payload || typeof payload !== 'object') return null
  const queue: any[] = [payload]
  while (queue.length) {
    const current = queue.shift()
    if (!current || typeof current !== 'object') continue
    const vNode = (current as any).vehicle
    if (vNode && typeof vNode === 'object') {
      if (vNode.vehicle && typeof vNode.vehicle === 'object') queue.push(vNode)
      if (vNode.registration || vNode.vin || vNode.make || vNode.model || vNode.derivative) {
        return current as Record<string, any>
      }
    }
    if ((current as any).registration || (current as any).vin) {
      return { vehicle: current } as Record<string, any>
    }
    if ((current as any).data && typeof (current as any).data === 'object') queue.push((current as any).data)
    if ((current as any).item && typeof (current as any).item === 'object') queue.push((current as any).item)
  }
  return null
}

function normalizeVehiclePayload(payload: unknown): VehicleDetailsPayload | null {
  const resolved = resolveVehiclePayload(payload)
  if (!resolved) return null
  const source = resolved.vehicle && resolved.vehicle.vehicle ? resolved.vehicle : resolved
  const vNode = source.vehicle && typeof source.vehicle === 'object' ? source.vehicle : source
  if (!vNode || typeof vNode !== 'object') return null

  const advNode = source.advert && typeof source.advert === 'object' ? source.advert : {}
  const histNode = source.vehicle_history && typeof source.vehicle_history === 'object' ? source.vehicle_history : {}

  const make = toText(source.make?.name ?? vNode.make) || 'Vehicle'
  const model = toText(source.model?.name ?? vNode.model)
  const derivative = toText(vNode.derivative ?? vNode.trim)
  const priceText = toText(advNode.forecourt_price_gbp ?? advNode.price ?? vNode.price) || '0'
  const stockStatus = toText(vNode.stock_status ?? advNode.stock_status ?? source.stock_status) || 'in_stock'

  const gallery = normalizeGallery(source.gallery ?? vNode.gallery)
  const images = unique([
    ...gallery.map((item) => item.url),
    ...collectImages(source.images),
    ...collectImages(source.media),
    ...collectImages(vNode.images),
    toText(vNode.image),
  ])
  const normalizedGallery = gallery.length
    ? gallery
    : images.map((url, i) => ({ url, label: `Vehicle image ${i + 1}`, category: 'Gallery' }))

  const vehicle: VehicleRecord = {
    ...EMPTY_VEHICLE,
    vin: toText(vNode.vin),
    registration: toText(vNode.registration),
    make, model, derivative,
    trim: toText(vNode.trim),
    body_type: toText(vNode.body_type ?? vNode.bodyType) || 'Car',
    fuel_type: toText(vNode.fuel_type ?? vNode.fuel) || 'Petrol',
    transmission_type: toText(vNode.transmission_type ?? vNode.trans) || 'Manual',
    drivetrain: toText(vNode.drivetrain),
    emission_class: toText(vNode.emission_class),
    colour: toText(vNode.colour ?? vNode.color) || 'Colour',
    ownership_condition: toText(vNode.ownership_condition) || 'Used',
    seats: toNumber(vNode.seats, 5),
    doors: toNumber(vNode.doors, 4),
    cylinders: toNumber(vNode.cylinders, 0),
    engine_capacity_cc: toNumber(vNode.engine_capacity_cc, 0),
    engine_power_bhp: toNumber(vNode.engine_power_bhp, 0),
    co2_emission_gpkm: toNumber(vNode.co2_emission_gpkm, 0),
    odometer_reading_miles: toNumber(vNode.odometer_reading_miles ?? vNode.mileage, 0),
    first_registration_date: toText(vNode.first_registration_date),
    year_of_manufacture: toText(vNode.year_of_manufacture ?? vNode.year),
    vehicle_excise_duty_gbp: toText(vNode.vehicle_excise_duty_gbp) || '0',
    length_mm: toNumber(vNode.length_mm, 0),
    height_mm: toNumber(vNode.height_mm, 0),
    width_mm: toNumber(vNode.width_mm, 0),
    boot_space_seats_up_litres: toNumber(vNode.boot_space_seats_up_litres, 0),
    boot_space_seats_down_litres: toNumber(vNode.boot_space_seats_down_litres, 0),
    fuel_economy_nedc_combined_mpg: toText(vNode.fuel_economy_nedc_combined_mpg),
    description: toText(vNode.description || advNode.attention_grabber) || 'Vehicle details available on request.',
    derivative_slug: toText(vNode.derivative_slug),
    original_id: toText(vNode.original_id ?? vNode.id),
    price: priceText,
    attention_grabber: toText(vNode.attention_grabber ?? advNode.attention_grabber),
    stock_status: stockStatus,
    advertiser_phone: toText(vNode.advertiser_phone ?? source.advertiser?.phone),
    advertiser_website: toText(vNode.advertiser_website ?? source.advertiser?.website),
    town: toText(vNode.town ?? source.advertiser?.town),
  }

  const features: VehicleFeature[] = Array.isArray(source.features)
    ? source.features
        .map((f: any, i: number) => {
          const name = toText(f?.name ?? f)
          if (!name) return null
          return {
            feature_id: toNumber(f?.feature_id, i + 1),
            name,
            category: toText(f?.category) || 'Other',
            type: toText(f?.type) || 'Standard',
          }
        })
        .filter((f: VehicleFeature | null): f is VehicleFeature => Boolean(f))
    : []

  const advert: AdvertRecord = {
    advert_id: toText(advNode.advert_id ?? vNode.original_id),
    forecourt_price_gbp: priceText,
    last_updated: toText(advNode.last_updated ?? advNode.date_on_forecourt),
    stock_status: stockStatus,
  }

  const vehicle_history: VehicleHistoryRecord = {
    scrapped: toNumber(histNode.scrapped, 0),
    stolen: toNumber(histNode.stolen, 0),
    imported: toNumber(histNode.imported, 0),
    exported: toNumber(histNode.exported, 0),
    previous_owners_count: toNumber(histNode.previous_owners_count, 0),
  }

  return {
    vehicle, advert, vehicle_history, features,
    specs: normalizeSpecs(source.specs, vehicle),
    gallery: normalizedGallery,
    images,
  }
}

async function fetchTarget(target: string, signal: AbortSignal): Promise<VehicleDetailsPayload | null> {
  try {
    const r = await fetch(target, { cache: 'no-store', signal })
    if (!r.ok) return null
    const payload = await r.json().catch(() => null)
    return normalizeVehiclePayload(payload)
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw e
    return null
  }
}

function withBrand(target: string, brand?: string | null): string {
  if (!target) return target
  const slug = (brand || '').trim()
  if (!slug) return target
  const sep = target.includes('?') ? '&' : '?'
  return `${target}${sep}brand=${encodeURIComponent(slug)}`
}

async function fetchByLookupValue(value: string, signal: AbortSignal, brand?: string | null): Promise<VehicleDetailsPayload | null> {
  const trimmed = value.trim()
  if (!trimmed) return null
  for (const candidate of getVehicleLookupCandidates(trimmed)) {
    const targets = [
      candidate.slug ? apiUrl(`/vehicle?slug=${encodeURIComponent(candidate.slug)}`) : '',
      candidate.reg ? apiUrl(`/vehicle?slug=${encodeURIComponent(candidate.reg)}`) : '',
      candidate.slug ? apiUrl(`/vehicle/${encodeURIComponent(candidate.slug)}`) : '',
      candidate.reg ? apiUrl(`/vehicle/${encodeURIComponent(candidate.reg)}`) : '',
    ].filter(Boolean).map((t) => withBrand(t, brand))
    for (const t of targets) {
      const r = await fetchTarget(t, signal)
      if (r) return r
    }
  }
  return null
}

function inventoryMatchScore(item: { slug?: string; title: string }, candidate: string): number {
  const c = candidate.trim().toLowerCase()
  if (!c) return 0
  const itemSlug = String(item.slug ?? '').trim().toLowerCase()
  const titleSlug = toSlug(item.title)
  if (itemSlug && itemSlug === c) return 100
  if (titleSlug && titleSlug === c) return 95
  if (itemSlug && c.endsWith(itemSlug)) return 80
  if (titleSlug && c.endsWith(titleSlug)) return 75
  if (itemSlug && itemSlug.includes(c)) return 60
  if (titleSlug && titleSlug.includes(c)) return 55
  if (itemSlug && c.includes(itemSlug)) return 50
  if (titleSlug && c.includes(titleSlug)) return 45
  return 0
}

async function fetchByInventoryFallback(slugs: string[], signal: AbortSignal, brand?: string | null): Promise<VehicleDetailsPayload | null> {
  for (const candidate of slugs) {
    const queries = unique([candidate, candidate.replace(/-/g, ' ').trim()])
    for (const q of queries) {
      if (!q) continue
      const params = new URLSearchParams({
        page: '1', per_page: '24', sort: 'newest', q, light: '1', vehicle_type: 'car',
      })
      const slug = (brand || '').trim()
      if (slug) params.set('brand', slug)
      const target = apiUrl(`/inventory?${params.toString()}`)
      let payload: any = null
      try {
        const r = await fetch(target, { cache: 'no-store', signal })
        if (!r.ok) continue
        payload = await r.json().catch(() => null)
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') throw e
        continue
      }
      const items = Array.isArray(payload?.items) ? payload.items : []
      const normalized = items.map(normalizeInventoryItem).filter(Boolean) as Array<NonNullable<ReturnType<typeof normalizeInventoryItem>>>
      if (!normalized.length) continue
      const ranked = normalized
        .map((item) => ({ item, score: inventoryMatchScore(item, candidate) }))
        .sort((a, b) => b.score - a.score)
      const best = ranked[0]
      if (!best || best.score < 45) continue
      const lookups = unique([best.item.slug ?? '', best.item.id])
      for (const v of lookups) {
        const r = await fetchByLookupValue(v, signal, brand)
        if (r) return r
      }
    }
  }
  return null
}

async function fetchVehicle(slug: string, signal: AbortSignal, brand?: string | null): Promise<VehicleDetailsPayload | null> {
  const normalized = slug.trim()
  if (!normalized) return null
  let decoded = normalized
  try { decoded = decodeURIComponent(normalized) } catch { decoded = normalized }
  const candidates = unique([
    normalized,
    decoded,
    normalized.includes('--') ? normalized.split('--').pop() || '' : '',
    decoded.replace(/^\d{4}-/, ''),
  ])
  for (const c of candidates) {
    const r = await fetchByLookupValue(c, signal, brand)
    if (r) return r
  }
  return fetchByInventoryFallback(candidates, signal, brand)
}

// ---------------- Format helpers ----------------

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
const formatNumber = (n: number) => new Intl.NumberFormat('en-GB').format(n)
const formatDate = (s: string) => {
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}
const formatStockStatus = (s: string | null | undefined) => {
  const n = String(s ?? '').trim().toLowerCase()
  if (!n) return 'In stock'
  if (['sold', 'sold_out', 'out_of_stock'].includes(n)) return 'Sold'
  if (['reserved', 'on_hold', 'hold', 'pending'].includes(n)) return 'Reserved'
  if (['in_stock', 'available', 'instock', 'in stock'].includes(n)) return 'In stock'
  return n.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---------------- Skeleton ----------------

function VehicleDetailsSkeleton() {
  return (
    <main className={styles.page} aria-busy="true" aria-live="polite">
      <p className={styles.srOnly}>Loading vehicle details...</p>
      <section className={styles.heroBand}>
        <div className={styles.heroBandInner}>
          <span className={`${styles.skel} ${styles.skelHeroLine}`} aria-hidden="true" />
          <span className={`${styles.skel} ${styles.skelHeroTitle}`} aria-hidden="true" />
        </div>
      </section>
      <section className={styles.body}>
        <div className={styles.bodyInner}>
          <div className={styles.galleryCol}>
            <div className={`${styles.skel} ${styles.skelGallery}`} aria-hidden="true" />
          </div>
          <aside className={styles.sideCol}>
            <div className={`${styles.skel} ${styles.skelSide}`} aria-hidden="true" />
          </aside>
        </div>
      </section>
    </main>
  )
}

// ---------------- Main page ----------------

type EnquiryValues = {
  vehicle: string
  url: string
  name: string
  email: string
  phone: string
  message: string
}

export function ChesterfieldVehicleDetailPage() {
  const params = useParams<{ slug: string | string[] }>()
  const rawSlug = Array.isArray(params?.slug) ? params.slug.join('/') : params?.slug || ''
  const brand = useBrand()
  const brandSlug = (brand?.slug || '').trim()
  const contact = getBrandContactInfo(brand)

  const [details, setDetails] = useState<VehicleDetailsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [enquirySent, setEnquirySent] = useState(false)

  // Fetch vehicle on mount / slug change
  useEffect(() => {
    if (!rawSlug) {
      setLoading(false)
      setNotFound(true)
      return
    }
    let aborted = false
    const controller = new AbortController()
    setLoading(true)
    setNotFound(false)
    fetchVehicle(rawSlug, controller.signal, brandSlug)
      .then((payload) => {
        if (aborted) return
        if (!payload) {
          setNotFound(true)
        } else {
          setDetails(payload)
          setActiveImageIdx(0)
        }
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return
        if (!aborted) setNotFound(true)
      })
      .finally(() => { if (!aborted) setLoading(false) })
    return () => { aborted = true; controller.abort() }
  }, [rawSlug, brandSlug])

  // Lightbox keyboard handling
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight' && details?.images.length) {
        setActiveImageIdx((i) => (i + 1) % details.images.length)
      }
      if (e.key === 'ArrowLeft' && details?.images.length) {
        setActiveImageIdx((i) => (i - 1 + details.images.length) % details.images.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, details?.images.length])

  const vehicle = details?.vehicle || EMPTY_VEHICLE
  const advert = details?.advert
  const features = details?.features || []
  const specs = details?.specs || []
  const images = details?.images || []
  const gallery = details?.gallery || []

  const titleParts = [vehicle.year_of_manufacture, vehicle.make, vehicle.model, vehicle.derivative].filter(Boolean)
  const title = titleParts.join(' ') || 'Vehicle details'
  const priceNum = toNumber(advert?.forecourt_price_gbp ?? vehicle.price, 0)
  const priceDisplay = priceNum > 0 ? formatPrice(priceNum) : 'On enquiry'
  const stockLabel = formatStockStatus(vehicle.stock_status)
  const stockTone: 'in' | 'reserved' | 'sold' | 'other' = (() => {
    const s = stockLabel.toLowerCase()
    if (s === 'in stock') return 'in'
    if (s === 'reserved') return 'reserved'
    if (s === 'sold') return 'sold'
    return 'other'
  })()

  const enquiryForm = useLeadsForm<EnquiryValues>({
    initialValues: {
      vehicle: '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      name: '',
      email: '',
      phone: '',
      message: '',
    },
    leadType: 'vehicle-enquiry',
    leadSource: 'vehicle-detail',
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (v) => (/\S+@\S+\.\S+/.test(String(v || '')) ? null : 'Please enter a valid email.'),
      },
      phone: {
        required: true,
        validate: (v) => (isValidUkPhone(v) ? null : 'Please enter a valid UK phone number.'),
      },
      message: { required: true },
    },
  })

  // Set vehicle field when details load
  useEffect(() => {
    if (!title) return
    enquiryForm.setFieldValue('vehicle', title)
    if (typeof window !== 'undefined') {
      enquiryForm.setFieldValue('url', window.location.href)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  const handleEnquirySubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const r = await enquiryForm.submit()
    if (r.success) setEnquirySent(true)
  }, [enquiryForm])

  // Featured spec rings
  const featuredSpecs = useMemo(() => [
    { icon: Calendar, label: 'Year', value: vehicle.year_of_manufacture || '—' },
    { icon: Gauge, label: 'Mileage', value: vehicle.odometer_reading_miles ? `${formatNumber(vehicle.odometer_reading_miles)} mi` : '—' },
    { icon: Fuel, label: 'Fuel', value: vehicle.fuel_type || '—' },
    { icon: Cog, label: 'Transmission', value: vehicle.transmission_type || '—' },
    { icon: DoorOpen, label: 'Doors', value: vehicle.doors ? String(vehicle.doors) : '—' },
    { icon: Users, label: 'Seats', value: vehicle.seats ? String(vehicle.seats) : '—' },
    { icon: Palette, label: 'Colour', value: vehicle.colour || '—' },
    { icon: Tag, label: 'Body type', value: vehicle.body_type || '—' },
  ], [vehicle])

  const featuresByCategory = useMemo(() => {
    const map: Record<string, VehicleFeature[]> = {}
    features.forEach((f) => {
      const cat = f.category || 'Other'
      if (!map[cat]) map[cat] = []
      map[cat].push(f)
    })
    return map
  }, [features])

  if (loading) return <VehicleDetailsSkeleton />

  if (notFound || !details) {
    return (
      <main className={styles.page}>
        <section className={styles.notFound}>
          <span className={styles.notFoundIcon} aria-hidden="true"><X size={32} strokeWidth={2} /></span>
          <h1 className={styles.notFoundTitle}>Vehicle no longer available</h1>
          <p className={styles.notFoundBody}>
            This vehicle has been sold or removed from our forecourt. Browse current stock or contact us
            and we&rsquo;ll help you find something similar.
          </p>
          <div className={styles.notFoundActions}>
            <Link href="/used-cars" className={styles.notFoundCta}>
              <ArrowLeft size={16} strokeWidth={2.4} aria-hidden="true" />
              Browse stock
            </Link>
            <Link href="/contact" className={styles.notFoundCtaSecondary}>
              Contact us
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      {/* HERO BAND — breadcrumb, title, key chips, price stamp */}
      <section className={styles.heroBand}>
        <div className={styles.heroBandBg} aria-hidden="true" />
        <div className={styles.heroBandOverlay} aria-hidden="true" />
        <div className={styles.heroBracket} data-pos="tl" aria-hidden="true" />
        <div className={styles.heroBracket} data-pos="br" aria-hidden="true" />
        <div className={styles.heroBandInner}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/used-cars">
              <ArrowLeft size={14} strokeWidth={2.4} aria-hidden="true" />
              Stock
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </nav>

          <div className={styles.heroBandRow}>
            <div className={styles.heroBandCopy}>
              <div className={styles.heroChips}>
                <span className={`${styles.heroChip} ${styles[`heroChip-${stockTone}`]}`}>
                  <span className={`${styles.heroChipDot} mfx-pulse-dot`} aria-hidden="true" />
                  {stockLabel}
                </span>
                {vehicle.registration ? (
                  <span className={styles.regPlate}>{vehicle.registration}</span>
                ) : null}
              </div>
              <h1 className={styles.heroTitle}>{title}</h1>
              {vehicle.attention_grabber ? (
                <p className={styles.heroAttention}>{vehicle.attention_grabber}</p>
              ) : null}
              <ul className={styles.heroChipRow}>
                <li><Calendar size={13} strokeWidth={2} aria-hidden="true" />{vehicle.year_of_manufacture || '—'}</li>
                <li><Gauge size={13} strokeWidth={2} aria-hidden="true" />{vehicle.odometer_reading_miles ? `${formatNumber(vehicle.odometer_reading_miles)} mi` : '—'}</li>
                <li><Fuel size={13} strokeWidth={2} aria-hidden="true" />{vehicle.fuel_type}</li>
                <li><Cog size={13} strokeWidth={2} aria-hidden="true" />{vehicle.transmission_type}</li>
              </ul>
            </div>
            <div className={styles.heroBandPrice}>
              <span className={styles.priceLabel}>Forecourt price</span>
              <span className={styles.priceValue}>{priceDisplay}</span>
              <a className={`${styles.heroBandCta} mfx-shimmer`} href="#enquiry">
                Enquire now
                <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN BODY — gallery + sticky sidebar */}
      <section className={styles.body}>
        <div className={styles.bodyInner}>
          <div className={styles.galleryCol}>
            <div className={styles.gallery}>
              <button
                type="button"
                className={styles.galleryMain}
                style={images[activeImageIdx] ? { backgroundImage: `url(${images[activeImageIdx]})` } : undefined}
                onClick={() => images.length && setLightboxOpen(true)}
                aria-label="Open image at full size"
              >
                {!images.length ? (
                  <span className={styles.galleryPlaceholder}>Image coming soon</span>
                ) : null}
                {images.length > 0 ? (
                  <span className={styles.galleryExpand} aria-hidden="true">
                    <Expand size={16} strokeWidth={2.4} />
                  </span>
                ) : null}
                {images.length > 1 ? (
                  <span className={styles.galleryCount}>
                    {activeImageIdx + 1} / {images.length}
                  </span>
                ) : null}
              </button>

              {images.length > 1 ? (
                <div className={styles.galleryNav}>
                  <button
                    type="button"
                    className={styles.galleryNavBtn}
                    onClick={() => setActiveImageIdx((i) => (i - 1 + images.length) % images.length)}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={16} strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    className={styles.galleryNavBtn}
                    onClick={() => setActiveImageIdx((i) => (i + 1) % images.length)}
                    aria-label="Next image"
                  >
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </button>
                </div>
              ) : null}

              {images.length > 1 ? (
                <ul className={styles.galleryThumbs}>
                  {images.slice(0, 12).map((img, i) => (
                    <li key={`${img}-${i}`}>
                      <button
                        type="button"
                        className={`${styles.galleryThumb} ${i === activeImageIdx ? styles.galleryThumbActive : ''}`}
                        onClick={() => setActiveImageIdx(i)}
                        style={{ backgroundImage: `url(${img})` }}
                        aria-label={gallery[i]?.label || `View image ${i + 1}`}
                        aria-pressed={i === activeImageIdx}
                      />
                    </li>
                  ))}
                  {images.length > 12 ? (
                    <li>
                      <button
                        type="button"
                        className={styles.galleryThumbMore}
                        onClick={() => { setActiveImageIdx(12); setLightboxOpen(true) }}
                      >
                        +{images.length - 12}
                      </button>
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>

            {/* Description */}
            {vehicle.description ? (
              <article className={styles.descriptionCard}>
                <header className={styles.cardHeader}>
                  <p className={styles.cardEyebrow}>Description</p>
                  <h2 className={styles.cardHeading}>From the showroom</h2>
                </header>
                <p className={styles.descriptionBody}>{vehicle.description}</p>
              </article>
            ) : null}

            {/* Spec rings */}
            <article className={styles.specsCard}>
              <header className={styles.cardHeader}>
                <p className={styles.cardEyebrow}>At a glance</p>
                <h2 className={styles.cardHeading}>Headline specifications</h2>
              </header>
              <ul className={styles.specRingGrid}>
                {featuredSpecs.map((s, i) => {
                  const Icon = s.icon
                  return (
                    <li key={`spec-${i}`} className={styles.specRing}>
                      <span className={styles.specRingIcon} aria-hidden="true">
                        <Icon size={18} strokeWidth={2} />
                      </span>
                      <span className={styles.specRingValue}>{s.value}</span>
                      <span className={styles.specRingLabel}>{s.label}</span>
                    </li>
                  )
                })}
              </ul>
            </article>

            {/* Detail spec groups */}
            {specs.length > 0 ? (
              <article className={styles.specsCard}>
                <header className={styles.cardHeader}>
                  <p className={styles.cardEyebrow}>Full spec sheet</p>
                  <h2 className={styles.cardHeading}>Specifications</h2>
                </header>
                <div className={styles.specGroups}>
                  {specs.map((group) => (
                    <section key={group.category} className={styles.specGroup}>
                      <h3 className={styles.specGroupTitle}>{group.category}</h3>
                      <dl className={styles.specGroupList}>
                        {group.items.map((item) => (
                          <div key={`${group.category}-${item.name}`} className={styles.specGroupRow}>
                            <dt>{item.name}</dt>
                            <dd>{item.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  ))}
                </div>
              </article>
            ) : null}

            {/* Features */}
            {features.length > 0 ? (
              <article className={styles.featuresCard}>
                <header className={styles.cardHeader}>
                  <p className={styles.cardEyebrow}>Equipment</p>
                  <h2 className={styles.cardHeading}>Features &amp; equipment</h2>
                </header>
                {Object.entries(featuresByCategory).map(([category, items]) => (
                  <section key={category} className={styles.featureGroup}>
                    <h3 className={styles.featureGroupTitle}>{category}</h3>
                    <ul className={styles.featureChipGrid}>
                      {items.map((f) => (
                        <li key={f.feature_id} className={styles.featureChip}>
                          <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                          {f.name}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </article>
            ) : null}

            {/* Enquiry */}
            <article id="enquiry" className={styles.enquiryCard}>
              <header className={styles.cardHeader}>
                <p className={styles.cardEyebrow}>Enquire</p>
                <h2 className={styles.cardHeading}>Reserve or arrange a viewing</h2>
              </header>

              {enquirySent ? (
                <div className={styles.enquirySuccess} role="status" aria-live="polite">
                  <CheckCircle2 size={28} strokeWidth={2} aria-hidden="true" />
                  <h3>Enquiry received</h3>
                  <p>The Chesterfield team will be in touch during showroom hours.</p>
                </div>
              ) : (
                <form className={styles.enquiryForm} onSubmit={handleEnquirySubmit} noValidate>
                  <input type="text" {...enquiryForm.honeypotProps} className={styles.honeypot} aria-hidden="true" tabIndex={-1} />
                  <input type="hidden" name="vehicle" value={enquiryForm.values.vehicle} readOnly />
                  <input type="hidden" name="url" value={enquiryForm.values.url} readOnly />

                  <div className={styles.enquiryGrid}>
                    <div className={styles.field}>
                      <label htmlFor="enq-name" className={styles.fieldLabel}>Full name</label>
                      <input id="enq-name" type="text" autoComplete="name" required aria-required="true"
                        aria-invalid={Boolean(enquiryForm.errors.name)} className={styles.input}
                        {...enquiryForm.getFieldProps('name')} />
                      {enquiryForm.errors.name ? <span className={styles.fieldError}>{enquiryForm.errors.name}</span> : null}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="enq-email" className={styles.fieldLabel}>Email</label>
                      <input id="enq-email" type="email" autoComplete="email" required aria-required="true"
                        aria-invalid={Boolean(enquiryForm.errors.email)} className={styles.input}
                        {...enquiryForm.getFieldProps('email')} />
                      {enquiryForm.errors.email ? <span className={styles.fieldError}>{enquiryForm.errors.email}</span> : null}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="enq-phone" className={styles.fieldLabel}>Phone</label>
                      <input id="enq-phone" type="tel" autoComplete="tel" required aria-required="true"
                        aria-invalid={Boolean(enquiryForm.errors.phone)} className={styles.input}
                        {...enquiryForm.getFieldProps('phone')} />
                      {enquiryForm.errors.phone ? <span className={styles.fieldError}>{enquiryForm.errors.phone}</span> : null}
                    </div>
                    <div className={`${styles.field} ${styles.fieldWide}`}>
                      <label htmlFor="enq-message" className={styles.fieldLabel}>Message</label>
                      <textarea id="enq-message" rows={4} required aria-required="true"
                        placeholder="When would you like to come and view? Anything you'd like to know about the vehicle?"
                        aria-invalid={Boolean(enquiryForm.errors.message)} className={styles.textarea}
                        {...enquiryForm.getFieldProps('message')} />
                      {enquiryForm.errors.message ? <span className={styles.fieldError}>{enquiryForm.errors.message}</span> : null}
                    </div>
                  </div>

                  {enquiryForm.status === 'error' && enquiryForm.errorMessage ? (
                    <p className={styles.formError} role="alert">{enquiryForm.errorMessage}</p>
                  ) : null}

                  <button
                    type="submit"
                    className={`${styles.submit} mfx-shimmer`}
                    disabled={enquiryForm.status === 'submitting'}
                  >
                    {enquiryForm.status === 'submitting' ? 'Sending…' : (
                      <>
                        Send enquiry
                        <Send size={16} strokeWidth={2.4} aria-hidden="true" />
                      </>
                    )}
                  </button>
                  <p className={styles.formNote}>
                    By submitting you agree to our{' '}
                    <a className={styles.formNoteLink} href="/privacy-policy">privacy policy</a>.
                  </p>
                </form>
              )}
            </article>
          </div>

          {/* Sticky sidebar */}
          <aside className={styles.sideCol}>
            <div className={styles.sideSticky}>
              <div className={styles.sideCard}>
                <p className={styles.sideEyebrow}>Forecourt price</p>
                <p className={styles.sidePrice}>{priceDisplay}</p>
                <p className={styles.sideSubprice}>
                  {advert?.last_updated ? `Listed ${formatDate(advert.last_updated)}` : 'Available now'}
                </p>

                <div className={styles.sideActions}>
                  {contact.phoneTel ? (
                    <a className={styles.sideCallBtn} href={`tel:${contact.phoneTel}`}>
                      <Phone size={16} strokeWidth={2.4} aria-hidden="true" />
                      <span>
                        <span className={styles.sideBtnLabel}>Call showroom</span>
                        <span className={styles.sideBtnSub}>{contact.phoneDisplay}</span>
                      </span>
                    </a>
                  ) : null}
                  {contact.whatsappUrl ? (
                    <a
                      className={styles.sideWhatsAppBtn}
                      href={contact.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={16} strokeWidth={2.4} aria-hidden="true" />
                      WhatsApp the team
                    </a>
                  ) : null}
                  <a className={styles.sideEnquireBtn} href="#enquiry">
                    <Mail size={16} strokeWidth={2.4} aria-hidden="true" />
                    Send enquiry
                  </a>
                </div>

                <ul className={styles.sideTrust}>
                  <li><BadgeCheck size={14} strokeWidth={2.4} aria-hidden="true" /> HPI &amp; finance checked</li>
                  <li><ShieldCheck size={14} strokeWidth={2.4} aria-hidden="true" /> Minimum 3-month warranty</li>
                  <li><MapPin size={14} strokeWidth={2.4} aria-hidden="true" /> Viewings by appointment in {vehicle.town || 'Chesterfield'}</li>
                </ul>
              </div>

              <div className={styles.sideFinanceCard}>
                <p className={styles.sideEyebrow}>Finance</p>
                <p className={styles.financeBody}>
                  Apply for finance on this vehicle — soft search, no impact on credit.
                </p>
                <Link href="/finance" className={styles.financeCta}>
                  Apply for finance
                  <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Mobile sticky bar */}
      <div className={styles.mobileBar} aria-label="Quick actions">
        <span className={styles.mobileBarPrice}>{priceDisplay}</span>
        <div className={styles.mobileBarActions}>
          {contact.whatsappUrl ? (
            <a
              className={styles.mobileBarWhatsApp}
              href={contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} strokeWidth={2.4} />
            </a>
          ) : null}
          {contact.phoneTel ? (
            <a className={styles.mobileBarCall} href={`tel:${contact.phoneTel}`}>
              <Phone size={14} strokeWidth={2.4} aria-hidden="true" />
              Call
            </a>
          ) : null}
          <a className={styles.mobileBarEnquire} href="#enquiry">
            Enquire
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Vehicle image viewer"
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
            aria-label="Close image viewer"
          >
            <X size={20} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            className={styles.lightboxPrev}
            onClick={() => setActiveImageIdx((i) => (i - 1 + images.length) % images.length)}
            aria-label="Previous image"
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>
          <img
            src={images[activeImageIdx]}
            alt={`${title} — image ${activeImageIdx + 1} of ${images.length}`}
            className={styles.lightboxImage}
          />
          <button
            type="button"
            className={styles.lightboxNext}
            onClick={() => setActiveImageIdx((i) => (i + 1) % images.length)}
            aria-label="Next image"
          >
            <ChevronRight size={20} strokeWidth={2.4} />
          </button>
          <p className={styles.lightboxCount}>
            {activeImageIdx + 1} / {images.length}
          </p>
        </div>
      ) : null}
    </main>
  )
}

export default ChesterfieldVehicleDetailPage
