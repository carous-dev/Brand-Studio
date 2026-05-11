'use client'

import { Quote, Star } from 'lucide-react'
import styles from './Reviews.module.css'

type Review = { author: string; role: string; quote: string; rating: number }

const FALLBACK: Review[] = [
  {
    author: 'D. Patel',
    role: 'Owner, P&S Couriers',
    quote: 'Three Transits over five years. Honest pricing, finance sorted in a morning, no nonsense. The kind of dealer trade buyers actually want.',
    rating: 5,
  },
  {
    author: 'L. Henderson',
    role: 'Site Manager, Henderson Build',
    quote: 'Bought a tipper unseen — they delivered to site the next week, exactly as described. Workshop prep was spot on.',
    rating: 5,
  },
  {
    author: 'A. Brookes',
    role: 'Self-employed Plumber',
    quote: 'First van for the business. They walked me through finance and part-exchanged my old runaround at a fair number. Recommend.',
    rating: 5,
  },
]

export default function Reviews() {
  return (
    <section className={styles.section} aria-labelledby="reviews-title">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <p className={styles.eyebrow}>What trade buyers say</p>
          <h2 id="reviews-title" className={styles.title}>
            Backed by <span className={styles.titleAccent}>working drivers.</span>
          </h2>
        </header>

        <ul className={styles.grid}>
          {FALLBACK.map((review, i) => (
            <li key={review.author} className={styles.card} data-aos="fade-up" data-aos-delay={i * 100}>
              <Quote className={styles.quoteIcon} size={28} aria-hidden="true" />
              <div className={styles.stars} aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={16}
                    fill={idx < review.rating ? 'currentColor' : 'none'}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className={styles.quote}>"{review.quote}"</p>
              <footer className={styles.author}>
                <strong>{review.author}</strong>
                <span>{review.role}</span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
