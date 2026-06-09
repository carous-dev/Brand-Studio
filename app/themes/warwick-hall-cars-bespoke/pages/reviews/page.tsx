import Link from 'next/link'
import { ArrowRight, BadgeCheck, Quote, Star } from 'lucide-react'
import type { BrandTestimonial } from '@/brands/types'
import type { ThemePageProps } from '../../../types'
import styles from '../info-page.module.css'

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
    review: 'A relaxed, professional handover from start to finish. The car was prepared beautifully and every question was answered clearly.',
  },
  {
    name: 'Recent customer',
    rating: 5,
    platform: 'Customer review',
    review: 'No pressure at any point, just helpful advice and a straightforward process. I felt confident before taking the keys home.',
  },
  {
    name: 'Part-exchange customer',
    rating: 5,
    platform: 'Customer review',
    review: 'The valuation was fair, the paperwork was simple and the team kept everything moving without any chasing.',
  },
]

export function WarwickReviewsPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Warwick Hall Cars'
  const reviews = Array.isArray(brand?.testimonials)
    ? brand.testimonials.map(normalizeTestimonial).filter((review): review is Review => review !== null)
    : []
  const visibleReviews = reviews.length ? reviews : FALLBACK_REVIEWS
  const averageRating = (
    visibleReviews.reduce((total, review) => total + review.rating, 0) / visibleReviews.length
  ).toFixed(1)

  return (
    <main className={styles.page} style={{ '--page-hero-image': 'var(--brand-image-about)' } as any}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>
            <BadgeCheck size={17} aria-hidden="true" />
            Reviews
          </span>
          <h1 className={styles.heroTitle}>Customer feedback from recent buyers.</h1>
          <p className={styles.heroLead}>
            Read what customers have said about buying, handover and service from {brandName}.
          </p>
          <div className={styles.heroActions}>
            <Link href="/used-cars" className={styles.primaryLink}>
              Browse stock
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/contact" className={styles.secondaryLink}>
              Contact the team
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.shell}>
          <header className={styles.sectionHeadCenter}>
            <span className={styles.kicker}>Average rating {averageRating}</span>
            <h2 className={styles.title}>Reviews that help you buy with confidence.</h2>
            <p className={styles.lead}>
              Feedback is shown from the dealer profile where available. Speak with the team if you
              would like more detail about a specific vehicle or buying process.
            </p>
          </header>

          <div className={styles.reviewsGrid}>
            {visibleReviews.map((review, index) => (
              <article key={`${review.name}-${index}`} className={styles.reviewCard}>
                <div className={styles.stars} aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      size={15}
                      fill={starIndex < review.rating ? 'currentColor' : 'transparent'}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <Quote size={22} aria-hidden="true" />
                <blockquote className={styles.quote}>{review.review}</blockquote>
                <footer className={styles.reviewMeta}>
                  <span className={styles.reviewName}>{review.name}</span>
                  <span className={styles.reviewDetail}>{formatDetail(review)}</span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
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

export default WarwickReviewsPage
