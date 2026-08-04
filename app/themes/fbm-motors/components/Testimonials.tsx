'use client'

import type { Testimonial } from '../lib/cars'
import styles from './Testimonials.module.css'

export type TestimonialsProps = {
  items: Testimonial[]
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : ''
  return (first + last).toUpperCase()
}

export default function Testimonials({ items }: TestimonialsProps) {
  if (!items.length) return null

  return (
    <div className={styles.wrap}>
      <ul className={styles.grid}>
        {items.map((t, i) => (
          <li key={`${t.name}-${i}`} className={styles.item}>
            <figure className={styles.card}>
              <svg width="34" height="26" viewBox="0 0 26 20" className={styles.quoteIcon} aria-hidden>
                <path
                  d="M0 20V10C0 4 3 0 10 0v4C6 4 5 7 5 10h5v10H0zm16 0V10c0-6 3-10 10-10v4c-4 0-5 3-5 6h5v10H16z"
                  fill="currentColor"
                />
              </svg>

              <div className={styles.stars} aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} width="16" height="16" viewBox="0 0 20 20" aria-hidden>
                    <path
                      d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.1l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z"
                      fill="currentColor"
                    />
                  </svg>
                ))}
              </div>

              <blockquote className={styles.quote}>{t.quote}</blockquote>

              <figcaption className={styles.figcaption}>
                <span className={styles.avatar} aria-hidden>{initials(t.name)}</span>
                <span className={styles.person}>
                  <span className={styles.name}>{t.name}</span>
                  {t.title && <span className={styles.title}>{t.title}</span>}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  )
}
