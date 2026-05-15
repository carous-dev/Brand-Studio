import Link from 'next/link'
import { Car, RefreshCw, Coins, ShieldCheck, Search, Truck, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const DEFAULT_SERVICES = [
  {
    icon: Car,
    title: 'Car Sales',
    body: 'Quality used vehicles with clear details, images and enquiry options.',
    bullets: ['Live stock', 'Clear pricing', 'Helpful enquiries'],
    cta: 'Browse stock',
    href: '/used-cars',
  },
  {
    icon: RefreshCw,
    title: 'Part Exchange',
    body: 'Part exchange support for your current vehicle, with clear next steps.',
    bullets: ['Market-led valuations', 'Simple details', 'Upgrade support'],
    cta: 'Start part exchange',
    href: '/part-exchange',
  },
  {
    icon: Coins,
    title: 'Finance Options',
    body: 'Finance guidance with the available options explained before you commit.',
    bullets: ['Budget-led plans', 'Clear checks', 'Simple enquiries'],
    cta: 'Explore finance',
    href: '/finance',
  },
  {
    icon: ShieldCheck,
    title: 'After-Sales Support',
    body: 'Warranty and after-sales information explained clearly where it applies.',
    bullets: ['Support after handover', 'Clear paperwork', 'Friendly contact'],
    cta: 'Contact us',
    href: '/contact',
  },
  {
    icon: Search,
    title: 'Vehicle Inspection',
    body: 'Vehicle checks and preparation information so you can buy with confidence.',
    bullets: ['Vehicle checks', 'Mileage information', 'Service history where available'],
    cta: 'Why us',
    href: '/about',
  },
  {
    icon: Truck,
    title: 'Delivery Service',
    body: 'Collection, handover and delivery options can be discussed with the dealership.',
    bullets: ['Handover options', 'Delivery on request', 'Availability checks'],
    cta: 'Ask about delivery',
    href: '/contact',
  },
]

export function ShowroomServicesPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'the showroom'
  const customServices = Array.isArray((brand as any)?.services?.items) ? (brand as any).services.items : []
  const services = DEFAULT_SERVICES.map((service, index) => ({
    ...service,
    title: customServices[index]?.title || service.title,
    body: customServices[index]?.description || service.body,
  }))

  return (
    <article>
      <section className="shr-page-hero shr-page-hero--services">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Our Services</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            Everything you need, under one roof.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Dealer services that take you from initial enquiry to handover and stay
            useful afterwards.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.services}`}>
        <div className="shr-container">
          <div className={styles.grid}>
            {services.map((service, i) => {
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
            <h2 className={styles.ctaTitle}>Talk to a real person at {brandName}.</h2>
            <p className={styles.ctaLead}>
              Ask about stock, finance, part exchange or viewing arrangements and the team
              will help you find the right next step.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/used-cars" className="shr-btn-primary">Browse stock</Link>
              <Link href="/contact" className="shr-btn-ghost-dark">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}

export default ShowroomServicesPage
