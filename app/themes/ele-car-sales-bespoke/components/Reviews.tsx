import { Quote, Star } from 'lucide-react'
import styles from './Reviews.module.css'

type Review = {
  body: string
  author: string
  context: string
  rating: number
}

// Generic placeholder reviews. Replace with real Google / Trustpilot pulls
// when the dealer's review feed is wired up via the dashboard.
const REVIEWS: Review[] = [
  {
    body: 'Found exactly the car I was after, no hard sell, and the part-exchange offer beat the bigger dealers in Glasgow. Easy from start to finish.',
    author: 'Hannah B.',
    context: 'Bought a 2019 Audi A3',
    rating: 5,
  },
  {
    body: 'The team sorted out finance same day and had the car cleaned and ready by Saturday morning. Friendly, honest service.',
    author: 'Greig M.',
    context: 'Finance customer · Motherwell',
    rating: 5,
  },
  {
    body: 'Delivered the car to my front door in Newcastle. Spotless condition and they answered every question over WhatsApp first.',
    author: 'Daniel K.',
    context: 'Nationwide delivery',
    rating: 5,
  },
]

export default function Reviews() {
  return (
    <section className={styles.section} aria-labelledby="ele-reviews-title">
      <div className={styles.inner}>
        <div className={styles.head} data-aos="fade-up">
          <p className={styles.eyebrow}>Real customers</p>
          <h2 id="ele-reviews-title" className={styles.title}>
            What buyers say about ELE Car Sales.
          </h2>
        </div>

        <ul className={styles.grid} role="list">
          {REVIEWS.map((r, i) => (
            <li
              key={i}
              className={`${styles.card} ${i === 0 ? styles.cardFeature : ''}`}
              data-aos="fade-up"
              data-aos-delay={String(80 * i)}
            >
              <Quote size={28} aria-hidden="true" className={styles.quoteIcon} />
              <p className={styles.body}>{r.body}</p>
              <div className={styles.foot}>
                <div className={styles.rating} aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <Star key={idx} size={16} fill="currentColor" stroke="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <div>
                  <p className={styles.author}>{r.author}</p>
                  <p className={styles.context}>{r.context}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
