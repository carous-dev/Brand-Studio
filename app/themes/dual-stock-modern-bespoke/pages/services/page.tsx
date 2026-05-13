import type { ThemePageProps } from '../../../types'
import Link from 'next/link'
import styles from './page.module.css'

const CAR_SERVICES = [
  { title: 'Car finance', body: 'PCP and HP via a panel of FCA-regulated UK lenders. Soft search first, no impact on your credit score.', href: '/finance' },
  { title: 'Part exchange', body: 'Trade in your old car against any of our stock. Honest valuation both ways — no commission-creep.', href: '/part-exchange' },
  { title: 'Extended test drives', body: 'Book a real test drive — not a five-minute loop. We make sure the car suits you before you commit.', href: '/contact' },
  { title: 'Warranty + 12-month upgrade', body: '3-month inclusive warranty as standard, with a 12-month upgrade option for full peace of mind.', href: '/services' },
  { title: 'Nationwide delivery', body: 'Inspected, prepped and delivered anywhere in the UK. Doorstep handover with full walkaround.', href: '/services' },
  { title: 'Service-history follow-up', body: 'If a service-history packet lands after collection, we post it on — no chasing required.', href: '/contact' },
]

const BIKE_SERVICES = [
  { title: 'Bike finance', body: 'A1/A2/A licence rider? PCP/HP via FCA-regulated UK lenders — soft search, no impact on score.', href: '/finance' },
  { title: 'Bike part-exchange', body: 'Trade in your existing bike against any of our stock. Honest valuation both ways.', href: '/part-exchange' },
  { title: 'Sell your bike', body: 'Outright purchase or commission sale. Free valuation, paid in cleared funds.', href: '/sell-my-car' },
  { title: 'Warranty + 12-month upgrade', body: 'Tailored warranty on used bikes — engine, electrics, ride. 12-month upgrade option available.', href: '/services' },
  { title: 'Collection & delivery', body: 'Specialist enclosed transport for valuable bikes — UK nationwide.', href: '/services' },
  { title: 'Licence & rider advice', body: 'New rider? Book by appointment and we will match the bike to your licence and experience.', href: '/contact' },
]

export function DualServicesPage(_props: ThemePageProps) {
  return (
    <main>
      <section className="dual-page-hero dual-page-hero--services">
        <div className="dual-page-hero__inner">
          <nav className="dual-page-hero__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Services</span>
          </nav>
          <h1 className="dual-page-hero__title">Services for cars and bikes</h1>
          <p className="dual-page-hero__lead">
            Finance, part-exchange, warranty, delivery — same standards whether you buy on four wheels or two.
          </p>
        </div>
      </section>

      <section className="dual-section">
        <div className="dual-container">
          <header className={styles.head} data-aos="fade-up">
            <span className="dual-eyebrow">Car services</span>
            <h2 className={styles.h2}>For four-wheel buyers</h2>
          </header>
          <ul className={styles.grid}>
            {CAR_SERVICES.map((s, idx) => (
              <li key={s.title} data-aos="fade-up" data-aos-delay={idx * 60}>
                <Link href={s.href} className={styles.card}>
                  <span className={`${styles.badge} ${styles.badgeCar}`}>Cars</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <span className={styles.arrow}>Read more →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`dual-section dual-section--alt`}>
        <div className="dual-container">
          <header className={styles.head} data-aos="fade-up">
            <span className="dual-eyebrow">Bike services</span>
            <h2 className={styles.h2}>For two-wheel riders</h2>
          </header>
          <ul className={styles.grid}>
            {BIKE_SERVICES.map((s, idx) => (
              <li key={s.title} data-aos="fade-up" data-aos-delay={idx * 60}>
                <Link href={s.href} className={styles.card}>
                  <span className={`${styles.badge} ${styles.badgeBike}`}>Bikes</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <span className={styles.arrow}>Read more →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}

export default DualServicesPage
