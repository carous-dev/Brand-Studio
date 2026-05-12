import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PullQuote from '../../components/PullQuote'
import TrustBand from '../../components/TrustBand'
import styles from './page.module.css'

export function KainAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Kain Motors'
  return (
    <>
      <PageHero
        variant="about"
        eyebrow="About the showroom"
        title="A Manchester independent built on referrals."
        lead="We don’t do volume targets, pushy upsells or hidden admin fees. We buy carefully, photograph honestly, and sell to people who appreciate the difference."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
        actions={
          <>
            <Link href="/used-cars" className="kain-btn kain-btn--gold">View current stock</Link>
            <Link href="/contact" className="kain-btn kain-btn--ghost-dark">Book a viewing</Link>
          </>
        }
      />

      <section className={`kain-section ${styles.intro}`}>
        <div className={styles.introInner}>
          <div className={styles.col} data-aos="fade-up">
            <p className="kain-eyebrow">Founded · 2021</p>
            <h2 className={styles.title}>Started by Kain.<br />Run by people, not algorithms.</h2>
            <p className={styles.body}>
              {brandName} began on the back of a simple observation: too many used-car buyers feel like they’re
              being managed rather than helped. We set up the Midlands Street showroom as an
              <em> appointment-only </em> space so every customer gets a proper hour with us — and not a queue.
            </p>
            <p className={styles.body}>
              Every car on the forecourt is bought by us, inspected by our prep team, photographed in natural
              light, and listed with the warts described. If a car has a chip or a service-history gap, you’ll
              read about it in the listing — not discover it on a test drive.
            </p>
          </div>
          <aside className={styles.statsCard} data-aos="fade-left" data-aos-delay="120">
            <div className={styles.statsRow}>
              <span className={styles.statNumber}>1,200+</span>
              <span className={styles.statLabel}>Cars sold since launch</span>
            </div>
            <div className={styles.statsRow}>
              <span className={styles.statNumber}>4.9</span>
              <span className={styles.statLabel}>Average review rating</span>
            </div>
            <div className={styles.statsRow}>
              <span className={styles.statNumber}>UK-wide</span>
              <span className={styles.statLabel}>Delivery coverage</span>
            </div>
          </aside>
        </div>
      </section>

      <PullQuote
        quote="“We treat every car like it’s about to leave with someone we know. That’s what keeps people coming back.”"
        attribution="— Kain, founder"
      />

      <TrustBand />

      <section className={`kain-section ${styles.story}`}>
        <div className={styles.storyInner}>
          <h2 className={styles.storyTitle}>Three things every buyer gets</h2>
          <ol className={styles.storyList}>
            <li>
              <span className={styles.storyNum}>I.</span>
              <h3>An honest car</h3>
              <p>Every car is HPI-checked, mileage-verified and prepped before it’s photographed. Faults are disclosed in the listing.</p>
            </li>
            <li>
              <span className={styles.storyNum}>II.</span>
              <h3>A no-pressure offer</h3>
              <p>Whether you’re buying outright, financing, or part-exchanging, you’ll get the same patient walkthrough.</p>
            </li>
            <li>
              <span className={styles.storyNum}>III.</span>
              <h3>An after-sale that responds</h3>
              <p>WhatsApp the showroom or call directly. Warranty queries are answered same-day in opening hours.</p>
            </li>
          </ol>
        </div>
      </section>
    </>
  )
}

export default KainAboutPage
