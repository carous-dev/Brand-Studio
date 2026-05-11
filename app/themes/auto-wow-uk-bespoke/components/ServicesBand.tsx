import type { ReactNode } from 'react'
import Link from 'next/link'
import styles from './ServicesBand.module.css'

type Service = {
  title: string
  body: string
  icon: 'shield' | 'car' | 'wallet' | 'wrench' | 'truck' | 'tag'
  href: string
}

const ICONS: Record<Service['icon'], ReactNode> = {
  shield: (
    <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z" />
  ),
  car: (
    <>
      <path d="M3 14l2-6h14l2 6M5 14h14v5H5z" />
      <circle cx="7.5" cy="17" r="1" />
      <circle cx="16.5" cy="17" r="1" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <path d="M3 7l2-3h13" />
      <circle cx="17" cy="13" r="1.2" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a4 4 0 1 1-5 5l-7 7 2 2 7-7a4 4 0 0 0 5-5l-2 2-2-2 2-2z" />
  ),
  truck: (
    <>
      <path d="M2 6h11v10H2zM13 9h5l3 3v4h-8z" />
      <circle cx="6" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  ),
  tag: (
    <>
      <path d="M3 11V3h8l10 10-8 8z" />
      <circle cx="7.5" cy="7.5" r="1.4" />
    </>
  ),
}

const SERVICES: Service[] = [
  { title: 'Quality assurance', body: 'Every vehicle workshop-checked, HPI-clear, and ready to drive.', icon: 'shield', href: '/services' },
  { title: 'Used cars', body: 'Hand-picked stock across hatchbacks, saloons, SUVs and sports.', icon: 'car', href: '/used-cars' },
  { title: 'Finance', body: 'Soft-search applications with rates from 9.9% APR.', icon: 'wallet', href: '/finance' },
  { title: 'Aftercare', body: 'Service-and-MOT plans, extended warranty, breakdown cover.', icon: 'wrench', href: '/services' },
  { title: 'Delivery', body: 'Door-to-door delivery anywhere in mainland UK.', icon: 'truck', href: '/services' },
  { title: 'Part-exchange', body: 'Honest valuation in under 60 seconds — keep your equity.', icon: 'tag', href: '/part-exchange' },
]

export default function ServicesBand() {
  return (
    <section className={styles.section} aria-labelledby="services-heading">
      <span className={[styles.glow, 'mfx-glow-pulse'].join(' ')} aria-hidden="true" />
      <div className={[styles.grid2, 'mfx-grid-drift'].join(' ')} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.head} data-aos="fade-up">
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            What we do
          </p>
          <h2 id="services-heading" className={styles.heading}>
            Built around the <span className={styles.headingAccent}>driver</span>.
          </h2>
          <p className={styles.lead}>
            From the first browse to the last service interval — we keep the
            forecourt sharp so you never leave wondering.
          </p>
        </header>

        <ul className={styles.cards}>
          {SERVICES.map((service, idx) => (
            <li
              key={service.title}
              className={styles.card}
              data-aos="fade-up"
              data-aos-delay={String((idx % 3) * 100 + 80)}
            >
              <Link href={service.href} className={styles.cardLink}>
                <span className={styles.cardCorner} aria-hidden="true">
                  <span />
                  <span />
                </span>
                <span className={styles.cardIcon} aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {ICONS[service.icon]}
                  </svg>
                </span>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardBody}>{service.body}</p>
                <span className={styles.cardArrow}>
                  Read more
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
