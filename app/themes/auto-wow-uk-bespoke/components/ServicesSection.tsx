'use client'

import Link from 'next/link'
import {
  CarFront, ArrowLeftRight, Banknote, ShieldCheck,
  ScanLine, Truck, ArrowUpRight,
} from 'lucide-react'
import styles from './ServicesSection.module.css'

const SERVICES = [
  {
    Icon: CarFront,
    title: 'Car sales',
    blurb: 'Quality used vehicles presented with clear details and careful preparation.',
    href: '/used-cars',
  },
  {
    Icon: ArrowLeftRight,
    title: 'Part exchange',
    blurb: 'Competitive part-exchange values so your upgrade stays simple and cost-effective.',
    href: '/part-exchange',
  },
  {
    Icon: Banknote,
    title: 'Finance options',
    blurb: 'Tailored finance with clear options explained before you commit. No pressure, no jargon.',
    href: '/finance',
  },
  {
    Icon: ShieldCheck,
    title: 'After-sales support',
    blurb: 'Warranty options and friendly aftercare explained clearly before you buy.',
    href: '/services',
  },
  {
    Icon: ScanLine,
    title: 'Vehicle inspection',
    blurb: 'HPI and finance checks with careful preparation so you buy with confidence.',
    href: '/services',
  },
  {
    Icon: Truck,
    title: 'Delivery service',
    blurb: 'Collection support and practical handover options for local and distance customers.',
    href: '/services',
  },
]

export default function ServicesSection() {
  return (
    <section className={`auto-section auto-section--dark ${styles.section}`} aria-labelledby="services-title" data-aos="fade-up">
      <div className={`auto-container ${styles.inner}`}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowMark} aria-hidden="true" />
            Our services
          </span>
          <h2 id="services-title" className={styles.title}>
            Complete support, enquiry to handover.
          </h2>
          <p className={styles.lead}>
            We don&rsquo;t just sell cars &mdash; we make the entire ownership journey easier. From
            sourcing through finance, paperwork, prep, and post-sale, we&rsquo;re the dealer you can
            keep calling.
          </p>
        </header>

        <ul className={styles.grid}>
          {SERVICES.map((service, i) => {
            const { Icon } = service
            const num = String(i + 1).padStart(2, '0')
            return (
              <li key={service.title} className={styles.card}>
                <Link href={service.href} className={styles.cardLink}>
                  <span className={styles.cardNum} aria-hidden="true">{num}</span>
                  <span className={styles.iconWrap} aria-hidden="true">
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <h3 className={styles.cardTitle}>{service.title}</h3>
                  <p className={styles.cardBlurb}>{service.blurb}</p>
                  <span className={styles.cardCta}>
                    Learn more
                    <ArrowUpRight size={14} aria-hidden="true" />
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
