'use client'

import styles from './PageHero.module.css'

type Slot = 'hero' | 'about' | 'services' | 'finance' | 'part-exchange' | 'sell-your-car' | 'recently-sold'

export default function PageHero({
  title,
  eyebrow,
  slot = 'hero',
}: {
  title: string
  eyebrow?: string
  slot?: Slot
}) {
  return (
    <section className={styles.hero} aria-label={title}>
      <div className={styles.bg} aria-hidden data-slot={slot} />
      <div className={styles.scrim} aria-hidden />
      <div className={styles.inner}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h1 className={styles.title}>{title}</h1>
      </div>
    </section>
  )
}
