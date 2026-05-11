import styles from './PageHero.module.css'

type PageHeroProps = {
  eyebrow?: string
  title: string
  lead?: string
  imageSlot?: 'hero' | 'about' | 'services' | 'finance' | 'partExchange' | 'sellYourCar' | 'recentlySold'
  pills?: string[]
}

const SLOT_TO_VAR: Record<NonNullable<PageHeroProps['imageSlot']>, string> = {
  hero: 'var(--brand-image-hero)',
  about: 'var(--brand-image-about)',
  services: 'var(--brand-image-services)',
  finance: 'var(--brand-image-finance)',
  partExchange: 'var(--brand-image-part-exchange)',
  sellYourCar: 'var(--brand-image-sell-your-car)',
  recentlySold: 'var(--brand-image-recently-sold)',
}

export default function PageHero({ eyebrow, title, lead, imageSlot = 'hero', pills }: PageHeroProps) {
  const bgVar = SLOT_TO_VAR[imageSlot]
  const style = { ['--ph-bg' as any]: bgVar } as React.CSSProperties

  return (
    <section className={styles.pageHero} style={style} aria-labelledby="page-hero-title">
      <div className={styles.bgImage} aria-hidden="true" data-mfx-scroll="parallax-slow" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={`${styles.glow} mfx-glow-pulse`} aria-hidden="true" />
      <div className={styles.gridPattern} aria-hidden="true" />

      <div className={styles.inner}>
        {eyebrow ? (
          <p className={styles.eyebrow} data-aos="fade-down">{eyebrow}</p>
        ) : null}
        <h1 id="page-hero-title" className={styles.title} data-aos="fade-up" data-aos-delay="80">
          {title}
        </h1>
        {lead ? (
          <p className={styles.lead} data-aos="fade-up" data-aos-delay="160">{lead}</p>
        ) : null}
        {pills && pills.length > 0 ? (
          <ul className={styles.pills} data-aos="fade-up" data-aos-delay="240">
            {pills.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
