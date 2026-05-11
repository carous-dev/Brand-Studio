import type { ReactNode } from 'react'
import styles from './PageHero.module.css'

type PageHeroProps = {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  imageVar?: string
  variant?: 'default' | 'compact'
  children?: ReactNode
}

export default function PageHero({
  eyebrow,
  title,
  lead,
  imageVar = 'var(--brand-image-hero)',
  variant = 'default',
  children,
}: PageHeroProps) {
  return (
    <section
      className={`${styles.hero} ${variant === 'compact' ? styles.heroCompact : ''}`}
      aria-label="Page hero"
    >
      <div className={styles.bg} style={{ backgroundImage: imageVar }} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true">
        <span className="mfx-glow-pulse" />
      </div>
      <div className={styles.bracket} data-pos="tl" aria-hidden="true" />
      <div className={styles.bracket} data-pos="br" aria-hidden="true" />

      <div className={styles.inner}>
        {eyebrow ? (
          <p className={styles.eyebrow} data-aos="fade-up">
            <span className={`${styles.dot} mfx-pulse-dot`} aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className={styles.title} data-aos="fade-up" data-aos-delay="80">
          {title}
        </h1>
        {lead ? (
          <p className={styles.lead} data-aos="fade-up" data-aos-delay="160">
            {lead}
          </p>
        ) : null}
        {children ? (
          <div className={styles.actions} data-aos="fade-up" data-aos-delay="220">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  )
}
