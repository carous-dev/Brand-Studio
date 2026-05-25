'use client'

import styles from './StatsBand.module.css'

type Stat = { value: string; label: string; sub?: string }

const STATS: Stat[] = [
  { value: '12+', label: 'Years on the lot', sub: 'Independent since 2014' },
  { value: '5★', label: 'Average rating', sub: 'Verified Google reviews' },
  { value: 'UK', label: 'Nationwide delivery', sub: 'From £0 within 30 miles' },
  { value: '£0', label: 'Hard credit search', sub: 'Soft check, no impact' },
]

export default function StatsBand({ stockCount }: { stockCount?: number }) {
  const stats =
    typeof stockCount === 'number' && stockCount > 0
      ? [{ value: `${stockCount}+`, label: 'Cars in stock', sub: 'Live inventory' }, ...STATS.slice(0, 3)]
      : STATS

  return (
    <section className={`auto-section auto-section--dark ${styles.section}`} aria-label="By the numbers">
      <div className={`${styles.gridOverlay} auto-decor-mobile-hide`} aria-hidden="true" />
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <span className={styles.eyebrow}>[ By the numbers ]</span>
          <h2 className={styles.title}>The forecourt in figures</h2>
        </header>

        <div className={styles.grid}>
          {stats.map((stat, idx) => (
            <div key={`stat-${idx}`} className={styles.cell} data-aos="fade-up" data-aos-delay={idx * 80}>
              <span className={styles.value}>{stat.value}</span>
              <span className={styles.label}>{stat.label}</span>
              {stat.sub ? <span className={styles.sub}>{stat.sub}</span> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
