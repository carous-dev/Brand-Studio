'use client'

import styles from './SpecsBar.module.css'

const STATS = [
  { value: 'Live', label: 'Stock updates' },
  { value: '300+', label: 'Happy customers' },
  { value: '125+', label: 'Makes & models' },
  { value: '6/7', label: 'Days open Mon-Sat' },
]

export default function SpecsBar() {
  return (
    <section className={styles.bar} aria-label="Dealer at a glance">
      <ul className={styles.grid}>
        {STATS.map((stat, i) => (
          <li
            key={stat.label}
            className={styles.cell}
            data-aos="fade-up"
            data-aos-delay={i * 100}
          >
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
