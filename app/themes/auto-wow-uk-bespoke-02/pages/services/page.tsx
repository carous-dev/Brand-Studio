import Link from 'next/link'
import { ArrowRight, BadgePoundSterling, RefreshCcw, Truck, ShieldCheck, Wrench, Hammer } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const SERVICES = [
  {
    Icon: BadgePoundSterling,
    title: 'Vehicle finance',
    body: 'PCP, HP, and dealer-arranged finance through the major UK lenders. Soft-search quotes in minutes — no impact on your credit.',
    href: '/finance',
    cta: 'Quote me',
  },
  {
    Icon: RefreshCcw,
    title: 'Part-exchange',
    body: 'Drive your old car in, drive a new one out. Honest valuation on the spot, no callback game.',
    href: '/part-exchange',
    cta: 'Value my car',
  },
  {
    Icon: Truck,
    title: 'Nationwide delivery',
    body: 'Door-to-door delivery anywhere in mainland UK. Free within 30 miles, fixed price beyond.',
    href: '/contact',
    cta: 'Get a delivery quote',
  },
  {
    Icon: ShieldCheck,
    title: 'Warranty',
    body: 'Every car comes with a warranty. Extended cover available — we work with the same provider for everything.',
    href: '/contact',
    cta: 'Warranty options',
  },
  {
    Icon: Wrench,
    title: 'Service & MOT',
    body: 'Customer cars serviced and MOT-ed at our partner workshop. Service plans available with finance packages.',
    href: '/contact',
    cta: 'Book a slot',
  },
  {
    Icon: Hammer,
    title: 'Sell your car',
    body: 'Selling outright? Get a no-obligation guide price in three quick steps. Decision within 24 hours.',
    href: '/sell-my-car',
    cta: 'Get a price',
  },
]

export function AutoServicesPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Autowow'
  return (
    <main>
      <section className="auto-page-hero auto-page-hero--services" aria-label="Services hero">
        <div className="auto-page-hero-inner">
          <span className="auto-page-hero-eyebrow">[ Services ]</span>
          <h1>Everything you need, under one roof</h1>
          <p>
            Finance, part-exchange, delivery, warranty, MOT, service plans, and
            outright sales. {brandName} handles the whole purchase in one go.
          </p>
        </div>
      </section>

      <section className={`auto-section ${styles.section}`}>
        <div className={styles.inner}>
          <div className={styles.grid}>
            {SERVICES.map(({ Icon, title, body, href, cta }, idx) => (
              <article
                key={title}
                className={styles.card}
                data-aos="fade-up"
                data-aos-delay={idx * 60}
              >
                <span className={styles.cardNum} aria-hidden="true">{String(idx + 1).padStart(2, '0')}</span>
                <span className={styles.cardIcon} aria-hidden="true">
                  <Icon size={28} strokeWidth={1.6} />
                </span>
                <h2 className={styles.cardTitle}>{title}</h2>
                <p className={styles.cardBody}>{body}</p>
                <Link href={href} className={styles.cardCta}>
                  {cta}
                  <ArrowRight size={14} strokeWidth={2} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default AutoServicesPage
