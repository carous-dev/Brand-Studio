'use client'

import styles from './WhyChooseUs.module.css'

type Pillar = {
  id: string
  title: string
  desc: string
  stat?: string
  icon: React.ReactNode
}

const PILLARS: Pillar[] = [
  {
    id: 'inspected',
    title: 'Inspected by our buyers',
    desc: 'Every vehicle is mechanically checked, history-verified, and presented honestly.',
    stat: '40-point',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'price',
    title: 'No hidden price games',
    desc: 'The number you see is the number you pay. Finance quotes are transparent, no admin fees.',
    stat: 'AA-priced',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="2" x2="12" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'people',
    title: 'Real people, real follow-up',
    desc: "You'll deal with the same buyer from enquiry through aftercare — no call-centre runaround.",
    stat: '1-to-1',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'aftercare',
    title: 'Aftercare that actually shows up',
    desc: 'Warranty options, complimentary 12-month MOT support, and we keep your service due-dates on file.',
    stat: '12 mo',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
]

export default function WhyChooseUs() {
  return (
    <section className="qb-section qb-section--dark">
      <div className="qb-container">
        <header className="qb-section-head" data-aos="fade-up">
          <span className="qb-eyebrow qb-eyebrow--on-dark">Why Queensbury</span>
          <h2 className="qb-section-title">Four reasons our customers come back.</h2>
        </header>

        <ul className={styles.pillars}>
          {PILLARS.map((p, i) => (
            <li key={p.id} className={styles.pillar} data-aos="fade-up" data-aos-delay={i * 80}>
              <span className={styles.statBadge}>{p.stat}</span>
              <span className={styles.iconWrap} aria-hidden="true">
                {p.icon}
              </span>
              <h3 className={styles.title}>{p.title}</h3>
              <p className={styles.desc}>{p.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
