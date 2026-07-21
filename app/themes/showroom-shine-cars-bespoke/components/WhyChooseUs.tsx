'use client'

import { ShieldCheck, Wrench, Award, Clock } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './WhyChooseUs.module.css'

const STATS = [
  { value: 'Live', label: 'Stock updates' },
  { value: 'Checked', label: 'Vehicle details' },
  { value: 'Support', label: 'After-sales help' },
  { value: 'Advice', label: 'Finance guidance' },
] as const

export default function WhyChooseUs() {
  const brand = useBrand()
  const brandName = brand?.name || 'this dealership'
  const city = (brand as any)?.location?.address?.city || (brand as any)?.location?.city || 'your area'
  const features = Array.isArray((brand as any)?.whyChooseUs?.features)
    ? (brand as any).whyChooseUs.features
    : []

  const pillars = [
    {
      title: features[0]?.title || 'Vehicle checks',
      icon: ShieldCheck,
      body: features[0]?.description || 'Vehicle details are checked before listing so buyers can enquire with confidence.',
    },
    {
      title: features[1]?.title || 'Flexible viewings',
      icon: Clock,
      body: features[1]?.description || 'Speak to the team about viewings, test drives, handover and collection options.',
    },
    {
      title: features[2]?.title || 'After-sales help',
      icon: Wrench,
      body: features[2]?.description || 'Get clear support before and after the sale, including warranty and servicing guidance where available.',
    },
    {
      title: features[3]?.title || 'Trusted service',
      icon: Award,
      body: features[3]?.description || `${brandName} helps buyers in ${city} find the right used vehicle without pressure.`,
    },
  ]

  return (
    <section className={`shr-section ${styles.section}`} data-aos="fade-up">
      <div className={`shr-grid-pattern ${styles.gridDecor}`} aria-hidden />
      <div className={`shr-stripe-accent ${styles.stripeTopLeft}`} aria-hidden />
      <div className={`shr-stripe-accent ${styles.stripeBottomRight}`} aria-hidden />

      <div className="shr-container">
        <div className={styles.layout}>
          <div className={styles.copy} data-aos="fade-right">
            <span className="shr-eyebrow">Why {brandName}</span>
            <h2 className={styles.title}>
              Quality cars, dependable service.
            </h2>
            <p className={styles.lead}>
              {brandName} brings stock, finance guidance, part exchange support and helpful
              vehicle advice together for buyers{city ? ` in ${city}` : ''}.
            </p>

            <ul className={styles.pillars}>
              {pillars.map((p, i) => {
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
              <h3 className={styles.statsTitle}>Useful signals before you enquire.</h3>
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
              Customer feedback shown when linked to the dealer profile
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
