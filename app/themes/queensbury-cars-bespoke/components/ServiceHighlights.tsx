'use client'

import Link from 'next/link'
import styles from './ServiceHighlights.module.css'

type Service = {
  id: string
  title: string
  desc: string
  href: string
  icon: React.ReactNode
}

const SERVICES: Service[] = [
  {
    id: 'finance',
    title: 'Finance built for you',
    desc: 'Soft-search eligibility, PCP & HP quotes side-by-side, monthly payments that fit the budget.',
    href: '/finance',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
      </svg>
    ),
  },
  {
    id: 'part-exchange',
    title: 'Part exchange in minutes',
    desc: 'Plug in your reg, get a guide price right away, drop it in when you collect — no haggling.',
    href: '/part-exchange',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 3l4 4-4 4" />
        <path d="M21 7H6a3 3 0 0 0-3 3v0" />
        <path d="M7 21l-4-4 4-4" />
        <path d="M3 17h15a3 3 0 0 0 3-3v0" />
      </svg>
    ),
  },
  {
    id: 'delivery',
    title: 'UK-wide delivery',
    desc: 'Trade-plated drivers, fully-insured transit, doorstep handover with paperwork sorted up-front.',
    href: '/services',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-7" />
        <circle cx="6" cy="20" r="2" />
        <circle cx="19" cy="20" r="2" />
      </svg>
    ),
  },
  {
    id: 'aftercare',
    title: 'Aftercare for the long run',
    desc: 'Warranty options, MOT reminders, and a real person on the phone when something needs attention.',
    href: '/services',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
]

export default function ServiceHighlights() {
  return (
    <section className="qb-section" data-aos="fade-up">
      <div className="qb-container">
        <header className="qb-section-head" data-aos="fade-up">
          <span className="qb-eyebrow">What we do</span>
          <h2 className="qb-section-title">Buying a car shouldn't feel like a chore.</h2>
          <p className="qb-section-lead">
            Four things we sort end-to-end so you can spend less time on paperwork and more time on the road.
          </p>
        </header>

        <ul className={styles.grid}>
          {SERVICES.map((s, i) => (
            <li key={s.id} data-aos="fade-up" data-aos-delay={i * 70}>
              <Link href={s.href} className={styles.card}>
                <span className={styles.iconWrap} aria-hidden="true">
                  {s.icon}
                </span>
                <span className={styles.title}>{s.title}</span>
                <span className={styles.desc}>{s.desc}</span>
                <span className={styles.cta} aria-hidden="true">
                  Read more →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
