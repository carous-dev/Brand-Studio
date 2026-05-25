'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import styles from './ServicesGridTextOnly.module.css'

const SERVICES = [
  { code: '01', title: 'Vehicle finance',     href: '/finance',       body: 'PCP, HP, dealer-arranged. Soft-search quotes, no credit hit.' },
  { code: '02', title: 'Part-exchange',       href: '/part-exchange', body: 'Honest valuation on the spot. Outstanding finance settled.' },
  { code: '03', title: 'Nationwide delivery', href: '/contact',       body: 'Free within 30 miles. Fixed price beyond. Door-to-door.' },
  { code: '04', title: 'Warranty',            href: '/contact',       body: 'Every car covered. Extended cover available on request.' },
  { code: '05', title: 'MOT & Service',       href: '/contact',       body: 'Customer cars serviced and MOT-d at our partner workshop.' },
  { code: '06', title: 'Sell your car',       href: '/sell-my-car',   body: 'Guide price in three steps. Decision within 24 hours.' },
]

export default function ServicesGridTextOnly() {
  return (
    <section className={`axis-section ${styles.section}`} aria-label="Services">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <span className={styles.eyebrow}>{'> '}services.index</span>
          <h2 className={styles.title}>Everything under one roof</h2>
          <p className={styles.lead}>
            Finance, part-exchange, delivery, warranty, MOT, outright sales —
            handled by the same team.
          </p>
        </header>

        <ul className={styles.list}>
          {SERVICES.map(({ code, title, body, href }, idx) => (
            <li key={code} data-aos="fade-up" data-aos-delay={idx * 50}>
              <Link href={href} className={styles.item}>
                <span className={styles.itemCode}>{code}</span>
                <span className={styles.itemBody}>
                  <span className={styles.itemTitle}>{title}</span>
                  <span className={styles.itemDesc}>{body}</span>
                </span>
                <span className={styles.itemArrow} aria-hidden="true">
                  <ArrowRight size={16} strokeWidth={2} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
