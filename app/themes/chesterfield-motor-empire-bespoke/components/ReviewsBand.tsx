import { Star, Quote } from 'lucide-react'
import styles from './ReviewsBand.module.css'

const REVIEWS = [
  {
    name: 'Mark T.',
    location: 'Chesterfield',
    rating: 5,
    quote:
      'Family-run business with a personal touch. The delivery was prompt and the whole process was smooth and transparent.',
  },
  {
    name: 'Sarah J.',
    location: 'Derbyshire',
    rating: 5,
    quote:
      'Excellent service and very helpful staff. The car was in great condition and the warranty gave me confidence in my purchase.',
  },
  {
    name: 'David W.',
    location: 'Sheffield',
    rating: 5,
    quote:
      'Honest valuation on my part-ex and no pressure on the finance. Drove away the same week feeling confident in the deal.',
  },
]

export default function ReviewsBand() {
  return (
    <section className={styles.section} aria-labelledby="reviews-heading">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <p className={styles.eyebrow}>Customer reviews</p>
          <h2 id="reviews-heading" className={styles.heading}>
            <span className={styles.headingAccent}>★ ★ ★ ★ ★</span>
            <span>Verified customer feedback from Chesterfield buyers.</span>
          </h2>
        </header>

        <div className={styles.grid}>
          {REVIEWS.map((review, i) => (
            <article
              key={review.name}
              className={styles.card}
              data-aos="zoom-in-up"
              data-aos-delay={String(i * 80)}
            >
              <Quote size={24} strokeWidth={1.6} className={styles.cardQuote} aria-hidden="true" />
              <div className={styles.cardStars} aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: review.rating }).map((_, idx) => (
                  <Star key={idx} size={14} strokeWidth={2} fill="currentColor" />
                ))}
              </div>
              <p className={styles.cardQuoteText}>&ldquo;{review.quote}&rdquo;</p>
              <footer className={styles.cardFoot}>
                <p className={styles.cardName}>{review.name}</p>
                <p className={styles.cardLocation}>{review.location}</p>
              </footer>
            </article>
          ))}
        </div>

        <div className={styles.platformRow} data-aos="fade-up" data-aos-delay="240">
          <div className={styles.platform}>
            <span className={styles.platformName}>Google</span>
            <span className={styles.platformStars} aria-hidden="true">★ ★ ★ ★ ★</span>
          </div>
          <div className={styles.platform}>
            <span className={styles.platformName}>Autotrader</span>
            <span className={styles.platformStars} aria-hidden="true">★ ★ ★ ★ ★</span>
          </div>
          <div className={styles.platform}>
            <span className={styles.platformName}>Direct from customers</span>
            <span className={styles.platformStars} aria-hidden="true">★ ★ ★ ★ ★</span>
          </div>
        </div>
      </div>
    </section>
  )
}
