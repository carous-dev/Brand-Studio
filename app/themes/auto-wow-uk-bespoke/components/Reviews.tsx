import styles from './Reviews.module.css'

type Review = {
  rating: number
  body: string
  author: string
  vehicle?: string
  location?: string
}

const REVIEWS: Review[] = [
  {
    rating: 5,
    body: 'Honestly the smoothest car-buy I have ever had. Vehicle was exactly as described, paperwork was sorted before I arrived, and they threw in a full tank.',
    author: 'Liam P.',
    vehicle: 'BMW 3 Series',
    location: 'Reading',
  },
  {
    rating: 5,
    body: 'They sourced me a car from spec when I could not find what I wanted on the forecourt. Two weeks later it was on my drive with finance pre-approved.',
    author: 'Aisha R.',
    vehicle: 'Audi Q3',
    location: 'Birmingham',
  },
  {
    rating: 5,
    body: 'Old-school service, modern process. The team kept me updated, explained the finance options properly and never pressured me. Will be back.',
    author: 'David M.',
    vehicle: 'Volkswagen Golf',
    location: 'Slough',
  },
]

function StarRow({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z"
            fill={i < rating ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.18)'}
          />
        </svg>
      ))}
    </span>
  )
}

export default function Reviews() {
  return (
    <section className={styles.section} aria-labelledby="reviews-heading">
      <div className={styles.inner}>
        <header className={styles.head} data-aos="fade-up">
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            What buyers say
          </p>
          <h2 id="reviews-heading" className={styles.heading}>
            <span className={styles.headingStrong}>4.9 / 5</span> from 200+ reviews.
          </h2>
        </header>

        <ul className={styles.grid}>
          {REVIEWS.map((review, idx) => (
            <li
              key={review.author}
              className={styles.card}
              data-aos="fade-up"
              data-aos-delay={String(idx * 120)}
            >
              <StarRow rating={review.rating} />
              <blockquote className={styles.quote}>&ldquo;{review.body}&rdquo;</blockquote>
              <footer className={styles.author}>
                <span className={styles.authorName}>{review.author}</span>
                {review.vehicle ? <span className={styles.authorMeta}>{review.vehicle} · {review.location}</span> : null}
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
