import Link from 'next/link'
import { Banknote, RefreshCcw, Truck, ShieldCheck, ClipboardCheck, Wrench, ArrowRight } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const SERVICES = [
  { icon: Banknote, title: 'Car finance', body: 'Independent broker access. Hire purchase or PCP, multiple lenders, fair rates.', href: '/finance' },
  { icon: RefreshCcw, title: 'Part-exchange', body: 'Fair valuations against your next car. Send a few details, hear back same-day.', href: '/part-exchange' },
  { icon: Truck, title: 'Nationwide delivery', body: 'Door-to-door delivery across the UK mainland. Optional PDI report.', href: '/contact' },
  { icon: ShieldCheck, title: 'Warranty', body: '3-month included as standard. 12 / 24 / 36-month extensions at handover.', href: '/contact' },
  { icon: ClipboardCheck, title: '100-point inspection', body: 'Mechanical + cosmetic check on every car. HPI clear. Service history verified.', href: '/about' },
  { icon: Wrench, title: 'Aftercare & MOT', body: 'Local trusted partner garage for servicing, MOT and routine maintenance.', href: '/contact' },
]

export function AxisServicesPage(_: ThemePageProps) {
  return (
    <>
      <section className="axis-page-hero axis-page-hero--services">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">Services</span>
          <h1 className="axis-page-hero-title">Everything you need to buy with confidence.</h1>
          <p className="axis-page-hero-lead">
            Finance, part-exchange, delivery, warranty, inspection, aftercare — all arranged in one place by one team.
          </p>
        </div>
      </section>

      <section className="axis-section">
        <div className="axis-shell">
          <ul className={styles.grid}>
            {SERVICES.map((s, i) => {
              const Icon = s.icon
              return (
                <li key={s.title} data-aos="fade-up" data-aos-delay={(i % 3) * 60}>
                  <Link href={s.href} className={styles.item}>
                    <span className={styles.iconBox} aria-hidden="true"><Icon size={22} strokeWidth={1.6} /></span>
                    <h2 className={styles.title}>{s.title}</h2>
                    <p className={styles.body}>{s.body}</p>
                    <span className={styles.cta}>Learn more <ArrowRight size={14} strokeWidth={1.8} /></span>
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

export default AxisServicesPage
