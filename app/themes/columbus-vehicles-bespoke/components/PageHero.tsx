import type { ReactNode } from 'react'
import styles from './PageHero.module.css'

/**
 * Columbus Vehicles — reusable inner-page hero (rugged archetype)
 * Compact dark hero used at the top of every non-homepage route. Optional
 * imageSlot picks one of the brand-image-* CSS vars for the photo background;
 * defaults to --brand-image-hero.
 */
type Props = {
  eyebrow?: string
  title: string
  lead?: string
  imageSlot?: 'hero' | 'about' | 'services' | 'finance' | 'part-exchange' | 'sell-your-car' | 'recently-sold'
  children?: ReactNode
}

const SLOT_VAR: Record<NonNullable<Props['imageSlot']>, string> = {
  'hero': 'var(--brand-image-hero)',
  'about': 'var(--brand-image-about)',
  'services': 'var(--brand-image-services)',
  'finance': 'var(--brand-image-finance)',
  'part-exchange': 'var(--brand-image-part-exchange)',
  'sell-your-car': 'var(--brand-image-sell-your-car)',
  'recently-sold': 'var(--brand-image-recently-sold)',
}

export default function PageHero({ eyebrow, title, lead, imageSlot = 'hero', children }: Props) {
  const bg = SLOT_VAR[imageSlot]
  return (
    <section className={styles.hero} style={{ ['--page-hero-bg' as any]: bg }}>
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.inner}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.title}>{title}</h1>
        {lead ? <p className={styles.lead}>{lead}</p> : null}
        {children ? <div className={styles.actions}>{children}</div> : null}
      </div>
    </section>
  )
}
