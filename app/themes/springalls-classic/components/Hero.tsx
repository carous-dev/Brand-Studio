'use client'

import { MapPin, ShieldCheck, Star } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { HeroBackdrop } from './HeroBackdrop'
import styles from './page.module.css'

const SEARCH_FIELDS = [
  {
    label: 'Make',
    name: 'make',
    options: [
      { label: 'Any make', value: '' },
      { label: 'Subaru', value: 'Subaru' },
      { label: 'Nissan', value: 'Nissan' },
      { label: 'Toyota', value: 'Toyota' },
      { label: 'Ford', value: 'Ford' }
    ]
  },
  {
    label: 'Model',
    name: 'model',
    options: [
      { label: 'Any model', value: '' },
      { label: 'Impreza', value: 'Impreza' },
      { label: 'Forester', value: 'Forester' },
      { label: 'Outback', value: 'Outback' },
      { label: 'Legacy', value: 'Legacy' }
    ]
  },
  {
    label: 'Max price',
    name: 'max_price',
    options: [
      { label: 'Any price', value: '' },
      { label: 'Under £10,000', value: '10000' },
      { label: 'Under £20,000', value: '20000' },
      { label: 'Under £30,000', value: '30000' },
      { label: 'Under £40,000', value: '40000' }
    ]
  },
  {
    label: 'Max mileage',
    name: 'max_mileage',
    options: [
      { label: 'Any mileage', value: '' },
      { label: 'Under 25,000 miles', value: '25000' },
      { label: 'Under 50,000 miles', value: '50000' },
      { label: 'Under 75,000 miles', value: '75000' },
      { label: 'Under 100,000 miles', value: '100000' }
    ]
  }
]

export default function Hero() {
  const brand = useBrand()
  const city = brand?.location?.address?.city || ''
  const county = brand?.location?.address?.county || ''
  const area = [city, county].filter(Boolean).join(', ')
  const heroTitle = area ? `Used Cars for Sale in ${area}` : 'Used Cars for Sale'
  const asString = (v: unknown): string | null => (typeof v === 'string' && v ? v : null)
  const heroLead =
    asString(brand?.aboutUs?.description) ||
    asString((brand as any)?.description) ||
    `${brand?.name || 'This dealership'} is an independent dealership offering hand-picked used cars, flexible finance, and part exchange support.`
  const reviewImage = (brand as any)?.heroReviewImage || '/images/google-at-motorsinc.png'

  return (
    <section className={styles.hero}>
      <HeroBackdrop className={styles.heroBackdrop} />
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{heroTitle}</h1>
        <p className={styles.heroLead}>{heroLead}</p>

        <form className={styles.heroSearch} aria-label="Vehicle search" method="GET" action="/used-cars">
          <div className={styles.heroFields}>
            {SEARCH_FIELDS.map((field) => (
              <label key={field.label} className={styles.heroField}>
                <span className="sr-only">{field.label}</span>
                <select aria-label={field.label} name={field.name} defaultValue="">
                  {field.options.map((option) => (
                    <option key={option.label} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <button type="submit" className={styles.heroSearchBtn}>Search used cars</button>
        </form>

        <div className={styles.heroPills} role="list">
          <span className={styles.heroPill} role="listitem">
            <Star size={14} strokeWidth={2.2} aria-hidden="true" />
            Highly rated for customer service
          </span>
          <span className={styles.heroPill} role="listitem">
            <ShieldCheck size={14} strokeWidth={2.2} aria-hidden="true" />
            Privately bought, fully inspected stock
          </span>
          <span className={styles.heroPill} role="listitem">
            <MapPin size={14} strokeWidth={2.2} aria-hidden="true" />
            {area || 'Contact the showroom'}
          </span>
        </div>
      </div>
    </section>
  )
}
