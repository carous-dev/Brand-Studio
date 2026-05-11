import Link from 'next/link'
import {
  CarFront, ArrowLeftRight, Banknote, ShieldCheck, ScanLine, Truck, ChevronRight,
} from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const SERVICES = [
  {
    Icon: CarFront,
    title: 'Car sales',
    blurb: 'Quality used vehicles sourced through main dealers and prepared to a high retail standard. From compact runarounds to family SUVs and executive saloons.',
    bullets: ['HPI checked', 'Service-history reviewed', 'Cosmetic preparation'],
    href: '/used-cars',
  },
  {
    Icon: ArrowLeftRight,
    title: 'Part exchange',
    blurb: 'Competitive part-exchange values for your current vehicle to keep your upgrade simple and cost-effective. Honest appraisal, fair offer.',
    bullets: ['No appointment needed', 'Same-day offer', 'Outstanding finance settled'],
    href: '/part-exchange',
  },
  {
    Icon: Banknote,
    title: 'Finance options',
    blurb: 'Tailored finance with clear options explained before you commit. Hire Purchase or PCP, fixed payments, no jargon.',
    bullets: ['Soft search available', 'FCA-regulated lenders', 'Settle early if you want to'],
    href: '/finance',
  },
  {
    Icon: ShieldCheck,
    title: 'After-sales support',
    blurb: 'Minimum 3-month comprehensive warranty (unless stated) plus friendly aftercare. We answer the phone and help you sort it.',
    bullets: ['3-month warranty', 'Optional extended cover', 'Direct dealer aftercare'],
    href: '/contact',
  },
  {
    Icon: ScanLine,
    title: 'Vehicle inspection',
    blurb: 'HPI and finance checks with careful preparation so you can buy with confidence. Every car gets a full specialist health check.',
    bullets: ['Theft check', 'Outstanding-finance check', 'Mileage verification'],
    href: '/contact',
  },
  {
    Icon: Truck,
    title: 'Delivery service',
    blurb: 'Collection support and practical handover options for local and distance customers. We can deliver to your door anywhere in mainland UK.',
    bullets: ['Local delivery free', 'UK-wide on request', 'Trackable handover'],
    href: '/contact',
  },
]

export function AutoServicesPage(_props: ThemePageProps) {
  return (
    <>
      <section className="auto-page-hero auto-page-hero--services">
        <div className="auto-page-hero-inner">
          <p className="auto-page-hero-crumb">Our services</p>
          <h1>Complete used-car support, enquiry to handover.</h1>
          <p>
            We don&rsquo;t just sell cars &mdash; we make the entire ownership journey easier.
            Six core services, one consistent dealer voice.
          </p>
        </div>
      </section>

      <section className={`auto-section ${styles.servicesSection}`}>
        <div className="auto-container">
          <ul className={styles.grid}>
            {SERVICES.map((s) => {
              const { Icon } = s
              return (
                <li key={s.title} className={styles.card}>
                  <span className={styles.iconWrap} aria-hidden="true">
                    <Icon size={24} strokeWidth={2.2} />
                  </span>
                  <h2 className={styles.cardTitle}>{s.title}</h2>
                  <p className={styles.cardBlurb}>{s.blurb}</p>
                  <ul className={styles.bullets}>
                    {s.bullets.map((b) => (<li key={b}>{b}</li>))}
                  </ul>
                  <Link href={s.href} className={styles.cardLink}>
                    Learn more
                    <ChevronRight size={14} aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}

export default AutoServicesPage
