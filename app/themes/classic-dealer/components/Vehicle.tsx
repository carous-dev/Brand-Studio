"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import AppIcon from './AppIcon'
import InventoryCard from './InventoryCard'
import EnquiryForm from './EnquiryForm'
import { useBrand } from '../context/BrandClientWrapper'
import aa1Banner from '../images/aa-1.png'
import hp1Banner from '../images/hp1.png'
import '../styles/vehicle.css'

type VehicleProps = {
  vehicle: any
  images?: string[]
  similarList?: any[]
  fetchRemote?: boolean
}

const INLINE_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='720' viewBox='0 0 1280 720'%3E%3Crect width='1280' height='720' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='Arial%2Csans-serif' font-size='42'%3EVehicle%20Image%3C/text%3E%3C/svg%3E"

const WISHLIST_STORAGE_PREFIX = 'vp-vehicle-wishlist:'
const COMPARE_STORAGE_PREFIX = 'vp-vehicle-compare:'
const MAX_COMPARE_VEHICLES = 3
const OVERVIEW_PREVIEW_CHAR_LIMIT = 320

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function asText(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function asBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
  }
  return false
}

function asFirstText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = asText(value)
    if (normalized) return normalized
  }
  return ''
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const normalized = Number(String(value).replace(/[^0-9.-]+/g, '').trim())
  return Number.isFinite(normalized) ? normalized : null
}

