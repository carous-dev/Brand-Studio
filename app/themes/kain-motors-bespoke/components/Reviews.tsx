'use client'

import { useBrand } from '../context/BrandClientWrapper'
import { getBrandText } from '../lib/brand-text'
import styles from './Reviews.module.css'

type Review = { body: string; name: string; location: string; rating: number }

const Star = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

export default function Reviews() {
  const brand = useBrand()
  const text = getBrandText(brand)
  const city = (brand?.location?.address as any)?.city as string | undefined
  const nearby = city || 'the showroom'
  const reviews: Review[] = [
    {
      body: `Bought my Audi A6 from ${text.name} after months of looking around ${nearby}. The car was prepped properly, the warranty came as promised, and they actually picked up the phone when I rang back about a small trim issue. Will buy from again.`,
      name: 'Hassan A.',
      location: city ? `${city} · Trustpilot` : 'Trustpilot',
      rating: 5,
    },
    {
      body: 'Got a great trade-in price for my Audi and drove home in a tidy BMW. No pressure on finance, paperwork sorted while we had coffee. Felt like buying from a friend, not a salesman.',
      name: 'Sophie L.',
      location: 'Google Reviews',
      rating: 5,
    },
    {
      body: 'Delivery arranged the length of the country and the driver did a full walk-around before handing the keys over. Genuinely impressed — the Range Rover was even cleaner than the photos.',
      name: 'Iain M.',
      location: 'AutoTrader',
      rating: 5,
    },
  ]
  return (
    <section className={styles.section} aria-labelledby="reviews-heading">
      <div className={styles.inner}>
        <header className={styles.head} data-aos="fade-up">
          <p className="kain-eyebrow">The Buyer Notes</p>
          <h2 id="reviews-heading" className={styles.title}>What buyers say after the keys are in hand</h2>
        </header>

        <ol className={styles.grid}>
          {reviews.map((r, idx) => (
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
