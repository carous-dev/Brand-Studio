'use client'

import Link from 'next/link'
import { Banknote, RefreshCcw, Truck, ShieldCheck, ArrowRight, ClipboardCheck } from 'lucide-react'
import styles from './ServiceHighlights.module.css'

const SERVICES = [
  {
    icon: Banknote,
    title: 'Car finance',
    body: 'Independent broker access. Hire purchase or PCP — we shop your application across multiple lenders for a fair rate.',
    href: '/finance',
  },
  {
    icon: RefreshCcw,
    title: 'Part-exchange',
    body: 'Fair, transparent valuations against your next car. Just send us a few details and photos — we\'ll come back the same day.',
    href: '/part-exchange',  // canonical
  },
  {
    icon: Truck,
    title: 'Nationwide delivery',
    body: 'We deliver to your door. Optional pre-delivery inspection report so you know exactly what you\'re receiving.',
    href: '/services',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty included',
    body: 'Every car ships with a 3-month warranty as standard. Extended cover available at handover.',
    href: '/services',
  },
  {
    icon: ClipboardCheck,
    title: 'Mechanically inspected',
    body: 'A 100-point check before any car joins the forecourt. Full service history verified where possible.',
    href: '/about',
  },
] as const

export default function ServiceHighlights() {
  return (
    <section className={`axis-section ${styles.section}`} aria-label="Services">
      <div className="axis-shell">
        <header className={styles.header} data-aos="fade-up">
          <span className="axis-eyebrow">Services</span>
          <h2 className="axis-section-title">Everything you need, under one roof.</h2>
          <p className="axis-section-lead">
            We're a one-stop shop for sourcing, financing, part-exchanging and delivering your next used car.
          </p>
        </header>

        <ul className={styles.grid}>
          {SERVICES.map((s, i) => {
            const Icon = s.icon
            return (
              <li key={s.title} data-aos="fade-up" data-aos-delay={String(Math.min(i * 80, 320))}>
                <Link href={s.href} className={styles.item}>
                  <span className={styles.iconBox} aria-hidden="true">
                    <Icon size={22} strokeWidth={1.6} />
                  </span>
                  <h3 className={styles.title}>{s.title}</h3>
                  <p className={styles.body}>{s.body}</p>
                  <span className={styles.cta}>
                    Learn more
                    <ArrowRight size={14} strokeWidth={1.8} />
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
