import { Star } from 'lucide-react'
import styles from './ReviewsSection.module.css'

/**
 * Columbus Vehicles — Reviews (rugged archetype)
 * 3-column testimonial grid. Reviews come from brand.testimonials when
 * available; falls back to representative anchor reviews so the section
 * never renders empty during a prospect preview.
 *
 * Stars rendered with the brand-token --color-review-star (defaults to
 * amber). Each card is bordered with a thin amber accent line at the top.
 */
type Testimonial = {
  name?: string
  date?: string
  rating?: number | string
  platform?: string
  review?: string
}

const FALLBACK_REVIEWS: Testimonial[] = [
  {
    name: 'James M.',
    rating: 5,
    platform: 'Google',
    review: "Best 4×4 dealer I've used. The team know their Wranglers inside out and the part-exchange valuation was the fairest I'd been offered.",
  },
  {
    name: 'Helen K.',
    rating: 5,
    platform: 'AutoTrader',
    review: 'Bought a Defender remotely — full video walkaround, finance arranged in two phone calls, delivered to my door in West Yorkshire on a covered transporter.',
  },
  {
    name: 'David R.',
    rating: 5,
    platform: 'Google',
    review: "Genuine specialists who don't oversell. They told me to wait for a better example rather than push the one I'd queried — that's why I came back.",
  },
]

function StarRow({ rating }: { rating: number }) {
  const stars = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <span className={styles.stars} aria-label={`${stars} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          strokeWidth={1.4}
          aria-hidden="true"
          fill={i < stars ? 'currentColor' : 'none'}
          className={i < stars ? styles.starFilled : styles.starEmpty}
        />
      ))}
    </span>
  )
}

export default function ReviewsSection({ testimonials }: { testimonials?: Testimonial[] }) {
  const items = (testimonials && testimonials.length > 0 ? testimonials : FALLBACK_REVIEWS).slice(0, 3)

  return (
    <section className={styles.section} aria-labelledby="reviews-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>What customers say</p>
          <h2 id="reviews-heading" className={styles.heading}>Trusted by 4×4 owners across the UK</h2>
        </header>

        <ul className={styles.grid} role="list">
          {items.map((t, i) => {
            const rating = Number(t.rating) || 5
            return (
              <li key={`${t.name || 'review'}-${i}`} className={styles.card}>
                <StarRow rating={rating} />
                <blockquote className={styles.quote}>
                  <p>{t.review || ''}</p>
                </blockquote>
                <footer className={styles.cardFooter}>
                  <span className={styles.author}>{t.name || 'Customer'}</span>
                  {t.platform ? <span className={styles.platform}>via {t.platform}</span> : null}
                </footer>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
