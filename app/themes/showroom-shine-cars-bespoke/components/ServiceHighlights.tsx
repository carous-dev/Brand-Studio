'use client'

import Link from 'next/link'
import { Car, RefreshCw, Coins, ShieldCheck, Search, Truck, ArrowUpRight } from 'lucide-react'
import styles from './ServiceHighlights.module.css'

const SERVICES = [
  {
    title: 'Car Sales',
    icon: Car,
    body: 'Quality used vehicles sourced predominantly through main dealers and prepared to a high retail standard.',
    href: '/services',
  },
  {
    title: 'Part Exchange',
    icon: RefreshCw,
    body: 'Competitive part exchange values for your current vehicle to keep your upgrade simple and cost-effective.',
    href: '/part-exchange',
  },
  {
    title: 'Finance Options',
    icon: Coins,
    body: 'Finance support tailored to your budget with clear options explained before you commit.',
    href: '/finance',
  },
  {
    title: 'After-Sales Support',
    icon: ShieldCheck,
    body: 'Minimum 3-month comprehensive warranty (unless stated) plus friendly after-sales support.',
    href: '/services',
  },
  {
    title: 'Vehicle Inspection',
    icon: Search,
    body: 'HPI and finance checks with careful preparation so you can buy with confidence.',
    href: '/services',
  },
  {
    title: 'Delivery Service',
    icon: Truck,
    body: 'Collection support and practical handover options for local and distance customers.',
    href: '/services',
  },
] as const

export default function ServiceHighlights() {
  return (
    <section className={`shr-section ${styles.section}`} id="services">
      <div className="shr-container">
        <div className={`shr-section-head ${styles.head}`} data-aos="fade-up">
          <span className="shr-eyebrow">Our Services</span>
          <h2 className="shr-section-head__title">Complete used-car support, from enquiry to handover.</h2>
          <p className="shr-section-head__lead">
            Everything a Coventry buyer needs in one place — finance, part exchange,
            full inspections and after-sales backing under one roof.
          </p>
        </div>

        <div className={styles.grid}>
          {SERVICES.map((service, index) => {
            const Icon = service.icon
            return (
              <Link
                key={service.title}
                href={service.href}
                className={styles.card}
                data-aos="fade-up"
                data-aos-delay={`${80 * index}`}
              >
                <span className={styles.iconWrap} aria-hidden>
                  <Icon size={22} strokeWidth={2.2} />
                </span>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardBody}>{service.body}</p>
                <span className={styles.learnMore}>
                  Learn more
                  <ArrowUpRight size={14} strokeWidth={2.4} />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
