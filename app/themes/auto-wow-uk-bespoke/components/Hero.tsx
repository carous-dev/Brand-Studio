import Link from 'next/link'
import type { BrandConfig } from '@/brands/types'
import styles from './Hero.module.css'

type HeroProps = {
  brand: BrandConfig | null | undefined
}

export default function Hero({ brand }: HeroProps) {
  const brandName = brand?.name || 'AUTOWOW UK'
  const city = (brand?.location as any)?.address?.city
    || (brand?.location as any)?.address?.town
    || 'Reading'

  return (
    <section className={styles.hero} data-aos="fade" data-aos-delay="80">
      <div className={styles.parallaxLayer} data-mfx-scroll="parallax-slow" aria-hidden="true">
        <div className={styles.image} />
      </div>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={[styles.grid, 'mfx-grid-drift'].join(' ')} aria-hidden="true" />
      <span className={[styles.glow, 'mfx-glow-pulse'].join(' ')} aria-hidden="true" />
      <span className={[styles.glowOrbit, 'mfx-glow-orbit'].join(' ')} aria-hidden="true" />
      <div className={styles.scanline} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.chips} data-aos="fade-up" data-aos-delay="160">
            <span className={styles.chip}>
              <span className="mfx-pulse-dot" aria-hidden="true" />
              Live stock
            </span>
            <span className={styles.chip}>Finance from 9.9% APR</span>
            <span className={styles.chip}>14-day return</span>
          </div>

          <h1 className={styles.title} data-aos="fade-up" data-aos-delay="200">
            <span className={styles.titleLine}>Quality used cars,</span>
            <span className={styles.titleLine}>
              <span className={[styles.titleHighlight, 'mfx-text-glow'].join(' ')}>built for the road.</span>
            </span>
          </h1>

          <p className={styles.lead} data-aos="fade-up" data-aos-delay="280">
            {brandName} hand-picks every vehicle on the forecourt. Workshop-checked,
            HPI-clear, and ready to drive from {city} — anywhere in mainland UK.
          </p>

          <div className={styles.actions} data-aos="slide-up" data-aos-delay="360">
            <Link href="/used-cars" className={[styles.primaryCta, 'mfx-shimmer'].join(' ')}>
              <span>Browse our stock</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/sell-my-car" className={styles.ghostCta}>
              <span>Sell your car</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Link>
          </div>

          <div className={styles.meta} data-aos="fade-up" data-aos-delay="460">
            <div className={styles.metaCorner} aria-hidden="true">
              <span className={styles.corner} />
              <span className={styles.corner} />
              <span className={styles.corner} />
              <span className={styles.corner} />
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Open today</span>
              <span className={styles.metaValue}>09:00 — 18:00</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>HPI checked</span>
              <span className={styles.metaValue}>Every vehicle</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Delivery</span>
              <span className={styles.metaValue}>UK-wide</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomFade} aria-hidden="true" />
    </section>
  )
}
