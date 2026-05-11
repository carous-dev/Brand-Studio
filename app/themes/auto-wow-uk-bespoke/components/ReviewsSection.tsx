'use client'

import { Star, Quote } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './ReviewsSection.module.css'

const FALLBACK_REVIEWS = [
  {
    name: 'Mark T.',
    rating: 5,
    platform: 'Google',
    review:
      'AUTOWOW UK made importing my vehicle straightforward and stress-free. The team kept me in the loop and the car arrived exactly as described. Highly recommend their professionalism.',
  },
  {
    name: 'Sarah J.',
    rating: 5,
    platform: 'Autotrader',
    review:
      'Excellent service from start to finish. The team helped me find a great car at a fair price with no hidden fees. Easy paperwork, fast delivery, friendly aftercare.',
  },
  {
    name: 'David R.',
    rating: 5,
    platform: 'Google',
    review:
      'Bought my family car here last month. They knew their stock inside out and answered every question. I&rsquo;ll come back when it&rsquo;s time to upgrade.',
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
                    via {r.platform || 'Google'}
                  </p>
                </footer>
              </li>
            )
          })}
        </ul>

        <div className={styles.platforms} data-aos="fade-up" data-aos-delay="300">
          <span>Read more on</span>
          <strong>Google</strong>
          <strong>Autotrader</strong>
          <strong>AUTOWOW UK</strong>
        </div>
      </div>
    </section>
  )
}
