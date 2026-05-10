import Link from 'next/link'
import { ArrowRight, Banknote, Repeat, ShieldCheck, Truck, Wrench } from 'lucide-react'
import styles from './ServicesSection.module.css'

/**
 * Columbus Vehicles — Services (rugged archetype)
 * Dark band breaking the page rhythm — fits the rugged aesthetic of full-strength
 * sections punctuated by lighter content. Service icons in amber accent over
 * the charcoal background.
 *
 * Server component (renders the same for every visitor — no client state).
 */
const SERVICES = [
  {
    icon: Truck,
    title: 'Nationwide delivery',
    body: 'Door-to-door delivery anywhere in the UK on every 4×4 we sell.',
  },
  {
    icon: Banknote,
    title: 'Flexible finance',
    body: 'Tailored finance plans across 15+ lenders — even with mixed credit.',
  },
  {
    icon: Repeat,
    title: 'Part exchange',
    body: 'Honest valuations on your current vehicle, processed the same day.',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty & inspection',
    body: 'Every 4×4 multi-point inspected; warranty options from 3 to 24 months.',
  },
  {
    icon: Wrench,
    title: 'Aftersales support',
    body: 'Specialist 4×4 servicing and parts sourcing through trusted partners.',
  },
] as const

export default function ServicesSection() {
  return (
    <section className={styles.section} aria-labelledby="services-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>What we do</p>
          <h2 id="services-heading" className={styles.heading}>Services built for 4×4 buyers</h2>
          <p className={styles.subheading}>
            Decades of combined experience means we handle the moving parts so you don&apos;t have to.
          </p>
        </header>

        <ul className={styles.grid} role="list">
          {SERVICES.map((s) => {
            const Icon = s.icon
            return (
              <li key={s.title} className={styles.card}>
                <span className={styles.iconWrap} aria-hidden="true">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <p className={styles.cardBody}>{s.body}</p>
              </li>
            )
          })}
        </ul>

        <div className={styles.footer}>
          <Link href="/services" className={styles.cta}>
            See all services
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
