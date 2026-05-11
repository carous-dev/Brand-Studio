'use client'

import { Star, Quote } from 'lucide-react'
import styles from './Reviews.module.css'

const REVIEWS = [
  {
    name: 'Sophie L.',
    initials: 'SL',
    quote:
      'Highly recommend Showroom Shine Cars for their professionalism and quality vehicles. Very trustworthy dealership.',
    rating: 5,
  },
  {
    name: 'James T.',
    initials: 'JT',
    quote:
      'Excellent service and a great selection of cars. The appointment system made the buying process smooth and personal.',
    rating: 5,
  },
  {
    name: 'Aisha P.',
    initials: 'AP',
    quote:
      'Picked up a serviced and HPI-cleared Mazda — the part-exchange offer was the best of three we tried in the West Midlands.',
    rating: 5,
  },
] as const

const PLATFORMS = [
  { name: 'Google', rating: '5.0', href: '#reviews' },
  { name: 'Autotrader', rating: '5.0', href: '#reviews' },
  { name: 'Trustpilot', rating: '5.0', href: '#reviews' },
] as const

export default function Reviews() {
  return (
    <section className={`shr-section ${styles.section}`} id="reviews">
      <div className="shr-container">
        <div className={styles.head} data-aos="fade-up">
          <span className="shr-eyebrow">Customer Reviews</span>
          <h2 className={styles.title}>Five-star feedback from Coventry buyers.</h2>
          <p className={styles.lead}>
            Verified reviews from Showroom Shine Cars buyers across Google, Autotrader, and our own
            on-site feedback channel.
          </p>
        </div>

        <div className={styles.platforms}>
          {PLATFORMS.map((p, i) => (
            <div key={p.name} className={styles.platformCard} data-aos="zoom-in" data-aos-delay={`${i * 80}`}>
              <span className={styles.platformName}>{p.name}</span>
              <div className={styles.platformStars} aria-label={`${p.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={16} strokeWidth={1.6} fill="currentColor" />
                ))}
              </div>
              <span className={styles.platformRating}>{p.rating}</span>
            </div>
          ))}
        </div>

        <div className={styles.grid}>
          {REVIEWS.map((r, i) => (
            <article key={r.name} className={styles.card} data-aos="fade-up" data-aos-delay={`${i * 100}`}>
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
