import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

export function NcrAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'NCR Van Sales Ltd'

  const pillars = [
    {
      title: 'Trade-first',
      body: `${brandName} was built for working drivers. We stock what trade buyers actually buy — Transits, Sprinters, Crafters, Vivaros, Lutons and tippers — and we list every detail upfront.`,
    },
    {
      title: 'Workshop-prepared',
      body: 'Every van goes through a multi-point inspection, an MOT (if due), a service and a thorough valet before it hits the forecourt. No surprises after handover.',
    },
    {
      title: 'Finance built for business',
      body: 'Sole trader, limited company, fleet operator — we work with finance houses that understand commercial buyers and offer competitive terms across the board.',
    },
    {
      title: 'Honest pricing',
      body: 'No haggling games. Our prices reflect the market and the van. You see the same number on the website that you see on the forecourt.',
    },
  ]

  return (
    <>
      <PageHero
        eyebrow="About us"
        title={`Who is ${brandName}?`}
        lead={`A small team of van people, serving trade buyers across the UK with honest pricing, finance, and a 7-day exchange promise.`}
        imageSlot="about"
        pills={['Established', 'Workshop-prepared', 'Trade-focused']}
      />

      <section className={styles.intro}>
        <div className={styles.introInner} data-aos="fade-up">
          <p className={styles.eyebrow}>Our story</p>
          <h2 className={styles.headline}>
            We sell vans the way we'd want to <span className={styles.headlineAccent}>buy one.</span>
          </h2>
          <p className={styles.body}>
            Most of our customers are working people who depend on their van to earn a living. That changes how we do things. We don't pile cheap stock high and hope it moves — we hand-pick vehicles that earn their keep, prepare them properly, and stand behind them with a 7-day exchange policy.
          </p>
          <p className={styles.body}>
            Whether you're a sole trader looking for your first reliable Transit, a builder scaling up to a Luton, or a fleet operator buying ten Sprinters at once, the conversation looks the same: tell us what you need, we'll line up the right vans and the right finance.
          </p>
        </div>
      </section>

      <section className={styles.pillars}>
        <div className={styles.pillarsInner}>
          <ul className={styles.pillarsGrid}>
            {pillars.map((p, i) => (
              <li key={p.title} className={styles.pillarCard} data-aos="fade-up" data-aos-delay={i * 80}>
                <span className={styles.pillarNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.ctaWrap}>
        <div className={styles.ctaInner} data-aos="zoom-in-up">
          <h2>Ready to find your next van?</h2>
          <div className={styles.ctaRow}>
            <Link href="/used-cars" className={`${styles.ctaPrimary} mfx-shimmer`}>Browse stock</Link>
            <Link href="/contact" className={styles.ctaSecondary}>Talk to us</Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default NcrAboutPage
