"use client"

import React, { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Heart, Gauge, Fuel, Settings } from "lucide-react"
import { useBrand } from "../context/BrandClientWrapper"
import "../styles/featured-redesign.css"

interface FeaturedVehicle {
  vin: string
  registration: string
  reg?: string
  derivative: string
  odometer_reading_miles: number
  mileage?: number
  colour: string
  forecourt_price_gbp: number
  price?: number
  featured: boolean
  status: string
  make?: string
  model?: string
  year?: string
  engine_capacity_cc?: number
  trans?: string
  images?: string[]
  image?: string
  slug?: string
  derivative_slug?: string
  date_on_forecourt?: string | null
  last_updated?: string | null
  first_registration_date?: string | null
}

type FeaturedResponse = FeaturedVehicle[] | { error?: string; vehicles?: FeaturedVehicle[] }

const tabs = ["Latest Arrivals"]

const PLACEHOLDER_IMAGE_PATTERNS = [
  /\/images\/placeholder\.(png|jpe?g|webp|svg)$/i,
  /no[-_ ]image/i,
  /image[-_ ]not[-_ ]available/i,
  /\/placeholder\.(png|jpe?g|webp|svg)$/i,
]

function isPlaceholderUrl(url: string): boolean {
  return PLACEHOLDER_IMAGE_PATTERNS.some((pattern) => pattern.test(url))
}

