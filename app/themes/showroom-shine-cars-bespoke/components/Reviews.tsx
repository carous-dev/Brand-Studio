'use client'

import { Star, Quote } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './Reviews.module.css'

type ReviewCard = {
  name: string
  initials: string
  quote: string
  rating: number
}

function clampRating(value: unknown): number {
  const rating = typeof value === 'number' ? value : Number.parseFloat(String(value || ''))
  if (!Number.isFinite(rating)) return 5
  return Math.max(1, Math.min(5, Math.round(rating)))
}

function initialsFromName(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'CR'
}

function fallbackReviews(dealerName: string, city?: string): ReviewCard[] {
  const area = city ? ` in ${city}` : ''

  return [
    {
      name: 'Verified buyer',
      initials: 'VB',
      quote: `A smooth buying experience with ${dealerName}${area}. Clear communication, well-presented stock, and helpful handover from enquiry to collection.`,
      rating: 5,
    },
    {
      name: 'Recent customer',
      initials: 'RC',
      quote: `The team at ${dealerName} made the process straightforward and answered every question before we made a decision.`,
      rating: 5,
    },
    {
      name: 'Part-exchange customer',
      initials: 'PC',
      quote: 'Fair part-exchange guidance, honest vehicle details, and a professional service throughout.',
      rating: 5,
    },
  ]
}

function getReviews(brand: ReturnType<typeof useBrand>): ReviewCard[] {
  const testimonials = Array.isArray(brand?.testimonials) ? brand.testimonials : []
  const imported = testimonials
    .map((item: any): ReviewCard | null => {
      if (!item || typeof item !== 'object') return null

      const quote = String(item.review || item.quote || item.body || '').trim()
      if (!quote) return null

      const name = String(item.name || item.author || 'Verified buyer').trim()
      const initials = String(item.initials || '').trim().toUpperCase() || initialsFromName(name)

      return {
        name,
        initials,
        quote,
        rating: clampRating(item.rating),
      }
    })
    .filter((item): item is ReviewCard => Boolean(item))

  if (imported.length > 0) return imported.slice(0, 3)

  return fallbackReviews(brand?.name || 'this dealership', brand?.location?.address?.city)
}

export default function Reviews() {
  const brand = useBrand()
  const reviews = getReviews(brand)
  const reviewCount = Math.max(1, Math.min(reviews.length, 3))
  const density = reviewCount === 1 ? 'compact' : reviewCount === 2 ? 'balanced' : 'full'

  return (
    <section className={`shr-section ${styles.section}`} id="reviews" data-density={density} data-aos="fade-up">
      <div className="shr-container">
        <div className={styles.head} data-aos="fade-up">
          <span className="shr-eyebrow">Customer Reviews</span>
          <h2 className={styles.title}>Feedback from recent buyers.</h2>
          <p className={styles.lead}>
            Customer feedback from recent buyers, shaped by the reviews available for this dealer.
          </p>
        </div>

        <div className={styles.grid} data-count={String(reviewCount)}>
          {reviews.map((r, i) => (
            <article key={`${r.name}-${i}`} className={styles.card} data-aos="fade-up" data-aos-delay={`${i * 100}`}>
              <Quote size={28} strokeWidth={1.6} className={styles.quoteIcon} aria-hidden />
              <div className={styles.stars} aria-label={`${r.rating} out of 5`}>
                {Array.from({ length: r.rating }).map((_, idx) => (
                  <Star key={idx} size={14} strokeWidth={1.6} fill="currentColor" />
                ))}
              </div>
              <p className={styles.quote}>{r.quote}</p>
              <div className={styles.attribution}>
                <span className={styles.avatar} aria-hidden>{r.initials}</span>
                <span className={styles.name}>{r.name}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
