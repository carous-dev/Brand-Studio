import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

type ServiceCard = {
  id: string
  title: string
  body: string
  href: string
  cta: string
}

const SERVICES: ServiceCard[] = [
  {
    id: 'sales',
    title: 'Car sales',
    body: "Hand-picked, inspected, finance-ready stock — refreshed every few days. The car you see online is the car you collect, with no salesfloor games.",
    href: '/used-cars',
    cta: 'Browse stock',
  },
  {
    id: 'finance',
    title: 'Finance options',
    body: "Soft-search eligibility, panel of UK lenders, transparent monthly figures. PCP, HP, or balloon — we explain the trade-offs in plain English.",
    href: '/finance',
    cta: 'Apply for finance',
  },
  {
    id: 'part-exchange',
    title: 'Part exchange',
    body: "Plug in your reg and mileage, get a guide trade-in figure in under 60 seconds. Bring it in on collection day — no quote-chasing.",
    href: '/part-exchange',
    cta: 'Get a guide price',
  },
  {
    id: 'aftersales',
    title: 'After-sales support',
    body: "A real person on the phone when you need us. Warranty back-up, MOT reminders, service due-dates kept on file — long after the keys change hands.",
    href: '/contact',
    cta: 'Talk to aftersales',
  },
  {
    id: 'inspection',
    title: 'Vehicle inspection',
    body: "Every car gets a 40-point check by our buyers before it hits the floor. Drive history, mechanical health, MOT advisories — disclosed up front.",
    href: '/contact',
    cta: 'See what we check',
  },
  {
    id: 'delivery',
    title: 'Delivery service',
    body: "Trade-plated drivers, fully insured transit, doorstep handover with paperwork sorted up front. UK-wide — Inverness to Land's End.",
    href: '/contact',
    cta: 'Request delivery',
  },
]

export function QueensburyServicesPage(_props: ThemePageProps) {
  return (
    <>
      <section className="qb-page-hero qb-page-hero--services" data-aos="fade-up">
        <div className="qb-page-hero__inner">
          <span className="qb-page-hero__eyebrow">Services</span>
          <h1 className="qb-page-hero__title">More than a stock list — every step covered.</h1>
          <p className="qb-page-hero__lead">
            Sales, finance, part-exchange, delivery, aftersales — under one roof, run by people who answer the
            phone.
          </p>
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-container">
          <ul className={styles.grid}>
            {SERVICES.map((s, i) => (
              <li key={s.id} className={styles.card} data-aos="fade-up" data-aos-delay={i * 60}>
                <h2 className={styles.title}>{s.title}</h2>
                <p className={styles.body}>{s.body}</p>
                <Link href={s.href} className={styles.link}>
                  {s.cta} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="qb-section qb-section--tint">
        <div className="qb-container">
          <div className={styles.callBack}>
            <div>
              <span className="qb-eyebrow">Not sure where to start?</span>
              <h2 className="qb-section-title">We'll talk it through — no commitment.</h2>
              <p className={styles.callBackLead}>
                Tell us roughly what you're after and we'll line up the right service mix. A 5-minute call usually
                saves an hour of admin.
              </p>
            </div>
            <div className={styles.callBackCtas}>
              <Link href="/contact" className="qb-btn qb-btn--gradient">
                Book a call
              </Link>
              <Link href="/used-cars" className="qb-btn qb-btn--ghost">
                Just show me stock
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default QueensburyServicesPage
