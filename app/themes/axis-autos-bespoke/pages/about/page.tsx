import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import { ArrowRight, ShieldCheck, ClipboardCheck, MapPin } from 'lucide-react'
import styles from './page.module.css'

export function AxisAboutPage({ brand }: ThemePageProps) {
  const address = (brand as any)?.location?.address || {}
  const city = address.city || 'the local area'
  const brandName = brand?.name || 'Axis Autos'

  return (
    <>
      <section className="axis-page-hero axis-page-hero--about">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">About</span>
          <h1 className="axis-page-hero-title">An independent dealer that takes used cars seriously.</h1>
          <p className="axis-page-hero-lead">
            {brandName} has been serving {city} with hand-picked, mechanically-inspected used cars. We're a small,
            honest team — not a high-street chain. Every car we sell is one we'd be happy to drive home ourselves.
          </p>
        </div>
      </section>

      <section className="axis-section">
        <div className="axis-shell">
          <div className={styles.grid}>
            <article className={styles.story} data-aos="fade-up">
              <span className="axis-eyebrow">Our story</span>
              <h2 className={styles.h2}>Built on word-of-mouth, not glossy adverts.</h2>
              <p>
                We started selling cars to friends and family who were tired of the high-street experience — pushy
                salespeople, hidden admin fees, and finance APRs nobody could explain. We do the opposite.
              </p>
              <p>
                Every car on our forecourt has been mechanically inspected, HPI-checked, and priced fairly against
                the wider market. If we wouldn't sell a car to our mother, we don't sell it at all.
              </p>
              <p>
                Today we're proud to serve buyers from across the UK. Most of our customers come back to us — and
                bring their friends.
              </p>
            </article>

            <aside className={styles.values} data-aos="fade-up" data-aos-delay="80">
              <ul>
                <li>
                  <span className={styles.iconBox}><ClipboardCheck size={20} strokeWidth={1.6} /></span>
                  <h3>100-point inspection</h3>
                  <p>Every car. Every time. No exceptions.</p>
                </li>
                <li>
                  <span className={styles.iconBox}><ShieldCheck size={20} strokeWidth={1.6} /></span>
                  <h3>3-month warranty</h3>
                  <p>Included as standard on every vehicle.</p>
                </li>
                <li>
                  <span className={styles.iconBox}><MapPin size={20} strokeWidth={1.6} /></span>
                  <h3>Nationwide delivery</h3>
                  <p>Doorstep delivery across the UK mainland.</p>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="axis-section axis-section--card">
        <div className="axis-shell">
          <div className={styles.ctaBlock} data-aos="fade-up">
            <h2 className={styles.h2}>Browse the showroom.</h2>
            <Link href="/used-cars" className="axis-btn axis-btn--primary">
              See all stock
              <ArrowRight size={18} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default AxisAboutPage
