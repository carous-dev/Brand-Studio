'use client'

import { Truck, Wallet, ShieldCheck, MapPinned } from 'lucide-react'
import styles from './SpecsBar.module.css'

const STATS = [
  { icon: Truck, value: '200+', label: 'Vans in stock', sub: 'Updated daily' },
  { icon: Wallet, value: '0% APR', label: 'Finance available', sub: 'Subject to status' },
  { icon: MapPinned, value: 'UK-wide', label: 'Delivery to your yard', sub: 'Direct from forecourt' },
  { icon: ShieldCheck, value: '7-day', label: 'Exchange promise', sub: 'No-quibble policy' },
]

export default function SpecsBar() {
  return (
    <section className={styles.section} aria-label="Why buy from us">
      <div className={`${styles.glow} mfx-glow-pulse`} aria-hidden="true" />
      <div className={styles.inner}>
        <ul className={styles.grid}>
          {STATS.map((s, i) => {
            const Icon = s.icon
            return (
              <li key={s.label} className={styles.card} data-aos="fade-up" data-aos-delay={i * 100}>
                <span className={styles.iconWrap} aria-hidden="true">
                  <Icon size={22} strokeWidth={2} />
                </span>
                <strong className={styles.value}>{s.value}</strong>
                <span className={styles.label}>{s.label}</span>
                <span className={styles.sub}>{s.sub}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
