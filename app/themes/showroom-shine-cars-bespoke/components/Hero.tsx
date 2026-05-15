'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowUpRight, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './Hero.module.css'

const MAKES = ['Any make', 'Audi', 'BMW', 'Ford', 'Mercedes-Benz', 'Volkswagen', 'Vauxhall', 'Volvo', 'Toyota', 'Nissan', 'Honda', 'Hyundai', 'Kia', 'Mazda', 'Peugeot']
const BODIES = ['Any body', 'Hatchback', 'Saloon', 'Estate', 'SUV', 'Coupe', 'Convertible', 'MPV', 'Pickup']
const PRICES = [
  { label: 'Any price', value: '' },
  { label: 'Under GBP 5,000', value: '0-4999' },
  { label: 'GBP 5,000-GBP 10,000', value: '5000-10000' },
  { label: 'GBP 10,000-GBP 15,000', value: '10000-15000' },
  { label: 'GBP 15,000-GBP 20,000', value: '15000-20000' },
  { label: 'GBP 20,000-GBP 30,000', value: '20000-30000' },
  { label: 'Over GBP 30,000', value: '30000-100000' },
]

export default function Hero() {
  const brand = useBrand()
  const dealerName = brand?.name || 'this dealership'
  const city = (brand as any)?.location?.address?.city || (brand as any)?.location?.city || ''
  const tagline = typeof brand?.tagline === 'string' && brand.tagline.trim()
    ? brand.tagline.trim()
    : 'Quality used cars, honestly sold.'
  const phoneDisplay = String((brand as any)?.location?.phone || '').trim()
  const phoneTel = phoneDisplay.replace(/[^\d+]/g, '')
  const router = useRouter()

  const [make, setMake] = useState('Any make')
  const [body, setBody] = useState('Any body')
  const [price, setPrice] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (make !== 'Any make') params.set('make', make)
    if (body !== 'Any body') params.set('body', body)
    if (price) {
      const [min, max] = price.split('-')
      if (min) params.set('min_price', min)
      if (max) params.set('max_price', max)
    }
    router.push(`/used-cars${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <section className={styles.hero}>
      <div className={styles.heroImage} aria-hidden />
      <div className={styles.heroOverlay} aria-hidden />

      <div className={styles.heroInner}>
        <div className={styles.heroLead} data-aos="fade-up">
          <span className="shr-eyebrow">{city ? `${city} used-car dealer` : 'Independent used-car dealer'}</span>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleEmph}>{tagline}</span>
            <span className={styles.titleLine2}>{dealerName}</span>
          </h1>
          <p className={styles.heroLeadCopy}>
            Browse carefully prepared vehicles from {dealerName}. Enquire online, ask about finance,
            and speak to the team before you visit.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/used-cars" className={`shr-btn-primary ${styles.primaryCta}`} data-aos="zoom-in" data-aos-delay="120">
              Browse stock
              <ArrowUpRight size={18} strokeWidth={2.4} />
            </Link>
            {phoneDisplay ? (
              <a href={`tel:${phoneTel}`} className={`shr-btn-ghost-dark ${styles.secondaryCta}`}>
                <Phone size={16} strokeWidth={2.4} aria-hidden />
                {phoneDisplay}
              </a>
            ) : null}
          </div>
        </div>

        <form
          className={styles.searchCard}
          onSubmit={handleSearch}
          aria-label="Quick stock search"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className={styles.searchHead}>
            <span className={styles.searchEyebrow}>Quick stock search</span>
          </div>
          <div className={styles.searchGrid}>
            <label className={styles.searchField}>
              <span>Make</span>
              <select value={make} onChange={(e) => setMake(e.target.value)}>
                {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className={styles.searchField}>
              <span>Body type</span>
              <select value={body} onChange={(e) => setBody(e.target.value)}>
                {BODIES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
            <label className={styles.searchField}>
              <span>Price range</span>
              <select value={price} onChange={(e) => setPrice(e.target.value)}>
                {PRICES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
            <button type="submit" className={styles.searchSubmit}>
              <Search size={18} strokeWidth={2.4} aria-hidden />
              <span>Search stock</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
