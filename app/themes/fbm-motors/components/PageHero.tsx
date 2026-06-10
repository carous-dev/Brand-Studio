import styles from './PageHero.module.css'

export type PageHeroProps = {
  title: string
  lead?: string
  image?: string
}

/**
 * Dark photo band used at the top of every inner page (used-cars, about,
 * contact, sell-your-car, finance, faqs). The image is optional — when omitted
 * the radial-gradient anchor + grid atmosphere still reads as a hero band.
 */
export function PageHero({ title, lead, image }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className={styles.bgImage} />
      )}
      <div className={styles.atmosphere} aria-hidden />
      <div className={styles.overlay} aria-hidden />
      <div className={styles.inner}>
        <h1 className={`${styles.title} fbm-animate-rise`}>{title}</h1>
        {lead && <p className={`${styles.lead} fbm-animate-rise`} style={{ animationDelay: '120ms' }}>{lead}</p>}
      </div>
    </section>
  )
}

export default PageHero
