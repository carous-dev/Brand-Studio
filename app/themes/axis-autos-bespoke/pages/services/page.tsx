import Link from 'next/link'
import { ArrowRight, BadgePoundSterling, RefreshCcw, Truck, ShieldCheck, Wrench, Hammer } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const SERVICES = [
  { Icon: BadgePoundSterling, code: '01', title: 'Vehicle finance',     body: 'PCP, HP, dealer-arranged. Soft-search quotes via FCA-authorised lenders only.',          href: '/finance' },
  { Icon: RefreshCcw,         code: '02', title: 'Part-exchange',       body: 'Honest valuation on the spot. Outstanding finance settled, V5C swap handled.',          href: '/part-exchange' },
  { Icon: Truck,              code: '03', title: 'Nationwide delivery', body: 'Door-to-door delivery anywhere in mainland UK. Free within 30 miles, fixed beyond.',     href: '/contact' },
  { Icon: ShieldCheck,        code: '04', title: 'Warranty',            body: 'Every car comes covered. Extended cover available — same provider, no fine print.',     href: '/contact' },
  { Icon: Wrench,             code: '05', title: 'Service & MOT',       body: 'Customer cars serviced and MOT-d at our partner workshop. Service plans available.',     href: '/contact' },
  { Icon: Hammer,             code: '06', title: 'Sell your car',       body: 'No-obligation guide price in three quick steps. Decision within 24 hours.',              href: '/sell-my-car' },
]

export function AxisServicesPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Axis Autos'
  return (
    <main>
      <section className="axis-page-hero axis-page-hero--services" aria-label="Services hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">services.index</span>
          <h1>Everything under one roof</h1>
          <p>
            Finance, part-exchange, delivery, warranty, MOT, service plans, and
            outright sales. {brandName} handles the whole purchase in one go.
          </p>
        </div>
      </section>

      <section className={`axis-section ${styles.section}`}>
        <div className={styles.inner}>
          <div className={styles.grid}>
            {SERVICES.map(({ Icon, code, title, body, href }, idx) => (
              <article key={title} className={styles.card} data-aos="fade-up" data-aos-delay={idx * 50}>
                <span className={styles.cardCode}>{code}</span>
                <span className={styles.cardIcon} aria-hidden="true">
                  <Icon size={24} strokeWidth={1.6} />
                </span>
                <h2 className={styles.cardTitle}>{title}</h2>
                <p className={styles.cardBody}>{body}</p>
                <Link href={href} className={styles.cardCta}>
                  Learn more
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

export default AxisServicesPage
