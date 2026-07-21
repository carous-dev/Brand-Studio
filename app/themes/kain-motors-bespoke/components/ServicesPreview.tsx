import Link from 'next/link'
import styles from './ServicesPreview.module.css'

const SERVICES = [
  {
    title: 'Finance',
    href: '/finance',
    eyebrow: '01',
    lead: 'PCP, HP and Lease options via FCA-regulated lenders. Soft-search before you commit.',
    points: ['No-impact eligibility check', '24-hour decision turnaround', 'Adverse credit considered'],
  },
  {
    title: 'Part Exchange',
    href: '/part-exchange',
    eyebrow: '02',
    lead: 'Fair, transparent trade-in valuations weighted to keep the deal painless.',
    points: ['Live mileage-based valuation', 'Settle outstanding finance', 'Drive away the same day'],
  },
  {
    title: 'Sell Your Car',
    href: '/sell-my-car',
    eyebrow: '03',
    lead: 'Three-step appraisal — paid in cleared funds, never a forecourt cheque.',
    points: ['Reg + mileage instant quote', 'Showroom inspection only', 'BACS payment on collection'],
  },
  {
    title: 'Warranty & Delivery',
    href: '/services',
    eyebrow: '04',
    lead: 'Independent warranty cover and nationwide doorstep delivery on every car.',
    points: ['3 / 6 / 12-month warranty', 'Doorstep handover UK-wide', 'Free service plans available'],
  },
]

export default function ServicesPreview() {
  return (
    <section className={`${styles.section} kain-section--dark`} aria-labelledby="services-preview-heading" data-aos="fade-up">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <header className={styles.head} data-aos="fade-up">
          <span className={styles.eyebrow}>The Services Index</span>
          <h2 id="services-preview-heading" className={styles.title}>
            Everything that<br /><em className={styles.titleItalic}>happens before the keys</em>
          </h2>
          <p className={styles.lead}>
            From valuations to finance to delivery — the bits buyers don’t see, all looked after
            in-house by people who actually pick up the phone.
          </p>
        </header>

        <ol className={styles.grid}>
          {SERVICES.map((s, idx) => (
            <li key={s.title} className={styles.card} data-aos="fade-up" data-aos-delay={String(120 + idx * 80)}>
              <span className={styles.cardNum}>{s.eyebrow}</span>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardLead}>{s.lead}</p>
              <ul className={styles.cardPoints}>
                {s.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
              <Link href={s.href} className={styles.cardLink}>
                Read more <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
