"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import styles from "./LatestArrivalsSection.module.css"
import type { InventoryVehicle } from "../lib/inventory"
import { buildVehiclePermalink } from "../lib/vehicle-links"

type ArrivalItem = {
  id: string
  title: string
  price: string
  meta: string[]
  image: string
  href: string
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const formatPrice = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "POA"
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value)
}

const formatMileage = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "Mileage N/A"
  return `${new Intl.NumberFormat("en-GB").format(value)} miles`
}

function getItemsPerSlide() {
  if (typeof window === "undefined") return 1
  if (window.matchMedia("(min-width: 1100px)").matches) return 4
  if (window.matchMedia("(min-width: 700px)").matches) return 2
  return 1
}

function padArrivals(items: ArrivalItem[], itemsPerSlide: number) {
  if (items.length === 0) return []
  if (items.length >= itemsPerSlide && items.length % itemsPerSlide === 0) return items
  const padded = [...items]
  while (padded.length < itemsPerSlide || padded.length % itemsPerSlide !== 0) {
    padded.push(items[padded.length % items.length])
  }
  return padded
}

export default function LatestArrivalsSectionClient({ vehicles }: { vehicles: InventoryVehicle[] }) {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [itemsPerSlide, setItemsPerSlide] = useState(1)
  const [paused, setPaused] = useState(false)
  const scrollTimeoutRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  const arrivals = useMemo<ArrivalItem[]>(() => {
    return vehicles.slice(0, 12).map((vehicle) => ({
      id: vehicle.id,
      title: vehicle.title,
      price: formatPrice(vehicle.price),
      meta: [
        formatMileage(vehicle.mileage),
        vehicle.transmission || "Manual",
        vehicle.fuel || "Petrol"
      ],
      image: vehicle.image,
      href: buildVehiclePermalink({ slug: toSlug(vehicle.title), reg: vehicle.reg }, "/used-cars")
    }))
  }, [vehicles])

  const updateActiveIndex = useCallback(() => {
    const slider = sliderRef.current
    if (!slider || slider.clientWidth === 0) return
    const nextIndex = Math.round(slider.scrollLeft / slider.clientWidth)
    const pageCount = Math.max(1, Math.ceil(arrivals.length / itemsPerSlide))
    const looped = pageCount > 1
    const realIndex = looped
      ? nextIndex === 0
        ? pageCount - 1
        : nextIndex === pageCount + 1
          ? 0
          : nextIndex - 1
      : 0
    setActiveIndex(Math.min(Math.max(realIndex, 0), pageCount - 1))
  }, [arrivals.length, itemsPerSlide])

  useEffect(() => {
    const updateItems = () => setItemsPerSlide(getItemsPerSlide())
    updateItems()
    window.addEventListener("resize", updateItems)
    return () => window.removeEventListener("resize", updateItems)
  }, [])

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return
    const pageCount = Math.max(1, Math.ceil(arrivals.length / itemsPerSlide))
    const startIndex = pageCount > 1 ? 1 : 0
    slider.scrollTo({ left: slider.clientWidth * startIndex })
    setActiveIndex(0)
  }, [itemsPerSlide, arrivals.length])

  const scrollBySlides = useCallback((direction: number) => {
    const slider = sliderRef.current
    if (!slider) return
    slider.scrollBy({ left: direction * slider.clientWidth, behavior: "smooth" })
  }, [])

  const scrollToIndex = useCallback((index: number) => {
    const slider = sliderRef.current
    if (!slider) return
    const pageCount = Math.max(1, Math.ceil(arrivals.length / itemsPerSlide))
    const loopOffset = pageCount > 1 ? 1 : 0
    slider.scrollTo({ left: slider.clientWidth * (index + loopOffset), behavior: "smooth" })
  }, [arrivals.length, itemsPerSlide])

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    const onScroll = () => {
      if (frameRef.current) return
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        updateActiveIndex()

        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current)
        }

        const pageCount = Math.max(1, Math.ceil(arrivals.length / itemsPerSlide))
        if (pageCount <= 1) return

        const nextIndex = Math.round(slider.scrollLeft / slider.clientWidth)
        scrollTimeoutRef.current = window.setTimeout(() => {
          if (nextIndex === 0) {
            slider.scrollTo({ left: slider.clientWidth * pageCount, behavior: "auto" })
          } else if (nextIndex === pageCount + 1) {
            slider.scrollTo({ left: slider.clientWidth, behavior: "auto" })
          }
        }, 120)
      })
    }

    slider.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", updateActiveIndex)
    updateActiveIndex()

    return () => {
      slider.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", updateActiveIndex)
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current)
    }
  }, [updateActiveIndex, itemsPerSlide, arrivals.length])

  useEffect(() => {
    if (paused) return
    const slider = sliderRef.current
    if (!slider) return
    const timer = window.setInterval(() => {
      const maxScroll = slider.scrollWidth - slider.clientWidth
      if (slider.scrollLeft + slider.clientWidth >= maxScroll - 4) {
        slider.scrollTo({ left: slider.clientWidth, behavior: "smooth" })
        return
      }
      slider.scrollBy({ left: slider.clientWidth, behavior: "smooth" })
    }, 5200)

    return () => {
      window.clearInterval(timer)
    }
  }, [paused])

  const pages = useMemo(() => {
    const padded = padArrivals(arrivals, itemsPerSlide)
    const group: ArrivalItem[][] = []
    for (let i = 0; i < padded.length; i += itemsPerSlide) {
      group.push(padded.slice(i, i + itemsPerSlide))
    }
    if (group.length <= 1) return group
    return [group[group.length - 1], ...group, group[0]]
  }, [arrivals, itemsPerSlide])

  const pageCount = Math.max(1, Math.ceil(arrivals.length / itemsPerSlide))

  if (!arrivals.length) return null

  return (
    <section className={styles.section} aria-labelledby="latest-arrivals-title">
      <div className={styles.sectionInner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Latest Arrivals</p>
          <div className={styles.titleRow}>
            <div>
              <h2 id="latest-arrivals-title" className={styles.title}>Fresh in stock this week</h2>
              <p className={styles.subtitle}>
                Hand-picked vehicles added to our forecourt. Move quickly or reserve online.
              </p>
            </div>
            <div className={styles.controls}>
              <div className={styles.dots} role="tablist" aria-label="Latest arrivals slides">
                {Array.from({ length: pageCount }).map((_, index) => (
                  <button
                    key={`latest-arrivals-page-${index}`}
                    type="button"
                    className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-pressed={index === activeIndex}
                    onClick={() => scrollToIndex(index)}
                  />
                ))}
              </div>
              <div className={styles.navButtons}>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={() => scrollBySlides(-1)}
                  aria-label="Previous arrivals"
                >
                  <ChevronLeft size={18} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={() => scrollBySlides(1)}
                  aria-label="Next arrivals"
                >
                  <ChevronRight size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className={styles.slider}
          ref={sliderRef}
          aria-label="Latest arrivals slider"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {pages.map((page, pageIndex) => (
            <article key={`latest-arrivals-slide-${pageIndex}`} className={styles.slide}>
              <div className={styles.slideGrid}>
                {page.map((arrival, itemIndex) => (
                  <Link
                    key={`${arrival.id}-${itemIndex}`}
                    href={arrival.href}
                    className={styles.card}
                    aria-label={`View details for ${arrival.title}`}
                  >
                    <div
                      className={styles.cardImage}
                      role="img"
                      aria-label={arrival.title}
                      style={{ backgroundImage: `url(${arrival.image})` }}
                    >
                      <span className={styles.badge}>Latest Arrival</span>
                      <span className={styles.priceTag}>{arrival.price}</span>
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{arrival.title}</h3>
                      <div className={styles.meta}>
                        {arrival.meta.map((item, metaIndex) => (
                          <span key={`${arrival.id}-meta-${metaIndex}`} className={styles.metaItem}>{item}</span>
                        ))}
                      </div>
                    </div>
                    <span className={styles.ribbon}>Finance from 2.4% APR</span>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
