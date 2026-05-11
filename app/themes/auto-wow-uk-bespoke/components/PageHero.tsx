import { HeroBackdrop } from './HeroBackdrop'
import styles from './PageHero.module.css'

type PageHeroProps = {
  eyebrow: string
  title: string
  lead?: string
  imageSlot?: 'hero' | 'about' | 'services' | 'finance' | 'partExchange' | 'sellYourCar' | 'recentlySold'
  pills?: string[]
}

const SLOT_VAR: Record<NonNullable<PageHeroProps['imageSlot']>, string> = {
  hero: 'var(--brand-image-hero)',
  about: 'var(--brand-image-about)',
  services: 'var(--brand-image-services)',
  finance: 'var(--brand-image-finance)',
  partExchange: 'var(--brand-image-part-exchange)',
  sellYourCar: 'var(--brand-image-sell-your-car)',
  recentlySold: 'var(--brand-image-recently-sold)',
}

export default function PageHero({ eyebrow, title, lead, imageSlot = 'hero', pills }: PageHeroProps) {
  const bg = SLOT_VAR[imageSlot]

  return (
    <section
      className={styles.pageHero}
      data-aos="fade"
      style={{ ['--page-hero-image' as any]: bg }}
    >
      <HeroBackdrop className={styles.backdrop} />
      <div className={styles.image} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={[styles.grid, 'mfx-grid-drift'].join(' ')} aria-hidden="true" />
      <span className={[styles.glow, 'mfx-glow-pulse'].join(' ')} aria-hidden="true" />

      <div className={styles.inner}>
        <p className={styles.eyebrow} data-aos="fade-up" data-aos-delay="80">
          <span className={styles.eyebrowDash} aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className={styles.title} data-aos="fade-up" data-aos-delay="160">
          {title}
        </h1>
        {lead ? (
          <p className={styles.lead} data-aos="fade-up" data-aos-delay="240">{lead}</p>
        ) : null}
        {pills && pills.length > 0 ? (
          <ul className={styles.pills} data-aos="fade-up" data-aos-delay="320">
            {pills.map((pill) => (
              <li key={pill} className={styles.pill}>{pill}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className={styles.bottomFade} aria-hidden="true" />
    </section>
  )
}
