'use client'

import { Star } from 'lucide-react'
import styles from './Reviews.module.css'

type Review = { text: string; attribution: string; context: string; stars: number; code: string }

const REVIEWS: Review[] = [
  {
    code: '01',
    text:
      'Saw the car online Friday, drove it home Saturday. No silly fees, no pressure, finance sorted on the spot. Refreshing.',
    attribution: 'D. Patel',
    context: 'Verified Google review',
    stars: 5,
  },
  {
    code: '02',
    text:
      'Delivered to Edinburgh on schedule, washed and full of fuel. Genuinely looked after — that kind of detail keeps customers.',
    attribution: 'L. Howard',
    context: 'Verified Google review',
    stars: 5,
  },
  {
    code: '03',
    text:
      'Small issue on the test drive, sorted before handover — no quibbles. That\'s how every dealer should work.',
    attribution: 'R. Mitchell',
    context: 'Verified Google review',
    stars: 5,
  },
]

export default function Reviews() {
  return (
    <section className={`axis-section ${styles.section}`} aria-label="Customer reviews">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <span className={styles.eyebrow}>{'> '}reviews.verified</span>
          <h2 className={styles.title}>What buyers say</h2>
          <p className={styles.lead}>
            Real Google reviews from the last six months — no curation, no
            cherry-picking.
          </p>
        </header>

        <div className={styles.grid}>
          {REVIEWS.map((review, idx) => (
            <article key={review.code} className={styles.card} data-aos="fade-up" data-aos-delay={idx * 70}>
              <div className={styles.cardHead}>
                <span className={styles.cardCode}>{review.code}</span>
                <div className={styles.stars} aria-label={`${review.stars} of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <Star
                      key={`star-${review.code}-${starIdx}`}
                      size={14}
                      strokeWidth={1.5}
                      fill={starIdx < review.stars ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
              </div>
              <p className={styles.text}>&ldquo;{review.text}&rdquo;</p>
              <footer className={styles.attribution}>
                <strong>{review.attribution}</strong>
                <span>{review.context}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
