import Link from 'next/link'
import { Wrench, FileCheck, KeyRound, Truck, Wallet, Repeat } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

const SERVICES = [
  {
    Icon: Wrench,
    title: 'Pre-sale preparation',
    body: 'Every car gets a full mechanical inspection, fresh service, and any wear-and-tear items replaced before it hits the showroom.',
  },
  {
    Icon: FileCheck,
    title: 'HPI provenance check',
    body: 'Independent HPI checks on every vehicle — no outstanding finance, no insurance write-offs, no surprises.',
  },
  {
    Icon: KeyRound,
    title: '12-month MOT',
    body: 'New MOT certificate fitted to every car at point of sale so you drive away with a full year of legal cover.',
  },
  {
    Icon: Wallet,
    title: 'Finance arrangement',
    body: 'We work with a panel of FCA-approved lenders to find competitive HP and PCP rates for your budget.',
  },
  {
    Icon: Repeat,
    title: 'Part-exchange valuation',
    body: 'Honest, market-based offers on your current car — no obligation, and we take the hassle of disposal off your hands.',
  },
  {
    Icon: Truck,
    title: 'Nationwide delivery',
    body: 'Door-to-door delivery anywhere in mainland UK on most vehicles. We can quote on collection of your part-ex too.',
  },
]

export function EleServicesPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'ELE Car Sales'
  return (
    <main>
      <PageHero
        eyebrow="Services"
        title="Everything we offer beyond the showroom floor."
        lead={`${brandName} bundles the bits most dealers leave to chance — finance, part-exchange, MOT, HPI, delivery — into one transparent process.`}
        imageSlot="services"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <ul className={styles.grid} role="list">
            {SERVICES.map((s, i) => {
              const Icon = s.Icon
              return (
                <li key={s.title} className={styles.card} data-aos="fade-up" data-aos-delay={String(60 * (i % 3))}>
                  <span className={styles.iconWrap} aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <h3 className={styles.cardTitle}>{s.title}</h3>
                  <p className={styles.cardBody}>{s.body}</p>
                </li>
              )
            })}
          </ul>

          <div className={styles.foot}>
            <Link href="/contact" className={styles.cta}>
              Got a specific question? Get in touch.
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default EleServicesPage
