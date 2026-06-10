'use client'

import { useState } from 'react'
import type { Testimonial } from '../lib/cars'
import styles from './Testimonials.module.css'

export type TestimonialsProps = {
  items: Testimonial[]
}

export default function Testimonials({ items }: TestimonialsProps) {
  const [active, setActive] = useState(0)

  if (!items.length) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {items.map((t, i) => (
          <figure
            key={`${t.name}-${i}`}
            className={`${styles.card} ${i === active ? styles.cardActive : ''}`}
            onMouseEnter={() => setActive(i)}
          >
            <svg width="26" height="20" viewBox="0 0 26 20" className={styles.quoteIcon} aria-hidden>
              <path
                d="M0 20V10C0 4 3 0 10 0v4C6 4 5 7 5 10h5v10H0zm16 0V10c0-6 3-10 10-10v4c-4 0-5 3-5 6h5v10H16z"
                fill="currentColor"
              />
            </svg>
            <blockquote className={styles.quote}>{t.quote}</blockquote>
            <figcaption className={styles.figcaption}>
              <p className={styles.name}>{t.name}</p>
              {t.title && <p className={styles.title}>{t.title}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className={styles.dots} role="tablist" aria-label="Testimonials">
        {items.map((t, i) => (
          <button
            type="button"
            key={`${t.name}-${i}`}
            role="tab"
            aria-selected={i === active}
            aria-label={`Testimonial from ${t.name}`}
            onClick={() => setActive(i)}
            className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
