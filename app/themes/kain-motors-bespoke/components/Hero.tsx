'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { apiUrl } from '../lib/api'
import styles from './Hero.module.css'

type Meta = {
  available?: {
    makes?: Array<string | { key?: string; name?: string }>
    bodies?: Array<string | { key?: string; name?: string }>
  }
  total?: number
}

const BODY_OPTIONS = ['Hatchback', 'Saloon', 'SUV', 'Estate', 'Coupe', 'Convertible', 'Van']

export default function Hero() {
  const brand = useBrand()
  const slug = brand?.slug
  const brandName = brand?.name || 'Kain Motors'
  const tagline = (brand as any)?.tagline || 'Where Quality Service Meets Affordable Prices'
  const contact = getBrandContactInfo(brand)

  const [makes, setMakes] = useState<string[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [make, setMake] = useState('')
  const [body, setBody] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // audit-ignore: data-useeffect-fetch — Hero is a client island needing useBrand() at runtime; meta fetch must run client-side after BrandStyles mounts.
  useEffect(() => {
    if (!slug) return
    let aborted = false
    fetch(apiUrl(`/inventory?brand=${encodeURIComponent(slug)}&per_page=1&light=1`), { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { meta?: Meta } | null) => {
        if (aborted || !data?.meta) return
        const ms = (data.meta.available?.makes || [])
          .map((m) => (typeof m === 'string' ? m : (m?.key ?? m?.name ?? '')))
          .filter((m): m is string => typeof m === 'string' && m.trim().length > 0)
          .map((m) => m.trim())
        const uniqueMs = Array.from(new Set(ms)).sort((a, b) => a.localeCompare(b))
        setMakes(uniqueMs)
        if (typeof data.meta.total === 'number') setTotal(data.meta.total)
      })
      .catch(() => {})
    return () => { aborted = true }
  }, [slug])

  function searchHref() {
    const params = new URLSearchParams()
    if (make) params.set('make', make)
    if (body) params.set('body', body.toLowerCase())
    if (maxPrice) params.set('max_price', maxPrice)
    const qs = params.toString()
    return qs ? `/used-cars?${qs}` : '/used-cars'
  }

  const liveCount = total ?? 0

  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.media} data-mfx-scroll="parallax-slow" aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.gridDrift} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.editorial} data-aos="fade-up">
          <p className={styles.eyebrow}>The Manchester Edition · 2026</p>
          <h1 className={styles.title}>
            Hand-picked stock,<br />
            <em className={styles.titleAccent}>honestly sold.</em>
          </h1>
          <p className={styles.lead}>
            {tagline}. Appointment-only showroom on Midlands Street with finance, warranty, part-exchange and
            nationwide delivery — no pressure, just the right cars.
          </p>

          <form
            className={styles.searchForm}
            onSubmit={(e) => { e.preventDefault(); window.location.href = searchHref() }}
            aria-label="Quick search"
          >
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Make</span>
              <select className={styles.select} value={make} onChange={(e) => setMake(e.target.value)} aria-label="Make">
                <option value="">Any make</option>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Body</span>
              <select className={styles.select} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Body type">
                <option value="">Any body</option>
                {BODY_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Max price</span>
              <select className={styles.select} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} aria-label="Max price">
                <option value="">Any price</option>
                <option value="5000">Up to £5,000</option>
                <option value="10000">Up to £10,000</option>
                <option value="15000">Up to £15,000</option>
                <option value="25000">Up to £25,000</option>
                <option value="40000">Up to £40,000</option>
              </select>
            </label>
            <button type="submit" className={`${styles.searchBtn} mfx-shimmer`}>
              Browse stock
            </button>
          </form>

          <div className={styles.ctaRow}>
            <Link href="/sell-my-car" className={styles.ctaGhost}>Sell your car →</Link>
            <Link href="/finance" className={styles.ctaGhost}>Apply for finance →</Link>
          </div>

          <ul className={styles.trustRail} aria-label="Trust signals">
            <li><span className="mfx-pulse-dot" aria-hidden="true" /> Live stock · {liveCount} cars available</li>
            <li>FCA-regulated finance partners</li>
            <li>Independent warranty included</li>
            <li>Nationwide UK delivery</li>
          </ul>
        </div>

        <aside className={styles.figurePanel} data-aos="fade-left" data-aos-delay="200" aria-hidden="true">
          <div className={styles.figureFrame}>
            <div className={styles.figureRule} aria-hidden="true" />
            <span className={styles.figureLabel}>Established</span>
            <span className={styles.figureNumber}>2021</span>
            <span className={styles.figureLabel}>Cars sold to date</span>
            <span className={styles.figureNumberSm}>1,200+</span>
            <div className={styles.figureRule} aria-hidden="true" />
            <p className={styles.figureNote}>
              Curated for buyers who prefer to be welcomed, not pitched. Book a viewing — we’ll have it ready.
            </p>
            {contact.phoneTel && (
              <a href={`tel:${contact.phoneTel}`} className={styles.figureCta}>
                Call {contact.phoneDisplay || contact.phoneTel}
              </a>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
