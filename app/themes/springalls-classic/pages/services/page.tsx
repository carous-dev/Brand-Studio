import { ArrowUpRight, BadgeCheck, Car, ShieldCheck, Wrench } from 'lucide-react'
import Link from 'next/link'
import styles from './page.module.css'
import { HeroBackdrop } from '../../components/HeroBackdrop'
import type { ThemePageProps } from '../../../types'

const SERVICES = [
  {
    title: 'Quality Used Cars',
    description: 'Hand-picked stock with full inspections, clear history, and transparent pricing.',
    icon: Car
  },
  {
    title: 'Finance & Warranty',
    description: 'Flexible finance options and comprehensive warranties for extra peace of mind.',
    icon: ShieldCheck
  },
  {
    title: 'Servicing & MOT',
    description: 'Trusted partners for servicing, MOT, and aftercare to keep you on the road.',
    icon: Wrench
  },
  {
    title: 'Part Exchange',
    description: 'Fair valuations and a simple trade-in process handled by our friendly team.',
    icon: BadgeCheck
  }
]

const SERVICE_DETAILS = [
  {
    title: 'Vehicle Sourcing',
    items: ['Private purchase only', 'Full vehicle appraisal', 'Road test validation']
  },
  {
    title: 'Preparation',
    items: ['Mechanical inspection', 'Professional detailing', 'HPI checks completed']
  },
  {
    title: 'Ownership Support',
    items: ['Warranty upgrades', 'After-sales support', 'Flexible delivery options']
  }
]

export function SpringallsServicesPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Springalls Car Sales'
  const shortName = brandName.replace(/\s*(Ltd|Limited|Car Sales)\.?$/i, '').trim() || brandName
  const eyebrow = `${shortName} Services`

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <HeroBackdrop />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.heroTitle}>Services built around trust and transparency</h1>
          <p className={styles.heroLead}>
            From sourcing to aftercare, we make the buying journey simple, clear, and professional.
          </p>
          <div className={styles.heroActions}>
            <Link href="/used-cars" className={styles.primaryButton}>Browse stock</Link>
            <Link href="/finance" className={styles.secondaryButton}>Get finance options</Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How we help you buy confidently</h2>
            <p className={styles.sectionText}>
              Every service is designed to remove uncertainty and give you full confidence in your next car.
            </p>
          </div>
          <div className={styles.cardGrid}>
            {SERVICES.map((service) => {
              const Icon = service.icon
              return (
                <article key={service.title} className={styles.card}>
                  <div className={styles.cardIcon} aria-hidden="true">
                    <Icon size={26} strokeWidth={1.8} />
                  </div>
                  <h3 className={styles.cardTitle}>{service.title}</h3>
                  <p className={styles.cardText}>{service.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>A streamlined experience, end to end</h2>
            <p className={styles.sectionText}>
              Our process is structured so you always know what is happening and what comes next.
            </p>
          </div>
          <div className={styles.detailGrid}>
            {SERVICE_DETAILS.map((detail) => (
              <div key={detail.title} className={styles.detailCard}>
                <h3 className={styles.detailTitle}>{detail.title}</h3>
                <ul className={styles.detailList}>
                  {detail.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div>
            <h2 className={styles.ctaTitle}>Ready to get started?</h2>
            <p className={styles.ctaText}>
              Explore our latest stock or speak with a specialist about finance, part exchange, or delivery.
            </p>
          </div>
          <Link href="/contact" className={styles.ctaButton}>
            Speak to the team
            <ArrowUpRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </section>
    </main>
  )
}

export default SpringallsServicesPage
