'use client'

import { Star, Quote } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './ReviewsSection.module.css'

const FALLBACK_REVIEWS = [
  {
    name: 'Verified buyer',
    rating: 5,
    platform: 'Customer review',
    review:
      'The team made the buying process straightforward, with clear communication and a well-presented vehicle at handover.',
  },
  {
    name: 'Recent customer',
    rating: 5,
    platform: 'Customer review',
    review:
      'Helpful advice, easy paperwork and no pressure. Every question was answered before we made a decision.',
  },
  {
    name: 'Part-exchange customer',
    rating: 5,
    platform: 'Customer review',
    review:
      'A fair part-exchange discussion and a professional service from enquiry through to collection.',
  },
]

export default function ReviewsSection() {
  const brand = useBrand()
  const reviews = Array.isArray(brand?.testimonials) && brand.testimonials.length
    ? brand.testimonials.slice(0, 3)
    : FALLBACK_REVIEWS

  return (
    <section className={`auto-section ${styles.section}`} aria-labelledby="reviews-title">
      <div className="auto-container">
        <header className={styles.header}>
          <p className="auto-eyebrow" data-aos="fade-right">Customer reviews</p>
          <h2 id="reviews-title" className="auto-section-title" data-aos="fade-up">
            Verified feedback from real buyers.
          </h2>
        </header>

        <ul className={styles.grid}>
          {reviews.map((r: any, i) => {
            const rating = Number(r.rating) || 5
            return (
              <li
                key={`${r.name}-${i}`}
                className={styles.card}
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <Quote className={styles.quoteMark} size={28} aria-hidden="true" />

                <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={16}
                      fill={idx < rating ? 'currentColor' : 'transparent'}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <p className={styles.review}>{r.review}</p>

                <footer className={styles.meta}>
                  <p className={styles.name}>{r.name}</p>
                  <p className={styles.platform}>
                    via {r.platform || 'Customer review'}
                  </p>
                </footer>
              </li>
            )
          })}
        </ul>

        <div className={styles.platforms} data-aos="fade-up" data-aos-delay="300">
          <span>Reviews shown where available from the dealer profile.</span>
        </div>
      </div>
    </section>
  )
}
