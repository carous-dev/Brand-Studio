import styles from './PageHero.module.css'

type PageHeroProps = {
  eyebrow?: string
  title: string
  lead?: string
  imageSlot?: 'hero' | 'about' | 'services' | 'finance' | 'partExchange' | 'sellYourCar' | 'recentlySold'
  /** Optional stat pills shown beneath the lead (e.g. "HPI-checked", "Finance available"). */
  pills?: string[]
}

const SLOT_VAR: Record<string, string> = {
  hero: 'var(--brand-image-hero)',
  about: 'var(--brand-image-about, var(--brand-image-hero))',
  services: 'var(--brand-image-services, var(--brand-image-hero))',
  finance: 'var(--brand-image-finance, var(--brand-image-hero))',
  partExchange: 'var(--brand-image-part-exchange, var(--brand-image-hero))',
  sellYourCar: 'var(--brand-image-sell-your-car, var(--brand-image-hero))',
  recentlySold: 'var(--brand-image-recently-sold, var(--brand-image-hero))',
}

export default function PageHero({ eyebrow, title, lead, imageSlot = 'hero', pills }: PageHeroProps) {
  const bg = SLOT_VAR[imageSlot] || SLOT_VAR.hero
  return (
    <section className={styles.pageHero}>
      <div className={styles.bg} aria-hidden="true" style={{ backgroundImage: bg } as any} />
      <div className={styles.gradient} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        {eyebrow ? (
          <div className={styles.eyebrowRow} data-aos="fade-right">
            <span className={styles.eyebrowAccent} aria-hidden="true" />
            <p className={styles.eyebrow}>{eyebrow}</p>
          </div>
        ) : null}
        <h1 className={styles.title} data-aos="fade-up">{title}</h1>
        {lead ? <p className={styles.lead} data-aos="fade-up" data-aos-delay="80">{lead}</p> : null}
        {pills && pills.length > 0 ? (
          <div className={styles.statRow} data-aos="fade-up" data-aos-delay="160">
            {pills.map((p, i) => (
              <span key={i} className={styles.statPill}>
                <span className={styles.statPillDot} aria-hidden="true" />
                {p}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
