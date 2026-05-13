'use client'

import styles from './Testimonials.module.css'

// Seed testimonials paraphrased from public AutoTrader reviews of the dealer
// this theme was built for — kept generic enough to stay credible when the
// theme is re-used for a different operator. Owner-name and brand-name are
// avoided so the testimonials don't outwardly contradict a re-skin.
type Testimonial = {
  quote: string
  author: string
  location: string
  rating: number
  type: 'car' | 'bike'
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Second car I have bought here. The owner is patient and not pushy — answered every question and never rushed me. Thoroughly recommend.',
    author: 'Repeat buyer',
    location: 'Leicester',
    rating: 5,
    type: 'car',
  },
  {
    quote: 'First-time buyer and could not have asked for a better experience. Process felt relaxed and easy from start to finish — zero pressure.',
    author: 'First-time buyer',
    location: 'Leicestershire',
    rating: 5,
    type: 'car',
  },
  {
    quote: 'Bought a Skoda — perfect service. They followed up with the full service history after collection. Four months on, still happy.',
    author: 'Skoda owner',
    location: 'East Midlands',
    rating: 5,
    type: 'car',
  },
]

function initialOf(name: string) {
  const match = name.match(/[A-Za-z]/)
  return match ? match[0].toUpperCase() : '★'
}

export default function Testimonials() {
  return (
    <section className={`dual-section ${styles.section}`} aria-label="Customer reviews">
      <div className="dual-container">
        <header className={styles.head}>
          <span className="dual-eyebrow" data-aos="fade-up">Customer reviews</span>
          <h2 className={styles.title} data-aos="fade-up" data-aos-delay="80">
            5-star rated by drivers and riders
          </h2>
          <p className={styles.lead} data-aos="fade-up" data-aos-delay="160">
            Paraphrased excerpts from independently verified AutoTrader reviews — patient, no pressure, real follow-up after the sale.
          </p>
        </header>

        <div className={styles.grid}>
          {TESTIMONIALS.map((t, idx) => (
            <article key={t.author} className={styles.card} data-aos="fade-up" data-aos-delay={120 + idx * 100}>
              <svg
                className={styles.quoteGlyph}
                viewBox="0 0 56 44"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 44V26.4C0 17.6 1.84 10.93 5.52 6.4 9.2 1.87 14.96 0 22.8 0v8.8c-3.92 0-6.84.93-8.76 2.8-1.92 1.87-2.88 4.93-2.88 9.2H22V44H0Zm34 0V26.4c0-8.8 1.84-15.47 5.52-20 3.68-4.53 9.44-6.4 17.28-6.4v8.8c-3.92 0-6.84.93-8.76 2.8-1.92 1.87-2.88 4.93-2.88 9.2H56V44H34Z" />
              </svg>

              <div className={styles.topRow}>
                <span className={`${styles.badge} ${t.type === 'bike' ? styles.badgeBike : styles.badgeCar}`}>
                  {t.type === 'bike' ? 'Bike buyer' : 'Car buyer'}
                </span>
                <div className={styles.stars} aria-label={`${t.rating} out of 5`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                    </svg>
                  ))}
                </div>
              </div>

              <blockquote className={styles.quote}>{t.quote}</blockquote>

              <footer className={styles.attribution}>
                <span className={styles.avatar} aria-hidden="true">{initialOf(t.author)}</span>
                <span className={styles.person}>
                  <strong>{t.author}</strong>
                  <span className={styles.location}>{t.location}</span>
                </span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
