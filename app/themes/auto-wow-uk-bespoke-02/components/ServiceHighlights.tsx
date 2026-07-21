'use client'

import Link from 'next/link'
import { Wrench, BadgePoundSterling, RefreshCcw, Truck, ShieldCheck, ArrowRight } from 'lucide-react'
import styles from './ServiceHighlights.module.css'

const SERVICES = [
  {
    Icon: BadgePoundSterling,
    title: 'Finance',
    body: 'PCP, HP, and dealer arranged. Soft-search quote in minutes — no impact on your credit.',
    href: '/finance',
    cta: 'Get a quote',
  },
  {
    Icon: RefreshCcw,
    title: 'Part-exchange',
    body: 'Drive your old car in, drive a new one out. Honest valuation on the spot, no quibbles.',
    href: '/part-exchange',
    cta: 'Value my car',
  },
  {
    Icon: Truck,
    title: 'Nationwide delivery',
    body: 'Door-to-door delivery anywhere in mainland UK. Free within 30 miles, fixed price beyond.',
    href: '/services',
    cta: 'Delivery info',
  },
  {
    Icon: ShieldCheck,
    title: 'Warranty & MOT',
    body: 'Every car comes prepped, inspected and warranty-covered. MOT and service plans available.',
    href: '/services',
    cta: 'See warranty',
  },
]

export default function ServiceHighlights() {
  return (
    <section className={`auto-section ${styles.section}`} aria-label="Services" data-aos="fade-up">
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>[ Services ]</span>
          <h2 className={styles.title}>Everything you need, under one roof</h2>
          <p className={styles.lead}>
            Finance, part-exchange, delivery, warranty, MOT. The whole purchase
            happens on the same forecourt.
          </p>
        </header>

        <div className={styles.grid}>
          {SERVICES.map(({ Icon, title, body, href, cta }, idx) => (
            <Link
              key={title}
              href={href}
              className={styles.card}
            >
              <span className={styles.iconWrap} aria-hidden="true">
                <Icon size={28} strokeWidth={1.6} />
              </span>
              <span className={styles.cardNum} aria-hidden="true">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardBody}>{body}</p>
              <span className={styles.cardCta}>
                {cta}
                <ArrowRight size={14} strokeWidth={2} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
