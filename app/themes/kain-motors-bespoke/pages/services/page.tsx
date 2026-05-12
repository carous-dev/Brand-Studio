import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CtaBanner from '../../components/CtaBanner'
import styles from './page.module.css'

const SERVICES = [
  {
    title: 'Vehicle Finance',
    href: '/finance',
    points: ['PCP, HP & Lease', 'Soft-search before commit', 'Decisions in 24 hours'],
    lead: 'FCA-regulated finance via a panel of UK lenders. We work with prime and near-prime profiles.',
  },
  {
    title: 'Part Exchange',
    href: '/part-exchange',
    points: ['Live mileage valuation', 'Outstanding finance settled', 'Drive away the same day'],
    lead: 'Fair trade-in offers backed by live market data. No bait-and-switch.',
  },
  {
    title: 'Sell Your Car',
    href: '/sell-my-car',
    points: ['Instant online guide', 'Showroom inspection', 'BACS payment on collection'],
    lead: 'Three steps to a clean sale — no cheques, no auction tricks.',
  },
  {
    title: 'Independent Warranty',
    href: '/services',
    points: ['3 / 6 / 12-month cover', 'Mechanical + electrical', 'Extendable post-sale'],
    lead: 'Cover that follows the car, not the salesman. Claim by phone, not chatbot.',
  },
  {
    title: 'Nationwide Delivery',
    href: '/services',
    points: ['UK-wide doorstep handover', 'Drive driven, not transported', '14-day distance-sale comfort'],
    lead: 'A driver, a clipboard, and a proper walk-around. No "park & post".',
  },
  {
    title: 'Vehicle Sourcing',
    href: '/contact',
    points: ['Brief us your spec', 'We hunt the trade auctions', 'Buy-blind protections included'],
    lead: 'Looking for something specific? We’ll find it before it hits public listings.',
  },
]

export function KainServicesPage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        variant="services"
        eyebrow="Showroom services"
        title="Everything we do, before and after the keys."
        lead="A small, hand-picked range of services we run in-house so buyers aren’t bounced between agencies."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
      />

      <section className={`kain-section ${styles.section}`}>
        <div className={styles.inner}>
          <ol className={styles.grid}>
            {SERVICES.map((s, idx) => (
              <li key={s.title} className={styles.card} data-aos="fade-up" data-aos-delay={String(idx * 60)}>
                <span className={styles.cardNum}>0{idx + 1}</span>
                <h2 className={styles.cardTitle}>{s.title}</h2>
                <p className={styles.cardLead}>{s.lead}</p>
                <ul className={styles.cardPoints}>
                  {s.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
                <Link href={s.href} className="kain-cta-link">Learn more</Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}

export default KainServicesPage
