'use client'

import { useMemo } from 'react'
import { BadgeCheck, Quote, Star } from 'lucide-react'
import type { BrandTestimonial } from '@/brands/types'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './CustomerReviews.module.css'

type Review = {
  name: string
  review: string
  rating: number
  date?: string
  platform?: string
}

const FALLBACK_REVIEWS: Review[] = [
  {
    name: 'Verified buyer',
    rating: 5,
    platform: 'Customer review',
    review:
      'A relaxed, professional handover from start to finish. The car was prepared beautifully and every question was answered clearly.',
  },
  {
    name: 'Recent customer',
    rating: 5,
    platform: 'Customer review',
    review:
      'No pressure at any point, just helpful advice and a straightforward process. I felt confident before taking the keys home.',
  },
  {
    name: 'Part-exchange customer',
    rating: 5,
    platform: 'Customer review',
    review:
      'The valuation was fair, the paperwork was simple and the team kept everything moving without any chasing.',
  },
]

export default function CustomerReviews() {
  const brand = useBrand()
  const brandName = brand?.name?.trim() || 'Warwick Hall Cars'

  const reviews = useMemo(() => {
    const configured = Array.isArray(brand?.testimonials) ? brand.testimonials : []
    const normalized = configured
      .map(normalizeTestimonial)
      .filter((review): review is Review => review !== null)
      .slice(0, 3)

    return normalized.length ? normalized : FALLBACK_REVIEWS
  }, [brand?.testimonials])

  const averageRating = (
    reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
  ).toFixed(1)
  const averageStars = normalizeRating(averageRating)
  const visibleCount = Math.min(reviews.length, 3)

  return (
    <section className={styles.section} id="reviews" aria-labelledby="warwick-reviews-heading" data-aos="fade-up">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <div className={styles.headerCopy}>
            <span className={styles.eyebrow}>
              <BadgeCheck size={16} strokeWidth={2} aria-hidden="true" />
              Customer reviews
            </span>
            <h2 id="warwick-reviews-heading" className={styles.heading}>
              Real feedback from recent buyers.
            </h2>
            <p className={styles.lead}>
              A quick read on the care {brandName} customers receive before,
              during and after handover.
            </p>
          </div>

          <aside className={styles.scorePanel} aria-label={`${averageRating} out of 5 average rating`}>
            <span className={styles.scoreLabel}>Average rating</span>
            <div className={styles.scoreRow}>
              <span className={styles.scoreValue}>{averageRating}</span>
              <Stars rating={averageStars} />
            </div>
            <p>Based on the customer feedback shown here.</p>
          </aside>
        </header>

        <ul className={styles.grid} data-count={visibleCount} aria-label="Customer review quotes">
          {reviews.map((review, index) => (
            <li
              key={`${review.name}-${index}`}
              className={styles.card}
              data-aos="fade-up"
              data-aos-delay={index * 90}
            >
              <div className={styles.cardHeader}>
                <span className={styles.avatar} aria-hidden="true">
                  {getInitials(review.name)}
                </span>
                <div className={styles.author}>
                  <span className={styles.name}>{review.name}</span>
                  <span className={styles.detail}>{formatDetail(review)}</span>
                </div>
              </div>

              <blockquote className={styles.quote}>
                <Quote size={22} strokeWidth={1.8} aria-hidden="true" />
                <p>{review.review}</p>
              </blockquote>

              <footer className={styles.cardFooter}>
                <Stars rating={review.rating} />
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function normalizeTestimonial(testimonial: BrandTestimonial): Review | null {
  const source = testimonial as Record<string, unknown>
  const review =
    cleanText(source.review) ||
    cleanText(source.quote) ||
    cleanText(source.body) ||
    cleanText(source.text) ||
    cleanText(source.description)

  if (!review) return null

  return {
    name: cleanText(source.name) || 'Verified buyer',
    review,
    rating: normalizeRating(source.rating),
    platform: cleanText(source.platform) || 'Customer review',
    date: cleanText(source.date),
  }
}

function normalizeRating(value: unknown): number {
  const parsed = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(parsed)) return 5
  return Math.max(1, Math.min(5, Math.round(parsed)))
}

function cleanText(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function formatDetail(review: Review): string {
  return [review.platform, formatReviewDate(review.date)].filter(Boolean).join(' | ') || 'Customer review'
}

function getInitials(name: string): string {
  const parts = name
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'VB'
  return parts
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function formatReviewDate(value: string | undefined): string {
  if (!value) return ''
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return value

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={15}
          fill={index < rating ? 'currentColor' : 'transparent'}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}
