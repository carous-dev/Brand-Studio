import Link from 'next/link'
import { ArrowRight, ShieldCheck, BadgePoundSterling, Truck, Wrench } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function AutoAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Autowow'
  const address = (brand as any)?.location?.address || {}
  const locationLabel = [address.city, address.county].filter(Boolean).join(', ') || 'across the UK'

  return (
    <main>
      <section className="auto-page-hero auto-page-hero--about" aria-label="About hero">
        <div className="auto-page-hero-inner">
          <span className="auto-page-hero-eyebrow">[ About ]</span>
          <h1>Independent. Honest. Ready.</h1>
          <p>
            {brandName} is an independent used-car retailer in {locationLabel} —
            built around a simple rule: sell good cars to good people, and don&apos;t
            mess about with anyone&apos;s time.
          </p>
        </div>
      </section>

      <section className={`auto-section ${styles.body}`}>
        <div className={styles.inner}>
          <div className={styles.copy} data-aos="fade-up">
            <span className={styles.eyebrow}>[ Our story ]</span>
            <h2 className={styles.headline}>How we got here</h2>
            <p>
              {brandName} started on the same plot it sits on today — one
              workshop, a small forecourt, and a phone number. A lot has changed
              in the years since, but the rule hasn&apos;t: every car we sell goes
              through inspection, prep, and ready-to-drive checks before the
              key gets handed over.
            </p>
            <p>
              We aren&apos;t a chain, we aren&apos;t a franchise, and we don&apos;t answer to a
              sales-target spreadsheet. That means we say no to cars that aren&apos;t
              right, we price honestly, and we&apos;ll happily lose a sale rather
              than gain a return. Customers come back. So do their families.
            </p>
            <p>
              Finance is in-house arranged with the major UK lenders. Part-
              exchange valuations are done on the spot. Nationwide delivery is
              door-to-door, and the after-sale care doesn&apos;t end when the car
              leaves the forecourt.
            </p>
          </div>

          <aside className={styles.principles} aria-label="Our principles">
            <h3 className={styles.principlesTitle}>How we work</h3>
            <ul className={styles.principlesList}>
              <li>
                <ShieldCheck size={20} strokeWidth={1.8} aria-hidden="true" />
                <div>
                  <strong>Prep over polish.</strong>
                  <span>Inspect, fix, MOT, valet — in that order.</span>
                </div>
              </li>
              <li>
                <BadgePoundSterling size={20} strokeWidth={1.8} aria-hidden="true" />
                <div>
                  <strong>One honest price.</strong>
                  <span>No haggling theatre, no &ldquo;manager fees&rdquo;.</span>
                </div>
              </li>
              <li>
                <Truck size={20} strokeWidth={1.8} aria-hidden="true" />
                <div>
                  <strong>Nationwide delivery.</strong>
                  <span>Free within 30 miles, fixed price beyond.</span>
                </div>
              </li>
              <li>
                <Wrench size={20} strokeWidth={1.8} aria-hidden="true" />
                <div>
                  <strong>After-sale support.</strong>
                  <span>Warranty queries handled by the same team.</span>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className={`auto-section auto-section--dark ${styles.ctaBand}`}>
        <div className={styles.ctaInner}>
          <div data-aos="fade-up">
            <span className={styles.ctaEyebrow}>[ Visit ]</span>
            <h2 className={styles.ctaTitle}>Come see the lot</h2>
            <p className={styles.ctaLead}>
              The forecourt is open. Bring a coffee, take a few keys, and find
              the car you want.
            </p>
          </div>
          <div className={styles.ctaActions} data-aos="fade-left">
            <Link href="/contact" className="auto-btn auto-btn--primary mfx-shimmer">
              Get directions
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <Link href="/used-cars" className="auto-btn auto-btn--ghost-light">
              Browse stock
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AutoAboutPage
