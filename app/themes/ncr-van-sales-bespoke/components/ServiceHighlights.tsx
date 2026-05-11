'use client'

import Link from 'next/link'
import { Wrench, Wallet, RefreshCcw, Truck, ShieldCheck, ArrowUpRight } from 'lucide-react'
import styles from './ServiceHighlights.module.css'

const SERVICES = [
  {
    icon: Wrench,
    title: 'Used Vans',
    body: 'Panel vans, Lutons, tippers and crew cabs — all inspected, prepared and listed with full spec.',
    href: '/used-cars',
  },
  {
    icon: Wallet,
    title: 'Finance',
    body: 'Tailored finance packages for sole traders, limited companies and fleet operators.',
    href: '/finance',
  },
  {
    icon: RefreshCcw,
    title: 'Part Exchange',
    body: 'Free valuation on your existing van against any vehicle in our stock list.',
    href: '/part-exchange',
  },
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    body: 'Direct from forecourt to your yard. Insured transport across the UK mainland.',
    href: '/services',
  },
  {
    icon: ShieldCheck,
    title: '7-Day Exchange',
    body: 'Buy with confidence. Not happy in the first week? Swap for another van of equal value.',
    href: '/services',
  },
]

export default function ServiceHighlights() {
  return (
    <section className={styles.section} aria-labelledby="services-title">
      <div className={`${styles.bgImage}`} aria-hidden="true" data-mfx-scroll="parallax-medium" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={`${styles.glow} mfx-glow-orbit`} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <p className={styles.eyebrow}>What we offer</p>
          <h2 id="services-title" className={styles.title}>
            Built for the <span className={styles.titleAccent}>working day.</span>
          </h2>
          <p className={styles.lead}>
            Everything trade buyers actually need — packaged into five no-nonsense services.
          </p>
        </header>

        <ul className={styles.grid}>
          {SERVICES.map((s, i) => {
            const Icon = s.icon
            return (
              <li
                key={s.title}
                className={`${styles.card} ${i === 0 ? styles.cardFeatured : ''}`}
                data-aos="zoom-in-up"
                data-aos-delay={i * 80}
              >
                <Link href={s.href} className={styles.cardLink}>
                  <span className={styles.iconWrap} aria-hidden="true">
                    <Icon size={24} strokeWidth={2} />
                  </span>
                  <h3 className={styles.cardTitle}>{s.title}</h3>
                  <p className={styles.body}>{s.body}</p>
                  <span className={styles.linkRow}>
                    Learn more
                    <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
