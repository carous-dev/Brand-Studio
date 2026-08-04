import styles from './PageHero.module.css'

export type PageHeroProps = {
  title: string
  lead?: string
  image?: string
  /** Optional accent kicker above the title (e.g. the inventory hero). */
  eyebrow?: string
  /** Optional hairline trust strip below the lead (inventory hero). */
  assurances?: string[]
}

/**
 * Dark photo band used at the top of every inner page (used-cars, about,
 * contact, sell-your-car, finance, faqs). The image is shown through a focused
 * legibility scrim so the band reads bright while captions stay crisp. Passing
 * `eyebrow` / `assurances` elevates it into the richer inventory hero.
 */
export function PageHero({ title, lead, image, eyebrow, assurances }: PageHeroProps) {
  const hasStrip = Array.isArray(assurances) && assurances.length > 0
  return (
    <section className={styles.hero}>
      {image && (
        <div className={styles.bgImage} style={{ backgroundImage: `url(${image})` }} aria-hidden />
      )}
      <div className={styles.overlay} aria-hidden />
      <div className={styles.glow} aria-hidden />
      <div className={styles.inner}>
        {eyebrow && <p className={`${styles.eyebrow} fbm-animate-rise`}>{eyebrow}</p>}
        <h1
          className={`${styles.title} fbm-animate-rise`}
          style={{ animationDelay: eyebrow ? '80ms' : undefined }}
        >
          {title}
        </h1>
        {lead && (
          <p className={`${styles.lead} fbm-animate-rise`} style={{ animationDelay: '150ms' }}>
            {lead}
          </p>
        )}
        {hasStrip && (
          <ul className={`${styles.assurances} fbm-animate-rise`} style={{ animationDelay: '220ms' }}>
            {assurances!.map((a) => (
              <li key={a} className={styles.assurance}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 12l4 4 10-10"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {a}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default PageHero
