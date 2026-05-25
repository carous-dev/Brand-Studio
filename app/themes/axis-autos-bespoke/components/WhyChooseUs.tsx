'use client'

import { ShieldCheck, BadgePoundSterling, Wrench, Truck } from 'lucide-react'
import styles from './WhyChooseUs.module.css'

const PILLARS = [
  {
    Icon: ShieldCheck,
    code: '01',
    title: 'Prep over polish',
    body: 'Every car inspected, fixed, MOT-d and valeted before keys are handed over. In that order.',
  },
  {
    Icon: BadgePoundSterling,
    code: '02',
    title: 'One honest price',
    body: 'The number on the listing is the number you pay. No admin fees, no manager &ldquo;discounts&rdquo;.',
  },
  {
    Icon: Wrench,
    code: '03',
    title: 'After-sale care',
    body: 'Warranty queries handled by the same team that sold you the car. Same number, same week.',
  },
  {
    Icon: Truck,
    code: '04',
    title: 'Nationwide delivery',
    body: 'Door-to-door delivery anywhere in mainland UK. Free within 30 miles, fixed price beyond.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className={`axis-section ${styles.section}`} aria-label="Why choose us">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <span className={styles.eyebrow}>{'> '}why-choose-us.principles</span>
          <h2 className={styles.title}>How we work</h2>
          <p className={styles.lead}>
            Four rules. Same since day one.
          </p>
        </header>

        <div className={styles.grid}>
          {PILLARS.map(({ Icon, code, title, body }, idx) => (
            <article key={code} className={styles.pillar} data-aos="fade-up" data-aos-delay={idx * 70}>
              <span className={styles.pillarCode}>{code}</span>
              <span className={styles.pillarIcon} aria-hidden="true">
                <Icon size={24} strokeWidth={1.6} />
              </span>
              <h3 className={styles.pillarTitle}>{title}</h3>
              <p className={styles.pillarBody} dangerouslySetInnerHTML={{ __html: body }} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
