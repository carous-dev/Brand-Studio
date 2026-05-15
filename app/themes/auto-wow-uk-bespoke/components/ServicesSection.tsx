'use client'

import Link from 'next/link'
import {
  CarFront, ArrowLeftRight, Banknote, ShieldCheck,
  ScanLine, Truck, ChevronRight,
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
    <section className={`auto-section auto-section--dark ${styles.section}`} aria-labelledby="services-title">
      <div className={`auto-container ${styles.inner}`}>
        <header className={styles.header}>
          <p className="auto-eyebrow" data-aos="fade-right">Our services</p>
          <h2 id="services-title" className="auto-section-title" data-aos="fade-up">
            Complete support, enquiry to handover.
          </h2>
          <p className="auto-section-lead" data-aos="fade-up" data-aos-delay="120">
            We don&rsquo;t just sell cars &mdash; we make the entire ownership journey easier. From
            sourcing through finance, paperwork, prep, and post-sale, we&rsquo;re the dealer you can
            keep calling.
          </p>
        </header>

        <ul className={styles.grid}>
          {SERVICES.map((service, i) => {
            const { Icon } = service
            return (
              <li
                key={service.title}
                className={styles.card}
                data-aos="zoom-in"
                data-aos-delay={i * 80}
              >
                <span className={styles.iconWrap} aria-hidden="true">
                  <Icon size={24} strokeWidth={2.2} />
                </span>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardBlurb}>{service.blurb}</p>
                <Link href={service.href} className={styles.cardLink}>
                  Learn more <ChevronRight size={14} aria-hidden="true" />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
