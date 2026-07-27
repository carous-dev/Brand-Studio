"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Cog, Fuel, Gauge, Heart, Scale } from 'lucide-react'
import { optimizeImageUrl } from '@/app/lib/imageOptimize'
import '../styles/inventory-modern.css'

type InventoryViewMode = 'grid' | 'list'

type Vehicle = {
    reg: string
    registration?: string
    make: string
    model: string
    derivative?: string
    subTitle?: string
    year?: number
    price?: number | string
    mileage?: number | string
    image?: string
    images?: string[]
    fuel?: string
    fuel_type?: string
    trans?: string
    transmission?: string
    slug?: string
    description?: string
    stock_status?: string
    body_type?: string
    bodyType?: string
    body?: string
    colour?: string
    color?: string
    first_reg_date?: string
    first_registration_date?: string
}

function normalizeImageUrl(url?: string) {
    if (!url) return ''
    try {
        // Normalize common CDN resize segments to request the original image path.
        return String(url).replace(/\/(?:\d+x\d+|\{resize\})\//g, '/')
    } catch {
        return String(url)
    }
}

function buildGalleryImages(vehicle: Vehicle): string[] {
    const candidates = [...(vehicle.images || []), vehicle.image]
        .map((value) => normalizeImageUrl(value))
        .filter(Boolean)

    const unique: string[] = []
    for (const imageUrl of candidates) {
        if (!unique.includes(imageUrl)) unique.push(imageUrl)
    }

    return unique.length ? unique : ['/images/IMG_6479.png']
}

function toNumericValue(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
        const parsed = Number(value.replace(/[^0-9.-]+/g, ''))
        return Number.isFinite(parsed) ? parsed : null
    }
    return null
}

function formatPounds(value: number): string {
    return `\u00A3${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`
}

function formatMileage(value: number | null): string {
    if (value === null) return 'Mileage on request'
    return `${value.toLocaleString('en-GB')} miles`
}

function formatYear(value: number | undefined): string {
    if (!value || !Number.isFinite(value)) return 'Year on request'
    return String(Math.trunc(value))
}

function cleanText(value: unknown): string {
    return String(value ?? '')
        .replace(/\s+/g, ' ')
        .trim()
}

function getListPreviewText(value: unknown, maxLength = 240): string {
    const text = cleanText(value)
    if (!text) return 'Contact us for the full specification and walkaround video.'
    if (text.length <= maxLength) return text
    return `${text.slice(0, maxLength).trimEnd()}...`
}

function getBodyStyle(vehicle: Vehicle): string {
    return cleanText(vehicle.body_type || vehicle.bodyType || vehicle.body) || 'On request'
}

function getFuelType(vehicle: Vehicle): string {
    return cleanText(vehicle.fuel || vehicle.fuel_type) || 'On request'
}

function getTransmission(vehicle: Vehicle): string {
    return cleanText(vehicle.trans || vehicle.transmission) || 'On request'
}

function getColour(vehicle: Vehicle): string {
    return cleanText(vehicle.colour || vehicle.color) || 'On request'
}

function getFirstRegistrationDate(vehicle: Vehicle): string {
    const raw = cleanText(vehicle.first_reg_date || vehicle.first_registration_date)
    if (!raw) return 'On request'

    const parsed = new Date(raw)
    if (Number.isNaN(parsed.getTime())) return raw

    return new Intl.DateTimeFormat('en-GB').format(parsed)
}

function getCardBadge(vehicle: Vehicle): string | null {
    const status = cleanText(vehicle.stock_status).toLowerCase()
    if (!status) return null
    if (status.includes('reserved') || status.includes('pending')) return 'Reserved'
    if (status.includes('sold')) return 'Sold'
    return null
}

function normalizeStoragePath(path: string): string {
    if (!path) return ''
    const trimmed = path.trim()
    if (!trimmed) return ''
    if (trimmed === '/') return '/'
    return trimmed.replace(/\/+$/, '')
}

