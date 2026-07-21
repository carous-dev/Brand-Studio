'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, ArrowLeft, Calendar, Fuel, Gauge, Heart, GitCompare, Settings2,
} from 'lucide-react'
import styles from './FeaturedStock.module.css'
import { useGarage, type SavedVehicle } from '../context/GarageContext'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'

const toSlug = (value: string) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value || 0)

const formatMileage = (value: number) =>
  new Intl.NumberFormat('en-GB').format(value || 0)

function toSaved(v: InventoryVehicle): SavedVehicle {
  return {
    id: v.id,
    title: v.title,
    slug: v.slug,
    reg: v.reg,
    year: v.year,
    price: v.price,
    mileage: v.mileage,
    fuel: v.fuel,
    transmission: v.transmission,
    body: v.body,
    make: v.make,
    color: v.color,
    doors: v.doors,
    location: v.location,
    image: v.image,
  }
}

export default function FeaturedStock({ vehicles }: { vehicles?: any[] }) {
  const list = (vehicles || [])
    .map((v) => normalizeInventoryItem(v))
    .filter(Boolean)
    .slice(0, 8) as InventoryVehicle[]

  const { toggleWishlist, toggleCompare, isWishlisted, isCompared } = useGarage()
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateNavState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < max - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateNavState()
    el.addEventListener('scroll', updateNavState, { passive: true })
    window.addEventListener('resize', updateNavState)
    return () => {
      el.removeEventListener('scroll', updateNavState)
      window.removeEventListener('resize', updateNavState)
    }
  }, [updateNavState, list.length])

  const slide = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const first = el.querySelector<HTMLElement>(`.${styles.slide}`)
    const step = first ? first.offsetWidth + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <section className={`auto-section ${styles.section}`} aria-label="Recent stock" data-aos="fade-up">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.eyebrow}>Recent stock</span>
            <h2 className={styles.title}>Just landed</h2>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.navBtns}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => slide(-1)}
                disabled={!canPrev}
                aria-label="Previous vehicles"
              >
                <ArrowLeft size={16} strokeWidth={2} />
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => slide(1)}
                disabled={!canNext}
                aria-label="Next vehicles"
              >
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
            <Link href="/used-cars" className={`auto-cta-link ${styles.headerCta}`}>
              View all
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </header>

        {list.length === 0 ? (
          <div className={styles.empty}>
            <p>New stock arriving — check back shortly or call the showroom.</p>
            <Link href="/used-cars" className="auto-cta-link">See live inventory</Link>
          </div>
        ) : (
          <div className={styles.sliderWrap}>
            <div className={styles.track} ref={trackRef} role="list">
              {list.map((v) => {
                const saved = toSaved(v)
                const wishlisted = isWishlisted(v.id)
                const compared = isCompared(v.id)
                const href = buildVehiclePermalink(
                  { slug: v.slug || toSlug(v.title), reg: v.reg },
                  '/used-cars'
                )

                return (
                  <article key={v.id} className={styles.slide} role="listitem">
                    <div className={styles.card}>
                      <Link href={href} className={styles.cardLink} aria-label={`View ${v.title}`}>
                        <span className={styles.srOnly}>View details</span>
                      </Link>
                      <div
                        className={styles.image}
                        style={{ backgroundImage: `url(${v.image})` }}
                        role="img"
                        aria-label={v.title}
                      >
                        {v.featured ? (
                          <span className={styles.featuredBadge}>Featured</span>
                        ) : null}
                      </div>

                      <div className={styles.body}>
                        <h3 className={styles.cardTitle} title={v.title}>{v.title}</h3>

                        <div className={styles.specs}>
                          <span><Calendar size={13} strokeWidth={1.8} />{v.year || '—'}</span>
                          <span><Gauge size={13} strokeWidth={1.8} />{formatMileage(v.mileage)} mi</span>
                          <span><Fuel size={13} strokeWidth={1.8} />{v.fuel}</span>
                          <span><Settings2 size={13} strokeWidth={1.8} />{v.transmission}</span>
                        </div>

                        <div className={styles.footer}>
                          <div className={styles.priceRow}>
                            <span className={styles.priceLabel}>Drive away</span>
                            <span className={styles.price}>{formatPrice(v.price)}</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          data-active={wishlisted}
                          aria-pressed={wishlisted}
                          aria-label={wishlisted ? 'Saved to wishlist' : 'Save to wishlist'}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleWishlist(saved)
                          }}
                        >
                          <Heart size={15} strokeWidth={1.8} fill={wishlisted ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          data-active={compared}
                          aria-pressed={compared}
                          aria-label={compared ? 'Remove from compare' : 'Add to compare'}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleCompare(saved)
                          }}
                        >
                          <GitCompare size={15} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
