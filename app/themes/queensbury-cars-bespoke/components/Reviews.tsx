'use client'

import styles from './Reviews.module.css'

type Review = {
  id: string
  name: string
  vehicle: string
  rating: number
  body: string
  date: string
}

const REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Aisha P.',
    vehicle: 'Bought a 2018 BMW 1 Series',
    rating: 5,
    body:
      'Honestly the easiest car purchase I have ever done. The finance was sorted in under 24 hours and they delivered to my door in Bristol — paperwork done in five minutes on the kerb.',
    date: 'March 2026',
  },
  {
    id: 'r2',
    name: 'Daniel K.',
    vehicle: 'Bought a 2020 Volkswagen Golf',
    rating: 5,
    body:
      "Chatted with them on WhatsApp, popped in on the Saturday, drove the Golf away that afternoon. They even sorted the part-exchange on my old Polo without me having to chase a quote.",
    date: 'February 2026',
  },
  {
    id: 'r3',
    name: 'Mehmet O.',
    vehicle: 'Bought a 2019 Audi A3',
    rating: 5,
    body:
      "Found a niggle with the boot release on day two and they had it sorted, courtesy car and all, without it costing me a thing. That's the bit that earns trust.",
    date: 'February 2026',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <span className={styles.stars} aria-label={`Rating: ${count} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill={i < count ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
        </svg>
      ))}
    </span>
  )
}

export default function Reviews() {
  return (
    <section className="qb-section" data-aos="fade-up">
      <div className="qb-container">
        <header className="qb-section-head" data-aos="fade-up">
          <span className="qb-eyebrow">Verified reviews</span>
          <h2 className="qb-section-title">Words from drivers who took the keys home.</h2>
        </header>

        <ul className={styles.grid}>
          {REVIEWS.map((r, i) => (
            <li key={r.id} className={styles.card} data-aos="fade-up" data-aos-delay={i * 80}>
              <Stars count={r.rating} />
              <blockquote className={styles.quote}>"{r.body}"</blockquote>
              <footer className={styles.meta}>
                <span className={styles.name}>{r.name}</span>
                <span className={styles.vehicle}>{r.vehicle}</span>
                <span className={styles.date}>{r.date}</span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
