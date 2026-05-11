import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import Reviews from '../../components/Reviews'
import Directory from '../../components/Directory'
import styles from './page.module.css'

export function AutoAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'AUTOWOW UK'

  return (
    <>
      <PageHero
        eyebrow="About us"
        title={`${brandName} — built on the forecourt.`}
        lead="Family-run, no-pressure, and every vehicle workshop-checked. Twelve years on, we still pick stock the way we did on day one — drive it, sit in it, listen to it."
        imageSlot="about"
        pills={['Family-run', 'Workshop-checked', 'No haggling']}
      />

      <section className={styles.story} aria-labelledby="story-heading">
        <div className={styles.storyInner}>
          <div className={styles.storyText} data-aos="fade-up">
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDash} aria-hidden="true" />
              Our story
            </p>
            <h2 id="story-heading" className={styles.storyHeading}>
              Twelve years on the forecourt.
            </h2>
            <p>
              {brandName} opened with one principle that hasn&apos;t changed:
              every car on our forecourt is one we&apos;d happily put a member
              of our own family in.
            </p>
            <p>
              That means we walk every vehicle through our workshop before it
              hits the website. HPI-checks, fluids, brakes, electrics, tyres.
              If it doesn&apos;t pass the bench, it doesn&apos;t make the
              forecourt.
            </p>
            <p>
              Twelve years on we&apos;ve grown from a single-car start-up to a
              full-service used-car operation with finance, part-exchange, and
              UK-wide delivery — but we still pick stock the same way: by
              driving it.
            </p>
          </div>
          <aside className={styles.storyAside} data-aos="fade-up" data-aos-delay="120">
            <div className={styles.statBlock}>
              <span className={styles.statValue}>12<span className={styles.statSuffix}>+</span></span>
              <span className={styles.statLabel}>Years on the forecourt</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statValue}>4.9<span className={styles.statSuffix}>/5</span></span>
              <span className={styles.statLabel}>Customer rating</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statValue}>200<span className={styles.statSuffix}>+</span></span>
              <span className={styles.statLabel}>Reviewed buyers</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statValue}>UK</span>
              <span className={styles.statLabel}>Mainland delivery</span>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.values} aria-labelledby="values-heading">
        <div className={styles.valuesInner}>
          <header className={styles.valuesHead} data-aos="fade-up">
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDash} aria-hidden="true" />
              How we work
            </p>
            <h2 id="values-heading" className={styles.valuesHeading}>
              Three things we will not compromise on.
            </h2>
          </header>
          <ul className={styles.valuesList}>
            <li className={styles.value} data-aos="fade-up" data-aos-delay="80">
              <span className={styles.valueNum}>01</span>
              <h3 className={styles.valueTitle}>Quality before listing</h3>
              <p>
                If we wouldn&apos;t drive it home, we won&apos;t list it. Every
                vehicle gets a full workshop check before the photographs go up.
              </p>
            </li>
            <li className={styles.value} data-aos="fade-up" data-aos-delay="160">
              <span className={styles.valueNum}>02</span>
              <h3 className={styles.valueTitle}>Plain-talk prices</h3>
              <p>
                The price on the window is the price you pay. Part-exchange and
                finance valuations are written down so you can take them away.
              </p>
            </li>
            <li className={styles.value} data-aos="fade-up" data-aos-delay="240">
              <span className={styles.valueNum}>03</span>
              <h3 className={styles.valueTitle}>14-day return policy</h3>
              <p>
                We back every car we sell with a 14-day exchange policy. If
                the car doesn&apos;t fit your life, bring it back.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <Reviews />
      <Directory brand={brand} />
    </>
  )
}

export default AutoAboutPage
