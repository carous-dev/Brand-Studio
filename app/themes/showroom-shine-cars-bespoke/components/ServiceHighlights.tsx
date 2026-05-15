'use client'

import Link from 'next/link'
import { Car, RefreshCw, Coins, ShieldCheck, Search, Truck, ArrowUpRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './ServiceHighlights.module.css'

const SERVICES = [
  {
    title: 'Car Sales',
    icon: Car,
    body: 'Quality used vehicles presented clearly, with the key details available before you enquire.',
    href: '/services',
  },
  {
    title: 'Part Exchange',
    icon: RefreshCw,
    body: 'Part exchange support for your current vehicle to keep your upgrade simple and cost-effective.',
    href: '/part-exchange',
  },
  {
    title: 'Finance Options',
    icon: Coins,
    body: 'Finance guidance tailored to your budget, with clear options explained before you commit.',
    href: '/finance',
  },
  {
    title: 'After-Sales Support',
    icon: ShieldCheck,
    body: 'Warranty and after-sales information explained clearly on the vehicles where it applies.',
    href: '/services',
  },
  {
    title: 'Vehicle Inspection',
    icon: Search,
    body: 'Vehicle checks and preparation details surfaced so you can buy with confidence.',
    href: '/services',
  },
  {
    title: 'Delivery Service',
    icon: Truck,
    body: 'Collection, handover and delivery options can be discussed with the dealership team.',
    href: '/services',
  },
] as const

export default function ServiceHighlights() {
  const brand = useBrand()
  const city = (brand as any)?.location?.address?.city || (brand as any)?.location?.city || ''

  return (
    <section className={`shr-section ${styles.section}`} id="services">
      <div className="shr-container">
        <div className={`shr-section-head ${styles.head}`} data-aos="fade-up">
          <span className="shr-eyebrow">Our Services</span>
          <h2 className="shr-section-head__title">Complete used-car support, from enquiry to handover.</h2>
          <p className="shr-section-head__lead">
            Everything a used-car buyer{city ? ` in ${city}` : ''} needs in one place:
            finance, part exchange, vehicle checks and after-sales support.
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
