'use client'

import styles from './StatsBand.module.css'

type Stat = { value: string; label: string; code: string }

const STATS: Stat[] = [
  { value: '12+',  label: 'Years on the floor',   code: 'YRS' },
  { value: '5★',   label: 'Google review rating', code: 'RAT' },
  { value: 'UK',   label: 'Nationwide delivery',  code: 'DLV' },
  { value: '£0',   label: 'Hard credit search',   code: 'FIN' },
]

export default function StatsBand({ stockCount }: { stockCount?: number }) {
  const stats =
    typeof stockCount === 'number' && stockCount > 0
      ? [{ value: `${stockCount}+`, label: 'Cars in stock', code: 'STK' }, ...STATS.slice(0, 3)]
      : STATS

  return (
    <section className={`axis-section axis-section--dark ${styles.section}`} aria-label="By the numbers">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <span className={styles.eyebrow}>{'> '}metrics.dump</span>
          <h2 className={styles.title}>The forecourt in figures</h2>
        </header>

        <div className={styles.grid}>
          {stats.map((stat, idx) => (
            <div key={`stat-${idx}`} className={styles.cell} data-aos="fade-up" data-aos-delay={idx * 70}>
              <span className={styles.cellCode}>{stat.code}</span>
              <span className={styles.cellValue}>{stat.value}</span>
              <span className={styles.cellLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
