'use client'

import { Star, Quote } from 'lucide-react'
import styles from './Reviews.module.css'

type Review = {
  text: string
  attribution: string
  context: string
  stars: number
}

const REVIEWS: Review[] = [
  {
    text:
      'Saw the car online Friday, drove it home Saturday. No silly fees, no pressure, finance sorted on the spot. Refreshing.',
    attribution: 'D. Patel',
    context: 'Verified Google review · April',
    stars: 5,
  },
  {
    text:
      'Asked them to deliver to Edinburgh, didn\'t expect a wash and full tank when it arrived. Properly looked after.',
    attribution: 'L. Howard',
    context: 'Verified Google review · February',
    stars: 5,
  },
  {
    text:
      'Found a small issue on the test drive, they sorted it before handover, no quibbles. That\'s how every dealer should work.',
    attribution: 'R. Mitchell',
    context: 'Verified Google review · January',
    stars: 5,
  },
]

export default function Reviews() {
  return (
    <section className={`auto-section ${styles.section}`} aria-label="Customer reviews" data-aos="fade-up">
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>[ What buyers say ]</span>
          <h2 className={styles.title}>5-star service. Verified.</h2>
          <p className={styles.lead}>
            We don&apos;t curate. These are real Google reviews from real buyers in the
            last six months.
          </p>
        </header>

        <div className={styles.grid}>
          {REVIEWS.map((review, idx) => (
            <article
              key={`review-${idx}`}
              className={styles.card}
            >
              <Quote size={22} strokeWidth={2} className={styles.quoteIcon} aria-hidden="true" />
              <div className={styles.stars} aria-label={`${review.stars} of 5 stars`}>
                {Array.from({ length: 5 }).map((_, starIdx) => (
                  <Star
                    key={`star-${idx}-${starIdx}`}
                    size={16}
                    strokeWidth={1.5}
                    fill={starIdx < review.stars ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <p className={styles.text}>{review.text}</p>
              <div className={styles.attribution}>
                <strong>{review.attribution}</strong>
                <span>{review.context}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
