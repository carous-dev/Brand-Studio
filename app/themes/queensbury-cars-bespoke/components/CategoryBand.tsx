'use client'

import Link from 'next/link'
import styles from './CategoryBand.module.css'

type Category = {
  id: string
  label: string
  description: string
  href: string
  icon: React.ReactNode
}

const CATEGORIES: Category[] = [
  {
    id: 'family',
    label: 'Family',
    description: 'Estates, MPVs and 7-seaters built for the school run and the long weekend.',
    href: '/used-cars?body=Estate',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1L2 11v5h3" />
        <circle cx="6.5" cy="16.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'sport',
    label: 'Sport & Coupé',
    description: 'Performance hatches, coupés and saloons — the cars that put the smile back in driving.',
    href: '/used-cars?body=Coupe',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 11l2-5.5a2 2 0 0 1 1.9-1.5h6.2a2 2 0 0 1 1.9 1.5L19 11" />
        <rect x="2" y="11" width="20" height="6" rx="2" />
        <path d="M5 17v2M19 17v2" />
      </svg>
    ),
  },
  {
    id: 'suv',
    label: 'SUV & 4×4',
    description: 'Higher ride, more boot, all-weather confidence — from compact crossovers to full-size 4×4s.',
    href: '/used-cars?body=SUV',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12l2-5h14l2 5" />
        <path d="M3 12v5h2a2 2 0 1 0 4 0h6a2 2 0 1 0 4 0h2v-5z" />
      </svg>
    ),
  },
]

export default function CategoryBand() {
  return (
    <section className="qb-section qb-section--tint" data-aos="fade-up">
      <div className="qb-container">
        <header className="qb-section-head">
          <span className="qb-eyebrow">Explore the floor</span>
          <h2 className="qb-section-title">Find the right shape for the way you drive.</h2>
          <p className="qb-section-lead">
            Browse by what you actually need — family room, weekend grin, all-weather grip. Filter further once
            you're in the stockroom.
          </p>
        </header>

        <ul className={styles.grid}>
          {CATEGORIES.map((cat, i) => (
            <li key={cat.id} data-aos="fade-up" data-aos-delay={i * 80}>
              <Link href={cat.href} className={styles.card}>
                <span className={styles.iconWrap} aria-hidden="true">
                  {cat.icon}
                </span>
                <span className={styles.label}>{cat.label}</span>
                <span className={styles.desc}>{cat.description}</span>
                <span className={styles.cta} aria-hidden="true">
                  Browse {cat.label.split(' ')[0]} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
