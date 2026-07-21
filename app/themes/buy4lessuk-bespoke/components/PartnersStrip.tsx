'use client'

import styles from './PartnersStrip.module.css'

const PARTNERS = [
  'Blue', 'CarFinance 247', 'CarMoney', 'Close Brothers', 'Evolution',
  'First Response', 'MotoNovo', 'Oodle', 'Startline', 'Zuto',
]

export default function PartnersStrip() {
  return (
    <section className={styles.section} aria-label="Finance partners" data-aos="fade-up">
      <div className={styles.inner}>
        <p className={styles.label}>We work with the best companies</p>
        <ul className={styles.row}>
          {PARTNERS.map((p) => (
            <li key={p} className={styles.item}>
              <span className={styles.chip}>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
