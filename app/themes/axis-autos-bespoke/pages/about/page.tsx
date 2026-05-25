import Link from 'next/link'
import { ArrowRight, ShieldCheck, BadgePoundSterling, Truck, Wrench } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function AxisAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Axis Autos'
  const address = (brand as any)?.location?.address || {}
  const locationLabel = [address.city, address.county].filter(Boolean).join(', ') || 'the UK'

  return (
    <main>
      <section className="axis-page-hero axis-page-hero--about" aria-label="About hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">about.us</span>
          <h1>Sold straight from one forecourt</h1>
          <p>
            {brandName} is an independent used-car retailer in {locationLabel}.
            One workshop, one team, one rule — sell good cars to good people,
            and don&apos;t waste anyone&apos;s time.
          </p>
        </div>
      </section>

      <section className={`axis-section ${styles.body}`}>
        <div className={styles.inner}>
          <div className={styles.copy} data-aos="fade-up">
            <span className={styles.eyebrow}>{'> '}story.txt</span>
            <h2 className={styles.headline}>How we got here</h2>
            <p>
              {brandName} started on the same plot it sits on today — workshop,
              forecourt, phone number. Plenty changed in the years since, but
              the floor rule didn&apos;t: inspect, fix, MOT, valet, hand over keys.
              In that order.
            </p>
            <p>
              No chain, no franchise, no sales-target spreadsheet. We say no to
              cars that aren&apos;t right, we price honestly, and we&apos;ll lose a sale
              before we&apos;d push one. Customers come back. So do their families.
            </p>
            <p>
              Finance is arranged in-house with the major UK lenders.
              Part-exchange valuations happen on the spot. Nationwide delivery
              is door-to-door. After-sale support comes from the same number
              that sold you the car.
            </p>
          </div>

          <aside className={styles.principles} aria-label="Our principles">
            <h3 className={styles.principlesTitle}>{'> '}principles.config</h3>
            <ul className={styles.principlesList}>
              <li>
                <span className={styles.code}>01</span>
                <ShieldCheck size={18} strokeWidth={1.8} aria-hidden="true" />
                <div>
                  <strong>Prep over polish</strong>
                  <span>Inspect, fix, MOT, valet — in that order.</span>
                </div>
              </li>
              <li>
                <span className={styles.code}>02</span>
                <BadgePoundSterling size={18} strokeWidth={1.8} aria-hidden="true" />
                <div>
                  <strong>One honest price</strong>
                  <span>No haggling theatre, no &ldquo;manager fees&rdquo;.</span>
                </div>
              </li>
              <li>
                <span className={styles.code}>03</span>
                <Truck size={18} strokeWidth={1.8} aria-hidden="true" />
                <div>
                  <strong>Nationwide delivery</strong>
                  <span>Free within 30 miles, fixed price beyond.</span>
                </div>
              </li>
              <li>
                <span className={styles.code}>04</span>
                <Wrench size={18} strokeWidth={1.8} aria-hidden="true" />
                <div>
                  <strong>After-sale support</strong>
                  <span>Warranty queries handled by the same team.</span>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className={`axis-section axis-section--dark ${styles.ctaBand}`}>
        <div className={styles.ctaInner}>
          <div data-aos="fade-up">
            <span className={styles.ctaEyebrow}>{'> '}visit.us</span>
            <h2 className={styles.ctaTitle}>Come see the lot</h2>
            <p className={styles.ctaLead}>
              The forecourt is open. Bring a coffee, take a few keys, find the
              car you want.
            </p>
          </div>
          <div className={styles.ctaActions} data-aos="fade-left">
            <Link href="/contact" className="axis-btn axis-btn--primary">
              Get directions
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <Link href="/used-cars" className="axis-btn axis-btn--ghost-light">
              Browse stock
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AxisAboutPage
