import Link from 'next/link'
import { Car, RefreshCw, Coins, ShieldCheck, Search, Truck, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const SERVICES = [
  {
    icon: Car,
    title: 'Car Sales',
    body: 'Quality used vehicles sourced predominantly through main dealers and prepared to a high retail standard before they reach the forecourt.',
    bullets: ['Main-dealer sourcing', 'Full preparation', 'Honest pricing'],
    cta: 'Browse stock',
    href: '/used-cars',
  },
  {
    icon: RefreshCw,
    title: 'Part Exchange',
    body: 'Competitive part exchange values for your current vehicle, with the goal of keeping your upgrade simple and cost-effective.',
    bullets: ['Fair market valuations', 'Same-day quotes', 'Settle outstanding finance'],
    cta: 'Start part exchange',
    href: '/part-exchange',
  },
  {
    icon: Coins,
    title: 'Finance Options',
    body: 'Tailored finance support with clear options explained before you commit. PCP, HP and tailored plans through trusted UK lenders.',
    bullets: ['PCP, HP & tailored plans', 'FCA-regulated lenders', 'Quick decisions'],
    cta: 'Explore finance',
    href: '/finance',
  },
  {
    icon: ShieldCheck,
    title: 'After-Sales Support',
    body: 'Minimum 3-month comprehensive warranty (unless stated) plus friendly after-sales support whenever you need it.',
    bullets: ['3-month warranty minimum', 'Extended cover available', 'Phone & email support'],
    cta: 'Contact us',
    href: '/contact',
  },
  {
    icon: Search,
    title: 'Vehicle Inspection',
    body: 'HPI and finance checks on every vehicle plus careful preparation, so you can buy with complete confidence.',
    bullets: ['HPI clear guarantee', 'Mileage verified', 'Service history checked'],
    cta: 'Why us',
    href: '/about',
  },
  {
    icon: Truck,
    title: 'Delivery Service',
    body: 'Collection support and practical handover options for local and distance customers — including doorstep delivery on request.',
    bullets: ['Local handover', 'Nationwide delivery (POA)', 'Pre-handover photo report'],
    cta: 'Ask about delivery',
    href: '/contact',
  },
]

export function ShowroomServicesPage(_: ThemePageProps) {
  return (
    <article>
      <section className="shr-page-hero shr-page-hero--services">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Our Services</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            Everything you need, under one roof.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Six dealer-grade services that take you from initial enquiry to handover —
            and stay with you afterwards.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.services}`}>
        <div className="shr-container">
          <div className={styles.grid}>
            {SERVICES.map((service, i) => {
              const Icon = service.icon
              return (
                <article key={service.title} className={styles.card} data-aos="fade-up" data-aos-delay={`${i * 80}`}>
                  <div className={styles.cardHead}>
                    <span className={styles.cardIcon} aria-hidden>
                      <Icon size={24} strokeWidth={2.2} />
                    </span>
                    <h2 className={styles.cardTitle}>{service.title}</h2>
                  </div>
                  <p className={styles.cardBody}>{service.body}</p>
                  <ul className={styles.bullets}>
                    {service.bullets.map((b) => (
                      <li key={b}>
                        <CheckCircle2 size={16} strokeWidth={2.2} aria-hidden />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link href={service.href} className={styles.cardCta}>
                    {service.cta}
                    <ArrowUpRight size={16} strokeWidth={2.4} />
                  </Link>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className={`shr-section shr-section--dark ${styles.cta}`}>
        <div className="shr-container">
          <div className={styles.ctaInner} data-aos="fade-up">
            <span className="shr-eyebrow">Ready to get started?</span>
            <h2 className={styles.ctaTitle}>Talk to a real person at the showroom.</h2>
            <p className={styles.ctaLead}>
              Pop in for an appointment-only viewing or pick up the phone — we&apos;ll match you
              to the right car and the right plan.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/used-cars" className="shr-btn-primary">Browse stock</Link>
              <Link href="/contact" className="shr-btn-ghost-dark">Visit showroom</Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}

export default ShowroomServicesPage