function normalizeRegistrationIdentifier(value: unknown): string {
    const raw = cleanText(value)
    if (!raw) return ''
    return raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

function buildStoragePathByReg(vehicle: Vehicle): string {
    const regId = normalizeRegistrationIdentifier(vehicle.reg || vehicle.registration)
    return regId ? `/used-cars/${regId}` : ''
}

function getLegacyStorageKey(storageKey: string): string {
    const separatorIndex = storageKey.indexOf(':')
    if (separatorIndex < 0) return ''

    const prefix = storageKey.slice(0, separatorIndex + 1)
    const path = storageKey.slice(separatorIndex + 1)
    if (!path || path === '/' || path.endsWith('/')) return ''

    return `${prefix}${path}/`
}

function getVisibleIndicatorIndices(currentIndex: number, totalImages: number, maxVisible = 5): number[] {
    if (totalImages <= 0) return []

    const visibleCount = Math.max(1, Math.min(maxVisible, totalImages))
    const clampedCurrent = Math.min(Math.max(currentIndex, 0), totalImages - 1)
    const halfWindow = Math.floor(visibleCount / 2)

    let start = clampedCurrent - halfWindow
    let end = start + visibleCount

    if (start < 0) {
        start = 0
        end = visibleCount
    }

    if (end > totalImages) {
        end = totalImages
        start = end - visibleCount
    }

    return Array.from({ length: visibleCount }, (_, offset) => start + offset)
}

function readStoredFlag(storageKey: string): boolean {
    if (!storageKey) return false

    try {
        if (window.localStorage.getItem(storageKey) === '1') return true
        const legacyKey = getLegacyStorageKey(storageKey)
        return legacyKey ? window.localStorage.getItem(legacyKey) === '1' : false
    } catch {
        return false
    }
}

function writeStoredFlag(storageKey: string, next: boolean): void {
    if (!storageKey) return

    window.localStorage.setItem(storageKey, next ? '1' : '0')

    const legacyKey = getLegacyStorageKey(storageKey)
    if (legacyKey) {
        // Clear legacy key variants so counters don't drift.
        window.localStorage.setItem(legacyKey, '0')
    }
}

export default function InventoryCard({ vehicle, viewMode = 'grid' }: { vehicle: Vehicle; viewMode?: InventoryViewMode }) {
    const isListView = viewMode === 'list'
    const galleryImages = useMemo(() => buildGalleryImages(vehicle), [vehicle.images, vehicle.image])
    const priceValue = toNumericValue(vehicle.price)
    const mileageValue = toNumericValue(vehicle.mileage)
    const badge = getCardBadge(vehicle)
    const fuelType = getFuelType(vehicle)
    const transmission = getTransmission(vehicle)

    const title = [vehicle.year, vehicle.make, vehicle.model, vehicle.derivative || vehicle.subTitle]
        .map((part) => cleanText(part))
        .filter(Boolean)
        .join(' ')
        || cleanText(vehicle.reg)
        || 'Vehicle'

    const hasPersistentVehicleId = Boolean(vehicle.slug || vehicle.reg)
    const permalink = vehicle.slug
        ? `/used-cars/${vehicle.slug}`
        : vehicle.reg
            ? `/used-cars/${vehicle.reg}`
            : '/used-cars'
    const regStoragePath = useMemo(() => normalizeStoragePath(buildStoragePathByReg(vehicle)), [vehicle])
    const permalinkPath = useMemo(() => normalizeStoragePath(permalink), [permalink])
    const primaryStoragePath = regStoragePath || permalinkPath

    const monthlyPrice = priceValue !== null
        ? Math.round(priceValue / 60)
        : null

    const wishlistStorageKey = hasPersistentVehicleId && primaryStoragePath ? `vp-vehicle-wishlist:${primaryStoragePath}` : ''
    const compareStorageKey = hasPersistentVehicleId && primaryStoragePath ? `vp-vehicle-compare:${primaryStoragePath}` : ''
    const legacyWishlistStorageKey = hasPersistentVehicleId && permalinkPath ? `vp-vehicle-wishlist:${permalinkPath}` : ''
    const legacyCompareStorageKey = hasPersistentVehicleId && permalinkPath ? `vp-vehicle-compare:${permalinkPath}` : ''
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [isCompared, setIsCompared] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const hasMultipleImages = galleryImages.length > 1

    useEffect(() => {
        setCurrentImageIndex(0)
    }, [primaryStoragePath, galleryImages])

    useEffect(() => {
        if (!wishlistStorageKey && !compareStorageKey) return

        const syncFlags = () => {
            try {
                const wishlistState =
                    readStoredFlag(wishlistStorageKey) ||
                    Boolean(
                        legacyWishlistStorageKey &&
                        legacyWishlistStorageKey !== wishlistStorageKey &&
                        readStoredFlag(legacyWishlistStorageKey),
                    )
                const compareState =
                    readStoredFlag(compareStorageKey) ||
                    Boolean(
                        legacyCompareStorageKey &&
                        legacyCompareStorageKey !== compareStorageKey &&
                        readStoredFlag(legacyCompareStorageKey),
                    )
                setIsWishlisted(wishlistState)
                setIsCompared(compareState)
            } catch {
                setIsWishlisted(false)
                setIsCompared(false)
            }
        }

        const handleStorage = (event: StorageEvent) => {
            if (!event.key || event.key === wishlistStorageKey || event.key === compareStorageKey) {
                syncFlags()
            }
        }

        syncFlags()
        window.addEventListener('storage', handleStorage)
        window.addEventListener('vp:wishlist-updated', syncFlags)
        window.addEventListener('vp:compare-updated', syncFlags)

        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener('vp:wishlist-updated', syncFlags)
            window.removeEventListener('vp:compare-updated', syncFlags)
        }
    }, [wishlistStorageKey, compareStorageKey, legacyWishlistStorageKey, legacyCompareStorageKey])

    function toggleWishlist(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        event.stopPropagation()
        if (!wishlistStorageKey) return

        const next = !isWishlisted
        setIsWishlisted(next)

        try {
            writeStoredFlag(wishlistStorageKey, next)
            if (legacyWishlistStorageKey && legacyWishlistStorageKey !== wishlistStorageKey) {
                writeStoredFlag(legacyWishlistStorageKey, false)
            }
        } catch {
            // Keep UI responsive even if storage is blocked.
        }

        window.dispatchEvent(new CustomEvent('vp:wishlist-updated'))
    }

    function toggleCompare(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        event.stopPropagation()
        if (!compareStorageKey) return

        const next = !isCompared
        setIsCompared(next)

        try {
            writeStoredFlag(compareStorageKey, next)
            if (legacyCompareStorageKey && legacyCompareStorageKey !== compareStorageKey) {
                writeStoredFlag(legacyCompareStorageKey, false)
            }
        } catch {
            // Keep UI responsive even if storage is blocked.
        }

        window.dispatchEvent(new CustomEvent('vp:compare-updated'))
    }

    function showPrevImage(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        event.stopPropagation()
        if (!hasMultipleImages) return

        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
    }

    function showNextImage(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        event.stopPropagation()
        if (!hasMultipleImages) return

        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
    }

    function goToImage(event: React.MouseEvent<HTMLButtonElement>, index: number) {
        event.preventDefault()
        event.stopPropagation()
        setCurrentImageIndex(index)
    }

    const wishlistTitle = isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
    const compareTitle = isCompared ? 'Remove from compare' : 'Add to compare'
    const monthlyEstimate = monthlyPrice !== null ? `From ${formatPounds(monthlyPrice)}/mo` : 'Finance available'
    const displayPrice = priceValue !== null ? formatPounds(priceValue) : 'Enquire'
    const visibleIndicatorIndices = getVisibleIndicatorIndices(currentImageIndex, galleryImages.length)

    return (
        <article
            className={isListView ? 'inventory-card-modern is-list-view' : 'inventory-card-modern'}
            data-make={vehicle.make}
            data-model={vehicle.model}
            data-price={vehicle.price}
            data-mileage={vehicle.mileage}
            data-trans={transmission}
            data-fuel={fuelType}
            data-reg={vehicle.reg || vehicle.registration}
        >
            <div className="inventory-card-actions" aria-label="Vehicle actions">
                <button
                    type="button"
                    className={`inventory-card-action${isWishlisted ? ' is-active' : ''}`}
                    aria-pressed={isWishlisted}
                    aria-label={wishlistTitle}
                    title={wishlistTitle}
                    onClick={toggleWishlist}
                >
                    <Heart size={16} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    className={`inventory-card-action compare${isCompared ? ' is-active' : ''}`}
                    aria-pressed={isCompared}
                    aria-label={compareTitle}
                    title={compareTitle}
                    onClick={toggleCompare}
                >
                    <Scale size={16} aria-hidden="true" />
                </button>
            </div>

            <div className="inventory-card-link">
                <div className="inventory-card-media">
                    <a href={permalink} className="inventory-card-media-link" aria-label={`View details for ${title}`}>
                        <div
                            className="inventory-card-media-track"
                            style={{ transform: `translate3d(-${currentImageIndex * 100}%, 0, 0)` }}
                        >
                            {galleryImages.map((galleryImage, imageIndex) => (
                                <img
                                    key={`${galleryImage}-${imageIndex}`}
                                    alt={`${title} image ${imageIndex + 1}`}
                                    src={optimizeImageUrl(galleryImage, { width: 640 })}
                                    width={640}
                                    height={400}
                                    loading="lazy"
                                    decoding="async"
                                />
                            ))}
                        </div>
                    </a>
                    {hasMultipleImages ? (
                        <>
                            <div className="inventory-card-slider-controls" aria-label="Image gallery controls">
                                <button
                                    type="button"
                                    className="inventory-card-slider-btn"
                                    aria-label="View previous image"
                                    onClick={showPrevImage}
                                >
                                    <ChevronLeft size={16} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    className="inventory-card-slider-btn"
                                    aria-label="View next image"
                                    onClick={showNextImage}
                                >
                                    <ChevronRight size={16} aria-hidden="true" />
                                </button>
                            </div>
                            <span className="inventory-card-slider-count" aria-hidden="true">
                                {currentImageIndex + 1}/{galleryImages.length}
                            </span>
                            <div className="inventory-card-slider-indicators">
                                {visibleIndicatorIndices.map((indicatorIndex) => (
                                    <button
                                        key={`indicator-${indicatorIndex}`}
                                        type="button"
                                        className={indicatorIndex === currentImageIndex ? 'inventory-card-slider-indicator is-active' : 'inventory-card-slider-indicator'}
                                        aria-label={`View image ${indicatorIndex + 1}`}
                                        onClick={(event) => goToImage(event, indicatorIndex)}
                                    />
                                ))}
                            </div>
                        </>
                    ) : null}
                    {badge ? <span className="inventory-card-badge">{badge}</span> : null}
                </div>

                {isListView ? (
                    <a href={permalink} className="inventory-card-content-link" aria-label={`View details for ${title}`}>
                        <div className="inventory-card-body inventory-card-body-list">
                            <div className="inventory-list-head">
                                <h3>{title}</h3>
                                <p className="inventory-list-price">{displayPrice}</p>
                            </div>

                            <dl className="inventory-list-meta">
                                <div>
                                    <dt>Mileage:</dt>
                                    <dd>{formatMileage(mileageValue)}</dd>
                                </div>
                                <div>
                                    <dt>Colour:</dt>
                                    <dd>{getColour(vehicle)}</dd>
                                </div>
                                <div>
                                    <dt>Transmission:</dt>
                                    <dd>{transmission}</dd>
                                </div>
                                <div>
                                    <dt>Fuel Type:</dt>
                                    <dd>{fuelType}</dd>
                                </div>
                                <div>
                                    <dt>Body Style:</dt>
                                    <dd>{getBodyStyle(vehicle)}</dd>
                                </div>
                                <div>
                                    <dt>First Reg Date:</dt>
                                    <dd>{getFirstRegistrationDate(vehicle)}</dd>
                                </div>
                            </dl>

                            <p className="inventory-list-description">
                                {getListPreviewText(vehicle.description)} <span className="inventory-list-view-more">View More</span>
                            </p>
                        </div>
                    </a>
                ) : (
                    <a href={permalink} className="inventory-card-content-link" aria-label={`View details for ${title}`}>
                        <div className="inventory-card-body">
                            <h3>{title}</h3>
                            <ul className="inventory-specs">
                                <li>
                                    <CalendarDays size={14} aria-hidden="true" /> {formatYear(vehicle.year)}
                                </li>
                                <li>
                                    <Gauge size={14} aria-hidden="true" /> {formatMileage(mileageValue)}
                                </li>
                                <li>
                                    <Fuel size={14} aria-hidden="true" /> {fuelType}
                                </li>
                                <li>
                                    <Cog size={14} aria-hidden="true" /> {transmission}
                                </li>
                            </ul>
                            <p className="inventory-price">
                                <span>{monthlyEstimate}</span> {displayPrice}
                            </p>
                        </div>
                    </a>
                )}
            </div>
        </article>
    )
}
