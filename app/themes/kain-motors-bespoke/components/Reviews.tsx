import styles from './Reviews.module.css'

const REVIEWS = [
  {
    body:
      'Bought my Audi A6 from Kain after months of looking around Manchester. The car was prepped properly, the warranty came as promised, and they actually picked up the phone when I rang back about a small trim issue. Will buy from again.',
    name: 'Hassan A.',
    location: 'Manchester · Trustpilot',
    rating: 5,
  },
  {
    body:
      'Got a great trade-in price for my Audi and drove home in a tidy BMW. No pressure on finance, paperwork sorted while we had coffee. Felt like buying from a friend, not a salesman.',
    name: 'Sophie L.',
    location: 'Stockport · Google Reviews',
    rating: 5,
  },
  {
    body:
      'Delivery arranged to Glasgow and the driver did a full walk-around before handing the keys over. Genuinely impressed — the Range Rover was even cleaner than the photos.',
    name: 'Iain M.',
    location: 'Glasgow · AutoTrader',
    rating: 5,
  },
]

const Star = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

export default function Reviews() {
  return (
    <section className={styles.section} aria-labelledby="reviews-heading">
      <div className={styles.inner}>
        <header className={styles.head} data-aos="fade-up">
          <p className="kain-eyebrow">The Buyer Notes</p>
          <h2 id="reviews-heading" className={styles.title}>What buyers say after the keys are in hand</h2>
        </header>

        <ol className={styles.grid}>
          {REVIEWS.map((r, idx) => (
            <li
              key={idx}
              className={`${styles.card} ${idx === 1 ? styles.cardLifted : ''}`}
              data-aos="fade-up"
              data-aos-delay={String(120 + idx * 80)}
            >
              <div className={styles.stars} aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, i) => <Star key={i} active={i < r.rating} />)}
              </div>
              <p className={styles.body}>{r.body}</p>
              <p className={styles.author}>
                <span className={styles.name}>{r.name}</span>
                <span className={styles.location}>{r.location}</span>
              </p>
            </li>
          ))}
        </ol>

        <p className={styles.foot}>
          Independent reviews aggregated from Google, AutoTrader and Trustpilot.
        </p>
      </div>
    </section>
  )
}
