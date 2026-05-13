'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBrand } from '../../context/BrandClientWrapper'
import styles from './Hero.module.css'

type VehicleType = 'all' | 'car' | 'bike'

const PRICE_BANDS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Any price' },
  { value: '0-5000', label: 'Up to £5,000' },
  { value: '5000-10000', label: '£5,000 – £10,000' },
  { value: '10000-20000', label: '£10,000 – £20,000' },
  { value: '20000-30000', label: '£20,000 – £30,000' },
  { value: '30000-', label: '£30,000+' },
]

/**
 * Splits a tagline into a main line + accent line for the Hero title.
 * Heuristic: comma first, then full stop boundary that leaves a short tail
 * (≤4 words), else word-count midpoint. Falls back to whole string + null.
 */
function splitTagline(raw: string): { main: string; accent: string | null } {
  const t = String(raw || '').trim().replace(/\s+/g, ' ')
  if (!t) return { main: '', accent: null }

  const commaIdx = t.indexOf(',')
  if (commaIdx > 0 && commaIdx < t.length - 4) {
    return { main: t.slice(0, commaIdx).trim(), accent: t.slice(commaIdx + 1).trim() }
  }

  const cleaned = t.replace(/\.$/, '')
  const words = cleaned.split(' ')
  if (words.length <= 3) return { main: t, accent: null }

  const accentCount = Math.min(3, Math.max(2, Math.ceil(words.length * 0.45)))
  const mainWords = words.slice(0, words.length - accentCount)
  const accentWords = words.slice(words.length - accentCount)
  const trailingDot = t.endsWith('.') ? '.' : ''
  return {
    main: mainWords.join(' '),
    accent: accentWords.join(' ') + trailingDot,
  }
}

export default function Hero() {
  const brand = useBrand()
  const router = useRouter()
  const tagline = (brand as any)?.tagline as string | undefined
  const aboutDescription = (brand as any)?.aboutUs?.description as string | undefined
  const address = (brand as any)?.location?.address as Record<string, string> | undefined
  const cityish = address?.city || address?.county || ''
  const brandName = brand?.name || ''

  const [type, setType] = useState<VehicleType>('all')
  const [query, setQuery] = useState('')
  const [priceBand, setPriceBand] = useState('')

  const { main: titleMain, accent: titleAccent } = tagline
    ? splitTagline(tagline)
    : { main: 'Two stocks.', accent: 'One trusted dealer.' }

  const lead =
    aboutDescription ||
    'Hand-picked vehicles, AA-inspected, with finance from £99/mo and nationwide delivery.'

  const eyebrow = tagline
    ? (cityish ? `${cityish} dealer · Quality stock` : `${brandName || 'Independent'} · Quality stock`)
    : 'Cars · Bikes · Side by side'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (type !== 'all') params.set('type', type)
    if (query.trim()) params.set('q', query.trim())
    if (priceBand) {
      const [min, max] = priceBand.split('-')
      if (min) params.set('priceMin', min)
      if (max) params.set('priceMax', max)
    }
    router.push(`/used-cars?${params.toString()}`)
  }

  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.heroImage} aria-hidden="true" />
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={styles.glowBlob} aria-hidden="true" />

      <div className={styles.heroInner}>
        <span className={styles.eyebrow} data-aos="fade-up">
          <span className="dual-icon-pulse" aria-hidden="true" />
          {eyebrow}
        </span>

        <h1 className={styles.title} data-aos="fade-up" data-aos-delay="80">
          {titleMain}
          {titleAccent ? (
            <>
              {' '}
              <span className={styles.titleAccent}>{titleAccent}</span>
            </>
          ) : null}
        </h1>

        <p className={styles.lead} data-aos="fade-up" data-aos-delay="160">
          {lead}
        </p>

        <form className={styles.filterBar} onSubmit={handleSearch} data-aos="fade-up" data-aos-delay="240">
          <div className={styles.filterTabs} role="tablist" aria-label="Vehicle type">
            {(['all', 'car', 'bike'] as VehicleType[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={type === t}
                className={`${styles.filterTab} ${type === t ? styles.filterTabActive : ''}`}
                onClick={() => setType(t)}
              >
                {t === 'all' ? 'All stock' : t === 'car' ? 'Cars' : 'Bikes'}
              </button>
            ))}
          </div>

          <div className={styles.filterRow}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Make, model, e.g. "BMW 320d"'
                className={styles.searchInput}
                aria-label="Keyword or registration"
              />
            </div>

            <div className={styles.selectWrap}>
              <select
                className={styles.select}
                value={priceBand}
                onChange={(e) => setPriceBand(e.target.value)}
                aria-label="Price band"
              >
                {PRICE_BANDS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
              <svg className={styles.selectChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            <button type="submit" className={styles.submitBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
