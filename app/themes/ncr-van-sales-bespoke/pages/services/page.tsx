import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

const SERVICES = [
  {
    n: '01',
    title: 'Used Vans',
    body: 'Panel vans, Lutons, tippers, dropsides, crew cabs. Every vehicle workshop-checked, MOT-ready, and listed with full spec including service history where available.',
    bullets: ['Inspected pre-listing', 'Service history checked', 'No hidden fees'],
    href: '/used-cars',
  },
  {
    n: '02',
    title: 'Finance',
    body: 'Hire purchase and finance lease packages for sole traders, limited companies and fleet operators. Soft search options to protect your credit score.',
    bullets: ['Soft search available', 'Trade-friendly lenders', 'Decision in 24 hours'],
    href: '/finance',
  },
  {
    n: '03',
    title: 'Part Exchange',
    body: 'Free valuation on your existing van against any vehicle in our stock list. Trade your van in person at the forecourt or submit details online.',
    bullets: ['No-obligation quote', 'Settle outstanding finance', 'Drive-in valuations'],
    href: '/part-exchange',
  },
  {
    n: '04',
    title: 'Nationwide Delivery',
    body: 'Direct from forecourt to your yard. Fully insured transport across UK mainland. Most deliveries within 5 working days of purchase.',
    bullets: ['UK-wide coverage', 'Insured transport', 'Tracked delivery'],
    href: '/contact',
  },
  {
    n: '05',
    title: '7-Day Exchange',
    body: 'Buy with confidence. Not happy with your van in the first week? Bring it back and swap for another vehicle of equal value — no quibble.',
    bullets: ['7 days from collection', 'Equal value swap', 'No fees'],
    href: '/contact',
  },
  {
    n: '06',
    title: 'Sell Your Van',
    body: "Same-day valuation against current trade prices. Free collection from anywhere in mainland UK. Same-day payment on accepted offers.",
    bullets: ['Free valuation', 'Free collection', 'Same-day payment'],
    href: '/sell-my-car',
  },
]

export function NcrServicesPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'NCR Van Sales Ltd'

  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Services built for the trade."
        lead={`${brandName} packages six no-nonsense services for working drivers and fleet operators. Pick the one you need.`}
        imageSlot="services"
        pills={['Finance', 'Part exchange', 'Delivery', '7-day exchange']}
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <ul className={styles.grid}>
            {SERVICES.map((s, i) => (
              <li key={s.title} className={styles.card} data-aos="fade-up" data-aos-delay={(i % 3) * 80}>
                <span className={styles.numberBadge} aria-hidden="true">{s.n}</span>
                <h2 className={styles.cardTitle}>{s.title}</h2>
                <p className={styles.body}>{s.body}</p>
                <ul className={styles.bullets}>
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <Link href={s.href} className={styles.cardCta}>
                  Learn more →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

export default NcrServicesPage