function normalizeImageUrl(url?: string): string {
  if (!url) return ''

  try {
    return String(url)
      .replace(/%7Bresize%7D/gi, '{resize}')
      .replace(/\/(?:\d+x\d+|\{resize\})\//g, '/')
      .trim()
  } catch {
    return String(url).trim()
  }
}

function normalizeRegistrationIdentifier(value: unknown): string {
  const raw = asText(value)
  if (!raw) return ''
  return raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

function normalizeStoragePath(pathValue: string): string {
  const normalized = String(pathValue || '').trim()
  if (!normalized) return ''

  const clean = normalized.split('?')[0].split('#')[0]
  const withLeadingSlash = clean.startsWith('/') ? clean : `/${clean}`
  if (withLeadingSlash === '/') return '/'
  return withLeadingSlash.replace(/\/+$/, '')
}

function getStoredFlagCount(prefix: string): number {
  try {
    return Object.keys(window.localStorage).reduce((total, key) => {
      if (!key.startsWith(prefix)) return total
      return window.localStorage.getItem(key) === '1' ? total + 1 : total
    }, 0)
  } catch {
    return 0
  }
}

function splitPreviewText(text: string, limit: number): { preview: string; remainder: string } {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim()
  if (normalized.length <= limit) {
    return { preview: normalized, remainder: '' }
  }

  const safeCutoff = Math.max(80, Math.floor(limit * 0.6))
  const nearestSpace = normalized.lastIndexOf(' ', limit)
  const cutoff = nearestSpace >= safeCutoff ? nearestSpace : limit

  return {
    preview: normalized.slice(0, cutoff).trimEnd(),
    remainder: normalized.slice(cutoff).trimStart(),
  }
}

function stripHtml(value: unknown): string {
  const raw = asText(value)
  if (!raw) return ''
  return raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractDerivativeFromSubtitle(value: unknown): string {
  const subtitle = asText(value)
  if (!subtitle) return ''
  const head = subtitle.split('\u2022')[0].trim()
  return head
}

function fmtPrice(price: unknown, fallback = 'Enquire'): string {
  const numeric = toNumberOrNull(price)
  if (numeric === null) return fallback

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(numeric)
}

function fmtMileage(mileage: unknown, fallback = 'On request'): string {
  const numeric = toNumberOrNull(mileage)
  if (numeric === null) return fallback
  return `${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(numeric)} miles`
}

function normalizeEngineCapacityCc(value: unknown): number | null {
  const numeric = toNumberOrNull(value)
  if (numeric === null) return null
  // Some feeds provide litres (e.g. 1.6) while others provide cc (e.g. 1598).
  return numeric > 0 && numeric <= 15 ? numeric * 1000 : numeric
}

function inferEngineCapacityCcFromText(...values: unknown[]): number | null {
  for (const value of values) {
    const text = asText(value)
    if (!text) continue
    const match = text.match(/\b([0-9]\.[0-9])\b/)
    if (!match) continue
    const litres = Number(match[1])
    if (!Number.isFinite(litres) || litres <= 0.4 || litres > 10) continue
    return Math.round(litres * 1000)
  }
  return null
}

function resolveEngineCapacityCc(explicitValue: unknown, ...textFallbacks: unknown[]): number | null {
  const normalized = normalizeEngineCapacityCc(explicitValue)
  const inferred = inferEngineCapacityCcFromText(...textFallbacks)
  if (inferred === null) return normalized
  if (normalized === null) return inferred

  // Prefer inferred value when feed capacity looks like a low-fidelity placeholder.
  if (normalized <= 1000 && inferred > normalized) return inferred
  return normalized
}

function fmtEngine(engineCapacityCc: unknown, enginePowerBhp: unknown): string {
  const cc = normalizeEngineCapacityCc(engineCapacityCc)
  const bhp = toNumberOrNull(enginePowerBhp)
  const capacityText = cc !== null ? `${(cc / 1000).toFixed(1)}L` : ''
  const bhpText = bhp !== null ? `${Math.round(bhp)} BHP` : ''
  return [capacityText, bhpText].filter(Boolean).join(' · ') || 'On request'
}

function fmtOwners(value: unknown, fallback = 'On request'): string {
  const owners = toNumberOrNull(value)
  if (owners === null) return fallback
  const count = Math.max(0, Math.round(owners))
  if (count === 0) return '0 owners'
  return `${count} owner${count === 1 ? '' : 's'}`
}

function estimateMonthly(price: unknown): string {
  const numeric = toNumberOrNull(price)
  if (numeric === null) return 'Enquire'
  const estimate = Math.max(99, Math.round(numeric / 60))
  return fmtPrice(estimate, 'Enquire')
}

function toTelHref(phone: string): string {
  const normalized = String(phone || '').replace(/[^0-9+]/g, '')
  return normalized ? `tel:${normalized}` : ''
}

function slugifyParts(...parts: Array<string | number | null | undefined>): string {
  return parts
    .filter((part) => part !== null && part !== undefined && String(part).trim().length > 0)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeIncoming(vehicleInput: any, extraImages?: string[]): any {
  if (!vehicleInput) return {}

  const normalizeImageArray = (candidates: unknown[]): string[] => {
    const seen = new Set<string>()
    const output: string[] = []

    candidates.forEach((candidate) => {
      const normalized = normalizeImageUrl(asText(candidate))
      if (!normalized || seen.has(normalized)) return
      seen.add(normalized)
      output.push(normalized)
    })

    return output
  }

  if (!vehicleInput.vehicle && (!Array.isArray(vehicleInput.features) || typeof vehicleInput.features[0] === 'string')) {
    const images = normalizeImageArray(
      Array.isArray(extraImages) && extraImages.length
        ? extraImages
        : Array.isArray(vehicleInput.images)
          ? vehicleInput.images
          : [vehicleInput.image],
    )

    const derivative = asFirstText(
      vehicleInput.derivative,
      vehicleInput.trim,
      extractDerivativeFromSubtitle(
        asFirstText(
          vehicleInput.subTitle,
          vehicleInput.subtitle,
          vehicleInput.sub_title,
          vehicleInput.subTitleText,
        ),
      ),
    )

    return {
      ...vehicleInput,
      images,
      image: images[0] || normalizeImageUrl(asText(vehicleInput.image)) || '',
      registration: asFirstText(
        vehicleInput.registration,
        vehicleInput.registrationNumber,
        vehicleInput.registration_number,
        vehicleInput.numberPlate,
        vehicleInput.number_plate,
        vehicleInput.vrm,
        vehicleInput.plate,
        vehicleInput.reg,
      ),
      reg: asFirstText(
        vehicleInput.reg,
        vehicleInput.registration,
        vehicleInput.registrationNumber,
        vehicleInput.registration_number,
        vehicleInput.numberPlate,
        vehicleInput.number_plate,
        vehicleInput.vrm,
        vehicleInput.plate,
      ),
      slug: asFirstText(vehicleInput.slug, vehicleInput.derivative_slug),
      derivative,
      colour: asFirstText(vehicleInput.colour, vehicleInput.color),
      color: asFirstText(vehicleInput.color, vehicleInput.colour),
      fuel: asFirstText(vehicleInput.fuel, vehicleInput.fuel_type, vehicleInput.fuelType),
      trans: asFirstText(vehicleInput.trans, vehicleInput.transmission, vehicleInput.transmission_type),
      year: toNumberOrNull(vehicleInput.year) ?? null,
      mileage: toNumberOrNull(vehicleInput.mileage) ?? null,
      price: toNumberOrNull(vehicleInput.price) ?? null,
      enginePower:
        toNumberOrNull(
          vehicleInput.enginePower ??
            vehicleInput.enginePowerBhp ??
            vehicleInput.engine_power_bhp ??
            vehicleInput.bhp ??
            vehicleInput.power,
        ) ?? null,
      engineCapacityCc:
        resolveEngineCapacityCc(
          vehicleInput.engineCapacityCc ??
            vehicleInput.engine_capacity_cc ??
            vehicleInput.engine_capacity ??
            vehicleInput.engineCapacityLitres ??
            vehicleInput.engine_capacity_litres ??
            vehicleInput.engineCapacity ??
            vehicleInput.engine_size ??
            vehicleInput.engineSize ??
            vehicleInput.engine,
          vehicleInput.derivative,
          vehicleInput.trim,
          vehicleInput.model,
        ) ?? null,
      bodyType: asFirstText(vehicleInput.bodyType, vehicleInput.body_type, vehicleInput.body, vehicleInput.body_style),
      owners:
        toNumberOrNull(vehicleInput.owners) ??
        toNumberOrNull(vehicleInput.previous_owners_count) ??
        toNumberOrNull(vehicleInput.previousOwnersCount),
    }
  }

  const api = vehicleInput as Record<string, unknown>
  const vehicleNode = asRecord(api.vehicle)
  const advert = asRecord(api.advert)
  const advertiser = asRecord(api.advertiser)
  const makeNode = asRecord(api.make)
  const modelNode = asRecord(api.model)

  const features = Array.isArray(api.features)
    ? api.features
        .map((feature) => {
          if (typeof feature === 'string') return feature.trim()
          const row = asRecord(feature)
          return asFirstText(row.name, row.label)
        })
        .filter(Boolean)
    : []

  const imagesCandidates: unknown[] = []
  if (Array.isArray(extraImages) && extraImages.length) {
    imagesCandidates.push(...extraImages)
  } else if (Array.isArray(api.images) && api.images.length) {
    imagesCandidates.push(...api.images)
  } else if (Array.isArray(api.media) && api.media.length) {
    api.media.forEach((mediaItem) => {
      const row = asRecord(mediaItem)
      imagesCandidates.push(asFirstText(row.href, row.url))
    })
  } else {
    imagesCandidates.push(vehicleNode.image)
  }

  const images = normalizeImageArray(imagesCandidates)
  const year =
    toNumberOrNull(vehicleNode.year_of_manufacture) ??
    (asText(vehicleNode.first_registration_date)
      ? new Date(asText(vehicleNode.first_registration_date)).getFullYear()
      : toNumberOrNull(vehicleNode.year))

  const desc = asFirstText(vehicleNode.description, vehicleNode.details, vehicleNode.long_description)
  const shortDescription =
    asFirstText(vehicleNode.shortDescription, vehicleNode.short_description, vehicleNode.summary) ||
    (desc ? (desc.length > 150 ? `${desc.slice(0, 147).trim()}...` : desc) : '')

  return {
    vin: asFirstText(vehicleNode.vin, vehicleNode.VIN),
    registration: asFirstText(
      vehicleNode.registration,
      vehicleNode.reg,
      vehicleNode.registration_number,
      vehicleNode.number_plate,
      vehicleNode.numberPlate,
      vehicleNode.vrm,
      vehicleNode.plate,
    ),
    reg: asFirstText(
      vehicleNode.reg,
      vehicleNode.registration,
      vehicleNode.registration_number,
      vehicleNode.number_plate,
      vehicleNode.numberPlate,
      vehicleNode.vrm,
      vehicleNode.plate,
    ),
    make: asFirstText(makeNode.name, vehicleNode.make, vehicleNode.brand),
    model: asFirstText(modelNode.name, vehicleNode.model),
    derivative: asFirstText(vehicleNode.derivative, vehicleNode.derivative_name, vehicleNode.trim),
    slug: asFirstText(vehicleNode.slug, vehicleNode.derivative_slug),
    derivative_slug: asFirstText(vehicleNode.derivative_slug, vehicleNode.slug),
    year,
    price:
      toNumberOrNull(advert.forecourt_price_gbp) ??
      toNumberOrNull(advert.supplied_price_gbp) ??
      toNumberOrNull(vehicleNode.price) ??
      toNumberOrNull(vehicleNode.price_gbp),
    mileage:
      toNumberOrNull(vehicleNode.odometer_reading_miles) ??
      toNumberOrNull(vehicleNode.mileage) ??
      toNumberOrNull(vehicleNode.odometer),
    fuel: asFirstText(vehicleNode.fuel_type, vehicleNode.fuel, vehicleNode.fuelType),
    trans: asFirstText(vehicleNode.transmission_type, vehicleNode.transmission, vehicleNode.trans, vehicleNode.gearbox),
    doors:
      toNumberOrNull(vehicleNode.doors) ??
      toNumberOrNull(vehicleNode.door_count) ??
      toNumberOrNull(vehicleNode.number_of_doors),
    seats: toNumberOrNull(vehicleNode.seats) ?? toNumberOrNull(vehicleNode.number_of_seats),
    bodyType: asFirstText(vehicleNode.body_type, vehicleNode.bodyType, vehicleNode.body, vehicleNode.body_style),
    colour: asFirstText(vehicleNode.colour, vehicleNode.color, vehicleNode.exterior_color, vehicleNode.exteriorColour),
    color: asFirstText(vehicleNode.color, vehicleNode.colour, vehicleNode.exterior_color, vehicleNode.exteriorColour),
    owners:
      toNumberOrNull(asRecord(api.vehicle_history).previous_owners_count) ??
      toNumberOrNull(asRecord(api.vehicle_history).previous_owners) ??
      toNumberOrNull(vehicleNode.previous_owners_count) ??
      toNumberOrNull(vehicleNode.previousOwnersCount) ??
      toNumberOrNull(vehicleNode.previous_owners) ??
      toNumberOrNull(vehicleNode.owners),
    enginePower:
      toNumberOrNull(vehicleNode.engine_power_bhp) ??
      toNumberOrNull(vehicleNode.engine_power) ??
      toNumberOrNull(vehicleNode.power) ??
      toNumberOrNull(vehicleNode.bhp),
    engineCapacityCc: resolveEngineCapacityCc(
      toNumberOrNull(vehicleNode.engine_capacity_cc) ??
        toNumberOrNull(vehicleNode.engine_capacity) ??
        toNumberOrNull(vehicleNode.engineSizeCc) ??
        toNumberOrNull(vehicleNode.engine_size_cc) ??
        toNumberOrNull(vehicleNode.engine_capacity_litres) ??
        toNumberOrNull(vehicleNode.engineCapacityLitres) ??
        toNumberOrNull(vehicleNode.engineCapacity) ??
        toNumberOrNull(vehicleNode.engine_size) ??
        toNumberOrNull(vehicleNode.engineSize) ??
        toNumberOrNull(vehicleNode.engine),
      vehicleNode.derivative,
      vehicleNode.trim,
      modelNode.name,
    ),
    co2:
      toNumberOrNull(vehicleNode.co2_emission_gpkm) ??
      toNumberOrNull(vehicleNode.co2),
    description: desc,
    shortDescription,
    advertiser,
    features,
    images,
    image: images[0] || normalizeImageUrl(asText(vehicleNode.image)) || '',
    specs: api.specs ?? vehicleNode.specs ?? null,
  }
}

function normalizeSimilarVehicle(raw: unknown, index: number): any | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const row = raw as Record<string, unknown>
  const make = asText(row.make)
  const model = asText(row.model)
  const derivative = asFirstText(
    row.derivative,
    row.trim,
    extractDerivativeFromSubtitle(
      asFirstText(
        (row as Record<string, unknown>).subTitle,
        (row as Record<string, unknown>).subtitle,
        (row as Record<string, unknown>).sub_title,
      ),
    ),
  )
  const registration = asFirstText(row.registration, row.reg)
  const reg = registration || asText(row.vin)
  const slug = asFirstText(row.slug, row.derivative_slug) || slugifyParts(make, model, derivative, registration)

  const images = Array.from(
    new Set(
      [
        normalizeImageUrl(asText(row.image)),
        ...(Array.isArray(row.images) ? row.images.map((item) => normalizeImageUrl(asText(item))) : []),
      ].filter(Boolean),
    ),
  )

  return {
    id: reg || slug || `similar-${index + 1}`,
    reg: reg || null,
    registration: registration || reg || null,
    slug: slug || null,
    make: make || null,
    model: model || null,
    derivative: derivative || null,
    year: toNumberOrNull(row.year) ?? toNumberOrNull(row.year_of_manufacture) ?? null,
    mileage: toNumberOrNull(row.mileage) ?? toNumberOrNull(row.odometer_reading_miles) ?? null,
    fuel: asFirstText(row.fuel, row.fuel_type),
    fuel_type: asFirstText(row.fuel_type, row.fuel),
    trans: asFirstText(row.trans, row.transmission, row.transmission_type),
    transmission: asFirstText(row.transmission, row.trans, row.transmission_type),
    body_type: asFirstText(row.body_type, row.bodyStyle, row.body),
    colour: asFirstText(row.colour, row.color),
    color: asFirstText(row.color, row.colour),
    price: toNumberOrNull(row.price) ?? toNumberOrNull(row.forecourt_price_gbp) ?? null,
    image: images[0] || INLINE_FALLBACK_IMAGE,
    images,
    stock_status: asFirstText(row.stock_status, row.status),
    description: asText(row.description),
    first_registration_date: asFirstText(row.first_registration_date, row.first_reg_date),
  }
}

async function copyToClipboard(value: string): Promise<void> {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(value)
    return
  }

  const helper = document.createElement('textarea')
  helper.value = value
  helper.setAttribute('readonly', '')
  helper.style.position = 'fixed'
  helper.style.opacity = '0'
  document.body.appendChild(helper)
  helper.focus()
  helper.select()

  const copied = document.execCommand('copy')
  document.body.removeChild(helper)
  if (!copied) {
    throw new Error('Copy command failed')
  }
}

export default function Vehicle({ vehicle: vehicleProp, images, similarList: similarListProp, fetchRemote }: VehicleProps) {
  const brand = useBrand()

  const vehiclePageContent = asRecord((brand as any)?.pages?.vehicleDetail)
  const overviewContent = asRecord(vehiclePageContent.overview)
  const summaryContent = asRecord(vehiclePageContent.summary)
  const contactContent = asRecord(vehiclePageContent.contact)
  const relatedContent = asRecord(vehiclePageContent.related)
  const historyContent = asRecord(vehiclePageContent.history)

  const [remoteVehicle, setRemoteVehicle] = useState<any | null>(null)
  const [remoteFetchTrigger, setRemoteFetchTrigger] = useState(0)

  let vehicle = normalizeIncoming(vehicleProp, images)

  useEffect(() => {
    if (!fetchRemote) return

    let active = true

    const run = async () => {
      try {
        const registration = asFirstText(vehicle?.reg, vehicle?.registration)
        const slug = asFirstText(vehicle?.slug, vehicle?.derivative_slug)
        if (!registration && !slug) return

        const params = new URLSearchParams()
        if (registration) params.set('reg', registration)
        else params.set('slug', slug)

        const response = await fetch(`/api/vehicle?${params.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) return
        const payload = await response.json()
        if (!active) return

        if (payload?.vehicle) {
          setRemoteVehicle(normalizeIncoming(payload.vehicle, payload.images))
        }
      } catch {
        // Keep local data when remote request fails.
      }
    }

    run()

    return () => {
      active = false
    }
  }, [fetchRemote, vehicle?.reg, vehicle?.registration, vehicle?.slug, vehicle?.derivative_slug, remoteFetchTrigger])

  if (remoteVehicle) {
    vehicle = remoteVehicle
  }

  const vehicleTitle = [vehicle?.year, vehicle?.make, vehicle?.model, vehicle?.derivative]
    .map((part) => asText(part))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Vehicle Details'

  const summaryTitle = [vehicle?.year, vehicle?.make, vehicle?.model]
    .map((part) => asText(part))
    .filter(Boolean)
    .join(' ') || vehicleTitle

  const summaryDerivative = asText(vehicle?.derivative)
  const showSummaryDerivative = Boolean(summaryDerivative) && summaryDerivative.toLowerCase() !== summaryTitle.toLowerCase()

  const galleryImages = useMemo(() => {
    const fromVehicle = Array.isArray(vehicle?.images) ? vehicle.images : []
    const candidates = [
      ...fromVehicle,
      ...(Array.isArray(images) ? images : []),
      vehicle?.image,
      asText((brand as any)?.heroImage),
    ]

    const unique = Array.from(
      new Set(candidates.map((item) => normalizeImageUrl(asText(item))).filter(Boolean)),
    )

    return unique.length ? unique : [INLINE_FALLBACK_IMAGE]
  }, [vehicle?.images, vehicle?.image, images, brand])

  const featureItems = useMemo<string[]>(() => {
    const source = Array.isArray(vehicle?.features) ? vehicle.features : []
    const normalized = source
      .map((item: unknown) => asText(item))
      .filter(Boolean)
    return normalized
  }, [vehicle?.features])

  const overviewText = useMemo(() => {
    return (
      stripHtml(vehicle?.description) ||
      asFirstText(overviewContent.description, summaryContent.description, (brand as any)?.aboutUs?.description) ||
      'Description currently unavailable. Please contact our team for full details.'
    )
  }, [vehicle?.description, overviewContent.description, summaryContent.description, brand])

  const { preview: overviewPreview, remainder: overviewRemainder } = useMemo(
    () => splitPreviewText(overviewText, OVERVIEW_PREVIEW_CHAR_LIMIT),
    [overviewText],
  )

  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)
  useEffect(() => {
    setIsOverviewExpanded(false)
  }, [overviewText])

  const hasOverviewRemainder = overviewRemainder.length > 0
  const overviewBodyText = isOverviewExpanded || !hasOverviewRemainder ? overviewText : `${overviewPreview}...`

  const [galleryIndex, setGalleryIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  useEffect(() => {
    setGalleryIndex(0)
  }, [galleryImages.length])

  const galleryCount = galleryImages.length
  const hasGalleryControls = galleryCount > 1

  const goToNextImage = useCallback(() => {
    if (!hasGalleryControls) return
    setGalleryIndex((current) => (current + 1) % galleryCount)
  }, [galleryCount, hasGalleryControls])

  const goToPrevImage = useCallback(() => {
    if (!hasGalleryControls) return
    setGalleryIndex((current) => (current - 1 + galleryCount) % galleryCount)
  }, [galleryCount, hasGalleryControls])

  useEffect(() => {
    if (!isLightboxOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsLightboxOpen(false)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNextImage()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPrevImage()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isLightboxOpen, goToNextImage, goToPrevImage])

  useEffect(() => {
    const body = document.body
    if (isLightboxOpen) body.classList.add('vehicle-lightbox-open')
    else body.classList.remove('vehicle-lightbox-open')

    return () => {
      body.classList.remove('vehicle-lightbox-open')
    }
  }, [isLightboxOpen])

  const registrationId = normalizeRegistrationIdentifier(asFirstText(vehicle?.reg, vehicle?.registration))
  const slugId = asFirstText(vehicle?.slug, vehicle?.derivative_slug)
  const storagePath = normalizeStoragePath(
    registrationId
      ? `/used-cars/${registrationId}`
      : slugId
        ? `/used-cars/${slugId}`
        : '',
  )

  const wishlistStorageKey = storagePath ? `${WISHLIST_STORAGE_PREFIX}${storagePath}` : ''
  const compareStorageKey = storagePath ? `${COMPARE_STORAGE_PREFIX}${storagePath}` : ''

  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isCompared, setIsCompared] = useState(false)
  const [shareLabel, setShareLabel] = useState('Share')
  const [wishlistLabel, setWishlistLabel] = useState('Wishlist')
  const [compareLabel, setCompareLabel] = useState('Compare')
  const [shareDone, setShareDone] = useState(false)
  const [wishlistDone, setWishlistDone] = useState(false)
  const [compareDone, setCompareDone] = useState(false)

  const shareTimerRef = useRef<number | null>(null)
  const wishlistTimerRef = useRef<number | null>(null)
  const compareTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current)
      if (wishlistTimerRef.current) window.clearTimeout(wishlistTimerRef.current)
      if (compareTimerRef.current) window.clearTimeout(compareTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const syncFlags = () => {
      try {
        setIsWishlisted(Boolean(wishlistStorageKey && window.localStorage.getItem(wishlistStorageKey) === '1'))
        setIsCompared(Boolean(compareStorageKey && window.localStorage.getItem(compareStorageKey) === '1'))
      } catch {
        setIsWishlisted(false)
        setIsCompared(false)
      }
    }

    syncFlags()

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === wishlistStorageKey || event.key === compareStorageKey) {
        syncFlags()
      }
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('vp:wishlist-updated', syncFlags as EventListener)
    window.addEventListener('vp:compare-updated', syncFlags as EventListener)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('vp:wishlist-updated', syncFlags as EventListener)
      window.removeEventListener('vp:compare-updated', syncFlags as EventListener)
    }
  }, [wishlistStorageKey, compareStorageKey])

  const flashLabel = (
    nextLabel: string,
    setLabel: React.Dispatch<React.SetStateAction<string>>,
    setDone: React.Dispatch<React.SetStateAction<boolean>>,
    timerRef: React.MutableRefObject<number | null>,
    resetLabel: string,
    duration = 1400,
  ) => {
    setLabel(nextLabel)
    setDone(true)

    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      setLabel(resetLabel)
      setDone(false)
    }, duration)
  }

  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href
    const shareData = {
      title: vehicleTitle,
      text: `Check out this vehicle from ${brand.name}`,
      url: shareUrl,
    }

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData)
        flashLabel('Shared', setShareLabel, setShareDone, shareTimerRef, 'Share', 1200)
        return
      } catch (error) {
        if (error && typeof error === 'object' && 'name' in error && (error as { name?: string }).name === 'AbortError') {
          return
        }
      }
    }

    try {
      await copyToClipboard(shareUrl)
      flashLabel('Link Copied', setShareLabel, setShareDone, shareTimerRef, 'Share', 1500)
    } catch {
      flashLabel('Copy Failed', setShareLabel, setShareDone, shareTimerRef, 'Share', 1200)
    }
  }, [brand.name, vehicleTitle])

  const handleWishlist = useCallback(() => {
    if (!wishlistStorageKey) return

    const next = !isWishlisted
    setIsWishlisted(next)

    try {
      window.localStorage.setItem(wishlistStorageKey, next ? '1' : '0')
    } catch {
      // Ignore storage failures.
    }

    window.dispatchEvent(new CustomEvent('vp:wishlist-updated'))
    flashLabel(next ? 'Saved' : 'Removed', setWishlistLabel, setWishlistDone, wishlistTimerRef, 'Wishlist', 1200)
  }, [isWishlisted, wishlistStorageKey])

  const handleCompare = useCallback(() => {
    if (!compareStorageKey) return

    const next = !isCompared

    if (next) {
      const count = getStoredFlagCount(COMPARE_STORAGE_PREFIX)
      const alreadySaved = (() => {
        try {
          return window.localStorage.getItem(compareStorageKey) === '1'
        } catch {
          return false
        }
      })()

      if (!alreadySaved && count >= MAX_COMPARE_VEHICLES) {
        flashLabel('Max 3 Vehicles', setCompareLabel, setCompareDone, compareTimerRef, 'Compare', 1500)
        return
      }
    }

    setIsCompared(next)

    try {
      window.localStorage.setItem(compareStorageKey, next ? '1' : '0')
    } catch {
      // Ignore storage failures.
    }

    window.dispatchEvent(new CustomEvent('vp:compare-updated'))
    flashLabel(next ? 'Added' : 'Removed', setCompareLabel, setCompareDone, compareTimerRef, 'Compare', 1200)
  }, [isCompared, compareStorageKey])

  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const enquiryTriggerRef = useRef<HTMLButtonElement | null>(null)

  const openEnquiry = (trigger: HTMLButtonElement) => {
    enquiryTriggerRef.current = trigger
    setEnquiryOpen(true)
  }

  useEffect(() => {
    if (!enquiryOpen && enquiryTriggerRef.current) {
      enquiryTriggerRef.current.focus()
    }
  }, [enquiryOpen])

  const [similarVehicles, setSimilarVehicles] = useState<any[]>(
    Array.isArray(similarListProp)
      ? similarListProp.map((item, index) => normalizeSimilarVehicle(item, index)).filter(Boolean)
      : [],
  )
  const [similarLoading, setSimilarLoading] = useState(!Array.isArray(similarListProp))

  useEffect(() => {
    if (Array.isArray(similarListProp)) {
      setSimilarVehicles(
        similarListProp
          .map((item, index) => normalizeSimilarVehicle(item, index))
          .filter(Boolean) as any[],
      )
      setSimilarLoading(false)
      return
    }

    const slug = asFirstText(vehicle?.slug, vehicle?.derivative_slug)
    const registration = asFirstText(vehicle?.reg, vehicle?.registration)

    if (!slug && !registration) {
      setSimilarVehicles([])
      setSimilarLoading(false)
      return
    }

    let active = true

    const load = async () => {
      try {
        setSimilarLoading(true)
        const params = new URLSearchParams({ limit: '3' })
        if (slug) params.set('slug', slug)
        if (registration) params.set('reg', registration)

        const response = await fetch(`/api/vehicle/similar?${params.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          if (active) setSimilarVehicles([])
          return
        }

        const payload = await response.json()
        if (!active) return

        const rows = Array.isArray(payload)
          ? payload
          : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
            ? (payload as { items: unknown[] }).items
            : []

        const normalized = rows
          .map((item, index) => normalizeSimilarVehicle(item, index))
          .filter(Boolean) as any[]

        setSimilarVehicles(normalized)
      } catch {
        if (active) setSimilarVehicles([])
      } finally {
        if (active) setSimilarLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [similarListProp, vehicle?.slug, vehicle?.derivative_slug, vehicle?.reg, vehicle?.registration])

  const similarHeading = asFirstText(relatedContent.title, 'Similar Vehicles')
  const viewAllLabel = asFirstText(relatedContent.viewAllLabel, 'View All Stock')
  const overviewHeading = asFirstText(overviewContent.title, 'Vehicle Overview')
  const specHeading = asFirstText(vehiclePageContent.specHeading, 'Key Specification')
  const highlightsHeading = asFirstText(vehiclePageContent.highlightsHeading, 'Highlights')
  const historyHeading = asFirstText(historyContent.title, 'Preparation & History')

  const historyItems = (
    Array.isArray(historyContent.items)
      ? historyContent.items
          .map((item) => {
            const row = asRecord(item)
            return asFirstText(row.label, row.text, row.description)
          })
          .filter(Boolean)
      : []
  )
  const resolvedHistoryItems = historyItems.length
    ? historyItems
    : [
        'Service history checked and documented.',
        'HPI and finance checks complete before listing.',
        'Multi-point workshop inspection completed.',
        'Supplied with minimum 3-month warranty.',
      ]

  const summaryPrice = fmtPrice(vehicle?.price)
  const summaryMonthly = estimateMonthly(vehicle?.price)
  const phone = asFirstText(contactContent.phone, brand.location?.phone)
  const phoneHref = toTelHref(phone)
  const phoneCta = 'Enquire This Vehicle'
  const email = asFirstText(contactContent.email, brand.location?.email)
  const address = asFirstText(contactContent.address, brand.location?.fullAddress)

  const city = asText((brand.location?.address as any)?.city)
  const county = asText((brand.location?.address as any)?.county)
  const locationLabel = [city, county].filter(Boolean).join(', ') || 'your area'

  const openingHours = asRecord((brand as any)?.openingHours)
  const openingSummary = asFirstText(
    contactContent.hours,
    openingHours.monday ? `Mon: ${openingHours.monday}` : '',
    'Viewings by appointment',
  )

  const isAaApprovedDealer = asBoolean((brand as any)?.aaApprovedDealer ?? (brand as any)?.aa_approved_dealer)
  const sideBanners = useMemo(() => {
    const banners: Array<{ src: string; alt: string }> = []
    if (isAaApprovedDealer) {
      banners.push({ src: aa1Banner.src, alt: `${brand.name} AA approved` })
    }
    banners.push({ src: hp1Banner.src, alt: `${brand.name} partner banner` })
    return banners
  }, [brand.name, isAaApprovedDealer])

  const summaryFacts = [
    { icon: 'car-side' as const, label: 'Body Type', value: asFirstText(vehicle?.bodyType, vehicle?.body_type, 'On request') },
    { icon: 'calendar-check' as const, label: 'Year', value: asFirstText(vehicle?.year, 'On request') },
    { icon: 'road' as const, label: 'Mileage', value: fmtMileage(vehicle?.mileage) },
    { icon: 'gas-pump' as const, label: 'Fuel', value: asFirstText(vehicle?.fuel, 'On request') },
    { icon: 'cog' as const, label: 'Transmission', value: asFirstText(vehicle?.trans, 'On request') },
    { icon: 'tools' as const, label: 'Engine', value: fmtEngine(vehicle?.engineCapacityCc, vehicle?.enginePower) },
    { icon: 'award' as const, label: 'Colour', value: asFirstText(vehicle?.colour, vehicle?.color, 'On request') },
    { icon: 'users' as const, label: 'Owners', value: fmtOwners(vehicle?.owners) },
  ]

  const keySpecs = [
    { label: 'Mileage', value: fmtMileage(vehicle?.mileage) },
    { label: 'Engine', value: fmtEngine(vehicle?.engineCapacityCc, vehicle?.enginePower) },
    { label: 'Transmission', value: asFirstText(vehicle?.trans, 'On request') },
    { label: 'Fuel', value: asFirstText(vehicle?.fuel, 'On request') },
    { label: 'Body Type', value: asFirstText(vehicle?.bodyType, 'On request') },
    { label: 'Doors', value: asFirstText(vehicle?.doors, 'On request') },
    { label: 'Colour', value: asFirstText(vehicle?.colour, vehicle?.color, 'On request') },
  ]

  const similarShouldShow = similarLoading || similarVehicles.length > 0

  const triggerRemoteRetry = () => {
    if (!fetchRemote) return
    setRemoteVehicle(null)
    setRemoteFetchTrigger((value) => value + 1)
  }

  return (
    <>
      <section className="vehicle-details-breadcrumb-wrap">
        <div className="vehicle-details-breadcrumb-shell">
          <nav className="vehicle-details-breadcrumb" aria-label="Breadcrumb">
            <Link href="/" className="vehicle-breadcrumb-pill">
              <AppIcon name="house" />
              <span>Home</span>
            </Link>
            <span className="vehicle-breadcrumb-divider" aria-hidden="true">
              <AppIcon name="chevron-right" />
            </span>
            <Link href="/used-cars" className="vehicle-breadcrumb-pill">
              <span>Used Cars</span>
            </Link>
            <span className="vehicle-breadcrumb-divider" aria-hidden="true">
              <AppIcon name="chevron-right" />
            </span>
            <span className="vehicle-breadcrumb-pill is-current" aria-current="page">
              {vehicleTitle}
            </span>
          </nav>

          <div className="vehicle-details-breadcrumb-actions">
            <button
              type="button"
              className={`vehicle-breadcrumb-action${shareDone ? ' is-done' : ''}`}
              data-tooltip={shareLabel}
              aria-label="Share this vehicle"
              onClick={handleShare}
            >
              <AppIcon name="share-nodes" />
            </button>
            <button
              type="button"
              className={`vehicle-breadcrumb-action${isWishlisted ? ' is-active' : ''}${wishlistDone ? ' is-done' : ''}`}
              data-tooltip={wishlistLabel}
              aria-label="Add vehicle to wishlist"
              aria-pressed={isWishlisted}
              onClick={handleWishlist}
            >
              <AppIcon name="heart" filled={isWishlisted} />
            </button>
            <button
              type="button"
              className={`vehicle-breadcrumb-action${isCompared ? ' is-active' : ''}${compareDone ? ' is-done' : ''}`}
              data-tooltip={compareLabel}
              aria-label="Add vehicle to compare"
              aria-pressed={isCompared}
              onClick={handleCompare}
            >
              <AppIcon name="scale-balanced" />
            </button>
            <button
              type="button"
              className="vehicle-breadcrumb-action"
              data-tooltip="Brochure / Print"
              aria-label="Print vehicle brochure"
              onClick={() => window.print()}
            >
              <AppIcon name="print" />
            </button>
          </div>
        </div>
      </section>

      <section className="vehicle-details-main">
        <div className="vehicle-details-shell">
          <div className="vehicle-details-primary">
            <article className="vehicle-gallery-card">
              <div className="vehicle-gallery-main" tabIndex={0} aria-label="Vehicle image gallery">
                <div className="vehicle-gallery-viewport">
                  <figure
                    className="vehicle-gallery-slide"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <img
                      src={galleryImages[galleryIndex] || INLINE_FALLBACK_IMAGE}
                      alt={`${vehicleTitle} image ${galleryIndex + 1}`}
                    />
                  </figure>
                </div>

                <button
                  className="vehicle-gallery-control prev"
                  type="button"
                  aria-label="Previous image"
                  disabled={!hasGalleryControls}
                  onClick={goToPrevImage}
                >
                  <AppIcon name="chevron-left" />
                </button>

                <button
                  className="vehicle-gallery-control next"
                  type="button"
                  aria-label="Next image"
                  disabled={!hasGalleryControls}
                  onClick={goToNextImage}
                >
                  <AppIcon name="chevron-right" />
                </button>

                <button
                  className="vehicle-gallery-expand"
                  type="button"
                  aria-label="Open full screen gallery"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <AppIcon name="expand" />
                  <span>Full Screen</span>
                </button>

                <p className="vehicle-gallery-counter" aria-live="polite">
                  <span className="vehicle-gallery-current">{String(galleryIndex + 1).padStart(2, '0')}</span>
                  <span>/</span>
                  <span className="vehicle-gallery-total">{String(galleryCount).padStart(2, '0')}</span>
                </p>

                {hasGalleryControls ? (
                  <div className="vehicle-gallery-thumbs" role="tablist" aria-label="Select vehicle image">
                    {galleryImages.slice(0, 12).map((src, index) => {
                      const active = index === galleryIndex

                      return (
                        <button
                          key={`thumb-${index}`}
                          type="button"
                          className={`vehicle-gallery-thumb${active ? ' is-active' : ''}`}
                          aria-label={`Show image ${index + 1}`}
                          aria-selected={active}
                          onClick={() => setGalleryIndex(index)}
                        >
                          <img src={src} alt={`${vehicleTitle} thumbnail ${index + 1}`} />
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </article>

            <article className="vehicle-copy-card">
              <h2>{overviewHeading}</h2>
              <p className="vehicle-overview-text">{overviewBodyText}</p>
              {hasOverviewRemainder ? (
                <button
                  type="button"
                  className="vehicle-overview-toggle"
                  aria-expanded={isOverviewExpanded}
                  onClick={() => setIsOverviewExpanded((current) => !current)}
                >
                  <span>{isOverviewExpanded ? 'Read Less' : 'Read More'}</span>
                  <AppIcon name={isOverviewExpanded ? 'chevron-up' : 'chevron-down'} />
                </button>
              ) : null}
              {fetchRemote ? (
                <button
                  type="button"
                  className="vehicle-retry-btn"
                  onClick={triggerRemoteRetry}
                >
                  Refresh Live Details
                </button>
              ) : null}
            </article>

            <article className="vehicle-specs-card">
              <h2>{specHeading}</h2>
              <div className="vehicle-spec-grid">
                {keySpecs.map((spec) => (
                  <div className="vehicle-spec-item" key={spec.label}>
                    <span>{spec.label}</span>
                    <strong>{spec.value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="vehicle-features-card">
              <h2>{highlightsHeading}</h2>
              {featureItems.length ? (
                <div className="vehicle-feature-columns">
                  <ul>
                    {featureItems.slice(0, Math.ceil(featureItems.length / 2)).map((feature: string, index: number) => (
                      <li key={`feature-left-${index}-${feature}`}>
                        <AppIcon name="check" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <ul>
                    {featureItems.slice(Math.ceil(featureItems.length / 2)).map((feature: string, index: number) => (
                      <li key={`feature-right-${index}-${feature}`}>
                        <AppIcon name="check" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="vehicle-features-empty">No highlights listed for this vehicle.</p>
              )}
            </article>

            <article className="vehicle-history-card">
              <h2>{historyHeading}</h2>
              <div className="vehicle-history-items">
                {resolvedHistoryItems.slice(0, 4).map((item, index) => (
                  <div key={`${item}-${index}`}>
                    <AppIcon
                      name={
                        index === 0
                          ? 'file-alt'
                          : index === 1
                            ? 'search'
                            : index === 2
                              ? 'wrench'
                              : 'shield-alt'
                      }
                    />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="vehicle-details-side">
            <div className="vehicle-summary-card">
              <h2>{summaryTitle}</h2>
              {showSummaryDerivative ? <p className="vehicle-summary-derivative">{summaryDerivative}</p> : null}
              <p className="vehicle-summary-price">{summaryPrice}</p>
              <p className="vehicle-summary-finance">
                Representative finance from <strong>{summaryMonthly === 'Enquire' ? summaryMonthly : `${summaryMonthly}/mo`}</strong>
              </p>

              <div className="vehicle-summary-facts" aria-label="Important vehicle details">
                {summaryFacts.map((fact) => (
                  <div className="vehicle-summary-fact" key={fact.label}>
                    <span className="vehicle-summary-fact-icon" aria-hidden="true">
                      <AppIcon name={fact.icon} />
                    </span>
                    <span className="vehicle-summary-fact-copy">
                      <small>{fact.label}</small>
                      <strong>{fact.value}</strong>
                    </span>
                  </div>
                ))}
              </div>

              <div className="vehicle-summary-actions">
                {phoneHref ? (
                <a href={phoneHref} className="vehicle-summary-btn btn-call" aria-label={phoneCta}>
                  <AppIcon name="phone" /> {phoneCta}
                </a>
                ) : null}
                <button
                  type="button"
                  className="vehicle-summary-btn btn-mail"
                  onClick={(event) => openEnquiry(event.currentTarget)}
                >
                  <AppIcon name="envelope" /> Email Enquiry
                </button>
              </div>

              <ul className="vehicle-summary-list">
                <li>
                  <AppIcon name="check-circle" /> Part exchange welcome
                </li>
                <li>
                  <AppIcon name="check-circle" /> Finance options available
                </li>
                <li>
                  <AppIcon name="check-circle" /> Serving drivers across {locationLabel}
                </li>
              </ul>
            </div>

            {sideBanners.map((banner, index) => (
              <div className="vehicle-side-banner-card" key={`${banner.src}-${index}`}>
                <img src={banner.src} alt={banner.alt} loading="lazy" decoding="async" />
              </div>
            ))}

            <div className="vehicle-contact-card">
              <h3>{asFirstText(contactContent.title, `Visit ${brand.name}`)}</h3>
              <p>{address || 'Address available on request.'}</p>
              <p>{openingSummary}</p>
              {email ? (
                <a href={`mailto:${email}`}>{email}</a>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <div className={isLightboxOpen ? 'vehicle-lightbox is-open' : 'vehicle-lightbox'} aria-hidden={!isLightboxOpen}>
        <div className="vehicle-lightbox-backdrop" onClick={() => setIsLightboxOpen(false)}></div>
        <div className="vehicle-lightbox-inner" role="dialog" aria-modal="true" aria-label="Vehicle image gallery lightbox">
          <div className="vehicle-lightbox-top">
            <p className="vehicle-lightbox-counter" aria-live="polite">
              <span className="vehicle-lightbox-current">{String(galleryIndex + 1).padStart(2, '0')}</span>
              <span>/</span>
              <span className="vehicle-lightbox-total">{String(galleryCount).padStart(2, '0')}</span>
            </p>
            <button
              className="vehicle-lightbox-close"
              type="button"
              aria-label="Close full screen gallery"
              onClick={() => setIsLightboxOpen(false)}
            >
              <AppIcon name="times" />
            </button>
          </div>

          <div className="vehicle-lightbox-viewport">
            <figure className="vehicle-lightbox-slide" key={`lightbox-${galleryIndex}`}>
              <img src={galleryImages[galleryIndex] || INLINE_FALLBACK_IMAGE} alt={`${vehicleTitle} image ${galleryIndex + 1}`} />
            </figure>

            {hasGalleryControls ? (
              <>
                <button
                  className="vehicle-lightbox-control prev"
                  type="button"
                  aria-label="Previous image"
                  onClick={goToPrevImage}
                >
                  <AppIcon name="chevron-left" />
                </button>
                <button
                  className="vehicle-lightbox-control next"
                  type="button"
                  aria-label="Next image"
                  onClick={goToNextImage}
                >
                  <AppIcon name="chevron-right" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <EnquiryForm open={enquiryOpen} onClose={() => setEnquiryOpen(false)} initialReg={vehicleTitle} />

      {similarShouldShow ? (
        <section className="vehicle-related used-page">
          <div className="vehicle-related-shell">
            <div className="vehicle-related-head">
              <h2>{similarHeading}</h2>
              <Link href="/used-cars">{viewAllLabel}</Link>
            </div>

            <div className="vehicle-related-inventory-scope used-cars-inventory inventory-modern">
              <div className="vehicle-related-grid inventory-results-grid">
                {similarLoading ? (
                  <p className="vehicle-related-empty">Loading similar vehicles...</p>
                ) : similarVehicles.length ? (
                  similarVehicles.map((item: any, index: number) => (
                    <div className="vehicle-related-card-wrap" key={item.id || item.reg || `similar-${index}`}>
                      <InventoryCard vehicle={item} viewMode="grid" />
                    </div>
                  ))
                ) : (
                  <p className="vehicle-related-empty">No similar vehicles found right now.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
