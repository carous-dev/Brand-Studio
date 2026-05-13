'use client'

import Link from 'next/link'
import styles from './ServiceHighlights.module.css'

const SERVICES = [
  {
    icon: 'finance',
    title: 'Tailored finance',
    body: 'PCP, HP and lease options tailored to you. Soft credit search, no impact on your score.',
    href: '/finance',
    eyebrow: 'Finance',
  },
  {
    icon: 'partex',
    title: 'Part exchange',
    body: 'Trade in your existing car OR bike against any of our stock. Free valuation in 60 seconds.',
    href: '/part-exchange',
    eyebrow: 'Part exchange',
  },
  {
    icon: 'sell',
    title: 'Sell yours',
    body: 'Outright purchase or commission sale. Get a guide price online, full offer within 24 hours.',
    href: '/sell-my-car',
    eyebrow: 'Sell',
  },
  {
    icon: 'delivery',
    title: 'Nationwide delivery',
    body: 'Fully inspected, prepped and delivered to your driveway anywhere in the UK.',
    href: '/services',
    eyebrow: 'Delivery',
  },
  {
    icon: 'warranty',
    title: 'Inclusive warranty',
    body: 'Every vehicle ships with our 3-month inclusive warranty. Upgrade up to 24 months.',
    href: '/services',
    eyebrow: 'Warranty',
  },
  {
    icon: 'sourcing',
    title: 'Specialist sourcing',
    body: 'Looking for something specific? Tell us the make, model and budget — we find it for you.',
    href: '/services',
    eyebrow: 'Sourcing',
  },
] as const

export default function ServiceHighlights() {
  return (
    <section className={`dual-section dual-section--alt`} aria-label="Services">
      <div className="dual-container">
        <header className={styles.head}>
          <span className="dual-eyebrow" data-aos="fade-up">Services</span>
          <h2 className={styles.title} data-aos="fade-up" data-aos-delay="80">
            Everything you need <span className={styles.titleAccent}>under one roof.</span>
          </h2>
          <p className={styles.lead} data-aos="fade-up" data-aos-delay="160">
            Finance, part-exchange, warranty, delivery — our process is the same
            whether you're picking up a family hatch or a fresh adventure bike.
          </p>
        </header>

        <div className={styles.grid}>
          {SERVICES.map((service, idx) => (
            <Link
              key={service.title}
              href={service.href}
              className={styles.card}
              data-aos="fade-up"
              data-aos-delay={120 + idx * 80}
            >
              <span className={styles.cardIcon}><ServiceIcon name={service.icon} /></span>
              <span className={styles.cardEyebrow}>{service.eyebrow}</span>
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardBody}>{service.body}</p>
              <span className={styles.cardCta}>Read more →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceIcon({ name }: { name: string }) {
  const c = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, 'aria-hidden': true as const }
  if (name === 'finance') {
    return <svg {...c}><rect x="3" y="6" width="18" height="12" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><circle cx="17" cy="14" r="1.5" fill="currentColor" /></svg>
  }
  if (name === 'partex') {
    return <svg {...c}><path d="M3 12h4l3 9 4-18 3 9h4" /></svg>
  }
  if (name === 'sell') {
    return <svg {...c}><path d="M21 12H3M21 12l-6-6M21 12l-6 6" /></svg>
  }
  if (name === 'delivery') {
    return <svg {...c}><rect x="1" y="6" width="14" height="10" /><path d="M15 9h4l4 4v3h-8" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg>
  }
  if (name === 'warranty') {
    return <svg {...c}><path d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6l9-4z" /><path d="M9 12l2 2 4-4" /></svg>
  }
  if (name === 'sourcing') {
    return <svg {...c}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
  }
  return null
}