function normalizeImageUrl(url?: string) {
  if (!url) return ""
  try {
    // Normalize common CDN resize segments to request original image.
    return String(url).replace(/\/(?:\d+x\d+|\{resize\})\//g, "/")
  } catch {
    return String(url)
  }
}

function buildFeaturedGalleryImages(vehicle: FeaturedVehicle, fallbackImage: string): string[] {
  const candidates = [...(vehicle.images || []), vehicle.image]
    .map((value) => normalizeImageUrl(value))
    .filter((value) => Boolean(value) && !isPlaceholderUrl(value))

  const unique: string[] = []
  for (const imageUrl of candidates) {
    if (!unique.includes(imageUrl)) unique.push(imageUrl)
  }

  return unique.length ? unique : [fallbackImage]
}

function getFeaturedVehicleKey(vehicle: FeaturedVehicle, index: number): string {
  const baseKey = vehicle.derivative_slug || vehicle.registration || vehicle.vin || "featured-vehicle"
  return `${baseKey}-${index}`
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

function toTimestamp(value: unknown): number {
  if (value === null || value === undefined) return 0

  if (value instanceof Date) {
    const ts = value.getTime()
    return Number.isFinite(ts) ? ts : 0
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    if (value >= 1900 && value <= 2100) return Date.UTC(Math.trunc(value), 0, 1)
    if (value > 1e12) return Math.trunc(value)
    if (value > 1e9) return Math.trunc(value * 1000)
    return 0
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return 0

    const asYear = Number(trimmed)
    if (Number.isFinite(asYear) && trimmed.length === 4 && asYear >= 1900 && asYear <= 2100) {
      return Date.UTC(Math.trunc(asYear), 0, 1)
    }

    const parsed = Date.parse(trimmed)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function getRecentArrivalTimestamp(vehicle: FeaturedVehicle): number {
  const candidates: unknown[] = [
    vehicle.date_on_forecourt,
    vehicle.last_updated,
    vehicle.first_registration_date,
    vehicle.year,
  ]

  for (const candidate of candidates) {
    const ts = toTimestamp(candidate)
    if (ts > 0) return ts
  }

  return 0
}

function generateSlug(vehicle: FeaturedVehicle): string {
  try {
    if (vehicle.slug) {
      return vehicle.slug
    }
    if (vehicle.derivative_slug) {
      return vehicle.derivative_slug
    }

    const parts: string[] = []

    if (vehicle.make) parts.push(vehicle.make)
    if (vehicle.model) parts.push(vehicle.model)

    if (vehicle.derivative) {
      const derivPart = String(vehicle.derivative).split("•")[0].trim()
      if (derivPart) parts.push(derivPart)
    }

    const mileage = vehicle.mileage ?? vehicle.odometer_reading_miles ?? 0
    if (mileage) {
      parts.push(`${Math.round(mileage / 1000)},000 miles`)
    }

    const price = vehicle.price ?? vehicle.forecourt_price_gbp ?? 0
    if (price) parts.push(String(price))
    if (mileage) parts.push(String(mileage))

    const reg = vehicle.reg ?? vehicle.registration ?? vehicle.vin
    if (reg) parts.push(String(reg))

    return parts
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  } catch (error) {
    console.error("Error generating slug:", error)
    return vehicle.vin || vehicle.registration || "vehicle"
  }
}

function getWishlistId(vehicle: FeaturedVehicle): string {
  return String(vehicle.derivative_slug || vehicle.reg || vehicle.registration || vehicle.vin || "").trim()
}

function readWishlistIds(): string[] {
  try {
    const raw = localStorage.getItem("wishlistVehicles")
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.map((item) => String(item)).filter(Boolean) : []
  } catch {
    return []
  }
}

export default function FeaturedRedesign() {
  const brand = useBrand()
  const [vehicles, setVehicles] = useState<FeaturedVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [wishlistFlags, setWishlistFlags] = useState<Record<string, boolean>>({})
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      try {
        const brandSlug = brand.slug || ""
        const res = await fetch(`/api/featured-vehicles?brand=${encodeURIComponent(brandSlug)}&limit=12`)
        const data: FeaturedResponse = await res.json()
        if (!res.ok) {
          const message =
            !Array.isArray(data) && typeof data.error === "string" ? data.error : "Failed to fetch featured vehicles"
          throw new Error(message)
        }
        const normalizedVehicles = Array.isArray(data) ? data : Array.isArray(data.vehicles) ? data.vehicles : []
        setVehicles(normalizedVehicles)
      } catch (error) {
        console.error("Failed to fetch featured vehicles:", error)
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedVehicles()
  }, [brand.slug])

  const getPlaceholderImage = (vin: string) => {
    const images = [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=70",
    ]
    const seed = typeof vin === "string" && vin.length > 0 ? vin.charCodeAt(0) : 0
    return images[seed % images.length]
  }

  const featured = useMemo(() => {
    const sorted = [...vehicles].sort((a, b) => getRecentArrivalTimestamp(b) - getRecentArrivalTimestamp(a))
    return sorted.slice(0, 4)
  }, [vehicles])

  useEffect(() => {
    setCurrentImageIndices((previous) => {
      const next: Record<string, number> = {}
      let changed = false

      for (const [index, vehicle] of featured.entries()) {
        const vehicleKey = getFeaturedVehicleKey(vehicle, index)
        const fallbackImage = getPlaceholderImage(vehicle.vin || vehicle.registration || "")
        const galleryImages = buildFeaturedGalleryImages(vehicle, fallbackImage)
        const previousIndex = previous[vehicleKey] ?? 0
        const boundedIndex = Math.min(previousIndex, Math.max(galleryImages.length - 1, 0))
        next[vehicleKey] = boundedIndex

        if (!Object.prototype.hasOwnProperty.call(previous, vehicleKey) || previousIndex !== boundedIndex) {
          changed = true
        }
      }

      if (Object.keys(previous).length !== Object.keys(next).length) {
        changed = true
      }

      return changed ? next : previous
    })
  }, [featured])

  useEffect(() => {
    if (typeof window === "undefined") return

    const syncWishlist = () => {
      const ids = readWishlistIds()
      const nextFlags: Record<string, boolean> = {}
      for (const id of ids) nextFlags[id] = true
      setWishlistFlags(nextFlags)
    }

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "wishlistVehicles") {
        syncWishlist()
      }
    }

    syncWishlist()
    window.addEventListener("storage", handleStorage)
    window.addEventListener("wishlist:updated", syncWishlist as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("wishlist:updated", syncWishlist as EventListener)
    }
  }, [])

  function toggleWishlist(event: React.MouseEvent<HTMLButtonElement>, wishlistId: string) {
    event.preventDefault()
    event.stopPropagation()
    if (!wishlistId) return

    const current = readWishlistIds()
    const set = new Set(current)
    const shouldAdd = !set.has(wishlistId)

    if (shouldAdd) {
      set.add(wishlistId)
    } else {
      set.delete(wishlistId)
    }

    const next = Array.from(set)
    try {
      localStorage.setItem("wishlistVehicles", JSON.stringify(next))
      window.dispatchEvent(new Event("wishlist:updated"))
    } catch {
      // Keep UI responsive even if localStorage is unavailable.
    }

    setWishlistFlags((previous) => ({ ...previous, [wishlistId]: shouldAdd }))
  }

  function showPrevImage(event: React.MouseEvent<HTMLButtonElement>, vehicleKey: string, totalImages: number) {
    event.preventDefault()
    event.stopPropagation()
    if (totalImages <= 1) return

    setCurrentImageIndices((previous) => {
      const current = previous[vehicleKey] ?? 0
      return { ...previous, [vehicleKey]: (current - 1 + totalImages) % totalImages }
    })
  }

  function showNextImage(event: React.MouseEvent<HTMLButtonElement>, vehicleKey: string, totalImages: number) {
    event.preventDefault()
    event.stopPropagation()
    if (totalImages <= 1) return

    setCurrentImageIndices((previous) => {
      const current = previous[vehicleKey] ?? 0
      return { ...previous, [vehicleKey]: (current + 1) % totalImages }
    })
  }

  function goToImage(event: React.MouseEvent<HTMLButtonElement>, vehicleKey: string, index: number) {
    event.preventDefault()
    event.stopPropagation()

    setCurrentImageIndices((previous) => {
      if (previous[vehicleKey] === index) return previous
      return { ...previous, [vehicleKey]: index }
    })
  }

  if (loading) {
    return (
      <motion.section
        className="featured-redesign"
        aria-label="Latest arrivals"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="featured-container">
          <div className="featured-header">
            <h2 className="featured-title">Latest Arrivals</h2>
            <p className="featured-subtitle">Loading latest arrivals...</p>
          </div>
        </div>
      </motion.section>
    )
  }

  if (featured.length === 0) {
    return null
  }

  return (
    <motion.section
      className="featured-redesign"
      aria-label="Latest arrivals"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="featured-container">
        <div className="featured-header">
          <h2 className="featured-title">Latest Arrivals</h2>
          <div className="featured-tabs" role="tablist" aria-label="Latest arrival filters">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`featured-tab ${activeTab === tab ? "active" : ""}`}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="featured-grid">
          {featured.map((vehicle, index) => {
            const fallbackImage = getPlaceholderImage(vehicle.vin || vehicle.registration || "")
            const galleryImages = buildFeaturedGalleryImages(vehicle, fallbackImage)
            const hasMultipleImages = galleryImages.length > 1
            const vehicleKey = getFeaturedVehicleKey(vehicle, index)
            const currentImageIndex = Math.min(currentImageIndices[vehicleKey] ?? 0, Math.max(galleryImages.length - 1, 0))
            const visibleIndicatorIndices = getVisibleIndicatorIndices(currentImageIndex, galleryImages.length)
            const title =
              `${vehicle.year || ""}${vehicle.make ? " " + vehicle.make : ""}${vehicle.model ? " " + vehicle.model : ""}`.trim() ||
              vehicle.derivative ||
              "Featured Vehicle"
            const price = vehicle.price ?? vehicle.forecourt_price_gbp ?? 0
            const mileage = vehicle.mileage ?? vehicle.odometer_reading_miles ?? 0
            const transmission = vehicle.trans || "—"
            const engine = vehicle.engine_capacity_cc ? `${(vehicle.engine_capacity_cc / 1000).toFixed(1)}L` : "—"
            const vehicleUrl = `/used-cars/${generateSlug(vehicle)}`
            const wishlistId = getWishlistId(vehicle)
            const isWishlisted = wishlistId ? Boolean(wishlistFlags[wishlistId]) : false
            const wishlistTitle = isWishlisted ? "Remove from wishlist" : "Add to wishlist"

            return (
              <article key={vehicleKey} className="featured-card">
                <div className="featured-image">
                  <a href={vehicleUrl} className="featured-image-link" aria-label={`View details for ${title}`}>
                    <div className="featured-image-track" style={{ transform: `translate3d(-${currentImageIndex * 100}%, 0, 0)` }}>
                      {galleryImages.map((galleryImage, imageIndex) => (
                        <img
                          key={`${galleryImage}-${imageIndex}`}
                          src={galleryImage}
                          alt={`${title} image ${imageIndex + 1}`}
                          loading="lazy"
                          decoding="async"
                        />
                      ))}
                    </div>
                  </a>
                  {hasMultipleImages ? (
                    <>
                      <div className="featured-slider-controls" aria-label="Image gallery controls">
                        <button
                          type="button"
                          className="featured-slider-btn"
                          aria-label="View previous image"
                          onClick={(event) => showPrevImage(event, vehicleKey, galleryImages.length)}
                        >
                          <ChevronLeft size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="featured-slider-btn"
                          aria-label="View next image"
                          onClick={(event) => showNextImage(event, vehicleKey, galleryImages.length)}
                        >
                          <ChevronRight size={16} aria-hidden="true" />
                        </button>
                      </div>
                      <span className="featured-slider-count" aria-hidden="true">
                        {currentImageIndex + 1}/{galleryImages.length}
                      </span>
                      <div className="featured-slider-indicators">
                        {visibleIndicatorIndices.map((indicatorIndex) => (
                          <button
                            key={`featured-indicator-${vehicleKey}-${indicatorIndex}`}
                            type="button"
                            className={
                              indicatorIndex === currentImageIndex
                                ? "featured-slider-indicator is-active"
                                : "featured-slider-indicator"
                            }
                            aria-label={`View image ${indicatorIndex + 1}`}
                            onClick={(event) => goToImage(event, vehicleKey, indicatorIndex)}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
                <div className="featured-body">
                  <div className="featured-meta">{vehicle.make || "Used Vehicle"}</div>
                  <div className="featured-title-row">
                    <h3>{title}</h3>
                    <button
                      type="button"
                      className={`featured-like${isWishlisted ? " is-active" : ""}`}
                      aria-label={wishlistTitle}
                      title={wishlistTitle}
                      aria-pressed={isWishlisted}
                      onClick={(event) => toggleWishlist(event, wishlistId)}
                    >
                      <Heart size={16} />
                    </button>
                  </div>
                  <div className="featured-specs">
                    <span>
                      <Settings size={14} /> {transmission}
                    </span>
                    <span>
                      <Fuel size={14} /> {engine}
                    </span>
                    <span>
                      <Gauge size={14} /> {Number(mileage).toLocaleString()}
                    </span>
                  </div>
                  <div className="featured-price">
                    <span className="price-now">£{Number(price).toLocaleString()}</span>
                  </div>
                  <a href={vehicleUrl} className="featured-link">
                    View Details
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
