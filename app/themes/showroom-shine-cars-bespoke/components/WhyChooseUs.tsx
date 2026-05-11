'use client'

import { ShieldCheck, Wrench, Award, Clock } from 'lucide-react'
import styles from './WhyChooseUs.module.css'

const PILLARS = [
  {
    title: 'Full health check',
    icon: ShieldCheck,
    body: 'Every vehicle undergoes a specialist health check before it lists. HPI, mileage and finance verified.',
  },
  {
    title: 'Test at your convenience',
    icon: Clock,
    body: 'Bookable test drives and appointment-only viewings — no pressure, no rush.',
  },
  {
    title: 'Backed after sale',
    icon: Wrench,
    body: 'Minimum 3-month warranty plus friendly after-sales support whenever you need it.',
  },
  {
    title: 'Built on referrals',
    icon: Award,
    body: 'Over 20 years serving Coventry and the West Midlands with five-star reviews on every channel.',
  },
] as const

const STATS = [
  { value: '500+', label: 'Vehicles available' },
  { value: '300+', label: 'Happy customers' },
  { value: '20+', label: 'Years trading' },
  { value: '125+', label: 'Makes & models' },
] as const

export default function WhyChooseUs() {
  return (
    <section className={`shr-section ${styles.section}`}>
      <div className={`shr-grid-pattern ${styles.gridDecor}`} aria-hidden />
      <div className={`shr-stripe-accent ${styles.stripeTopLeft}`} aria-hidden />
      <div className={`shr-stripe-accent ${styles.stripeBottomRight}`} aria-hidden />

      <div className="shr-container">
        <div className={styles.layout}>
          <div className={styles.copy} data-aos="fade-right">
            <span className="shr-eyebrow">Why Showroom Shine Cars</span>
            <h2 className={styles.title}>
              Quality cars, dependable service.
            </h2>
            <p className={styles.lead}>
              We&apos;ve been helping buyers across Coventry and the West Midlands for
              over 20 years. Every car is sourced through main-dealer channels,
              prepared to a high retail standard, and backed after the sale.
            </p>

            <ul className={styles.pillars}>
              {PILLARS.map((p, i) => {
                const Icon = p.icon
                return (
                  <li key={p.title} className={styles.pillar} data-aos="fade-up" data-aos-delay={`${i * 100}`}>
                    <span className={styles.pillarIcon} aria-hidden>
                      <Icon size={20} strokeWidth={2.2} />
                    </span>
                    <div>
                      <h3 className={styles.pillarTitle}>{p.title}</h3>
                      <p className={styles.pillarBody}>{p.body}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <aside className={styles.stats} data-aos="fade-left">
            <div className={styles.statsHead}>
              <span className={styles.statsEyebrow}>By the numbers</span>
              <h3 className={styles.statsTitle}>20 years on the road.</h3>
            </div>
            <div className={styles.statsGrid}>
              {STATS.map((s, i) => (
                <div key={s.label} className={styles.statCard} data-aos="zoom-in" data-aos-delay={`${i * 80}`}>
                  <span className={styles.statNum}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
            <div className={styles.statsFootnote}>
              <span className={`mfx-pulse-dot ${styles.dot}`} aria-hidden />
              Verified Google &amp; Autotrader reviews
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
