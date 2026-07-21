'use client'

import { Car, Award, Star, Truck, ShieldCheck } from 'lucide-react'
import styles from './StatsBand.module.css'

type Stat = { value: string; label: string; sub?: string; Icon: typeof Car }

const STATS: Stat[] = [
  { Icon: Award, value: '12+', label: 'Years on the lot', sub: 'Independent since 2014' },
  { Icon: Star, value: '4.9', label: 'Average rating', sub: 'Verified Google reviews' },
  { Icon: Truck, value: 'UK', label: 'Nationwide delivery', sub: 'From £0 within 30 miles' },
  { Icon: ShieldCheck, value: '£0', label: 'Hard credit search', sub: 'Soft check, no impact' },
]

export default function StatsBand({ stockCount }: { stockCount?: number }) {
  const stats: Stat[] =
    typeof stockCount === 'number' && stockCount > 0
      ? [{ Icon: Car, value: `${stockCount}+`, label: 'Cars in stock', sub: 'Live inventory' }, ...STATS.slice(0, 3)]
      : STATS

  return (
    <section className={`auto-section ${styles.section}`} aria-label="By the numbers" data-aos="fade-up">
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>By the numbers</span>
          <h2 className={styles.title}>The forecourt in figures</h2>
        </header>

        <div className={styles.grid}>
          {stats.map((stat, idx) => {
            const Icon = stat.Icon
            return (
              <div
                key={`stat-${idx}`}
                className={styles.cell}
              >
                <span className={styles.iconWrap} aria-hidden="true">
                  <Icon size={22} strokeWidth={2} />
                </span>
                <span className={styles.value}>{stat.value}</span>
                <span className={styles.label}>{stat.label}</span>
                {stat.sub ? <span className={styles.sub}>{stat.sub}</span> : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
