import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function QueensburyAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Queensbury Cars'
  const aboutCopy =
    (brand?.aboutUs as any)?.description ||
    `${brandName} is an independent UK used car dealer. We hand-pick stock, prepare every car ourselves, and back it with honest finance and aftercare. No salesfloor games — just cars we'd recommend to our own family.`

  return (
    <>
      <section className="qb-page-hero qb-page-hero--about" data-aos="fade-up">
        <div className="qb-page-hero__inner">
          <span className="qb-page-hero__eyebrow">About us</span>
          <h1 className="qb-page-hero__title">Independent, honest, easy to deal with.</h1>
          <p className="qb-page-hero__lead">
            Three things that should be obvious about a used car dealer. We work hard to be all three.
          </p>
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-container">
          <div className={styles.intro}>
            <div className={styles.introCopy} data-aos="fade-up">
              <span className="qb-eyebrow">The story</span>
              <h2 className="qb-section-title">{brandName}</h2>
              <p className={styles.bodyText}>{aboutCopy}</p>
              <p className={styles.bodyText}>
                We started because we were tired of the dealer-floor experience — opaque pricing, pushy finance,
                evasive aftercare. The cars we sell are the cars we'd put our own families in, and we treat every
                customer the same way.
              </p>
              <Link href="/used-cars" className="qb-btn qb-btn--primary">
                Browse the stock
              </Link>
            </div>
            <div className={styles.introMedia} data-aos="fade-up" data-aos-delay="100">
              <div className={styles.mediaFrame}>
                <span className={styles.mediaTag}>On the floor</span>
                <div className={styles.mediaImage} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="qb-section qb-section--tint">
        <div className="qb-container">
          <header className="qb-section-head" data-aos="fade-up">
            <span className="qb-eyebrow">Numbers we're proud of</span>
            <h2 className="qb-section-title">Built on customers we still hear from.</h2>
          </header>
          <ul className={styles.stats}>
            {[
              { value: '4.9★', label: 'Average customer rating' },
              { value: '12 mo', label: 'Standard warranty' },
              { value: '24 hr', label: 'Average finance turnaround' },
              { value: 'UK-wide', label: 'Delivery available' },
            ].map((s, i) => (
              <li key={s.label} className={styles.statCard} data-aos="fade-up" data-aos-delay={i * 70}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-container">
          <header className="qb-section-head" data-aos="fade-up">
            <span className="qb-eyebrow">How we work</span>
            <h2 className="qb-section-title">From enquiry to keys in hand.</h2>
          </header>

          <ol className={styles.steps}>
            {[
              {
                step: '01',
                title: 'Pick a car',
                desc: 'Browse the stock online or pop in. We keep listings honest — full spec, real photos, no hidden niggles.',
              },
              {
                step: '02',
                title: 'Plan the finance',
                desc: 'Soft-search eligibility in seconds. We line up PCP/HP from a panel of lenders and explain the trade-offs.',
              },
              {
                step: '03',
                title: 'Trade & collect',
                desc: 'Bring your old car in or get a guide price online. Sign on the day, drive away the same day if you want to.',
              },
              {
                step: '04',
                title: 'Aftercare that picks up',
                desc: "A real person on the phone if anything's off. Warranty back-up, MOT reminders, the lot.",
              },
            ].map((s, i) => (
              <li key={s.step} className={styles.step} data-aos="fade-up" data-aos-delay={i * 60}>
                <span className={styles.stepNumber}>{s.step}</span>
                <div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}

export default QueensburyAboutPage
