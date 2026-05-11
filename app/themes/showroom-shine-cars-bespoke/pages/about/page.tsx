import Link from 'next/link'
import { Award, Users, ShieldCheck, Wrench, Phone, MapPin } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const VALUES = [
  { icon: ShieldCheck, title: 'Honest', body: 'No hidden costs, no pressure selling. Every car we sell is fully inspected and clearly priced.' },
  { icon: Wrench, title: 'Thorough', body: 'Each vehicle is HPI-checked, mileage-verified, and prepared to a high retail standard.' },
  { icon: Users, title: 'Personal', body: 'Appointment-only viewings mean you get our undivided attention from enquiry to handover.' },
  { icon: Award, title: 'Proven', body: 'Over 20 years serving Coventry and the West Midlands — backed by hundreds of five-star reviews.' },
]

export function ShowroomAboutPage(_: ThemePageProps) {
  return (
    <article>
      <section className="shr-page-hero shr-page-hero--about">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">About Us</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            Coventry&apos;s trusted independent dealer.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Family-run since the early 2000s, Showroom Shine Cars has built a reputation for
            quality used vehicles and dependable service across the West Midlands.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.story}`}>
        <div className="shr-container">
          <div className={styles.storyLayout}>
            <div className={styles.storyCopy} data-aos="fade-right">
              <span className="shr-eyebrow">Our story</span>
              <h2 className={styles.storyTitle}>
                20+ years of trusted service in Coventry &amp; the West Midlands.
              </h2>
              <p>
                We started as a small forecourt with a simple promise: source the right car,
                prepare it properly, and stand behind it after the sale. Two decades on, that
                promise still drives every part of the business.
              </p>
              <p>
                Today we hold over 500 vehicles, work with main-dealer suppliers, and offer
                finance, part exchange, HPI checks, and a minimum 3-month warranty as standard.
                We&apos;ve also kept the appointment-only viewings — because the buyer in front of us
                always comes first.
              </p>
              <div className={styles.storyActions}>
                <Link href="/used-cars" className="shr-btn-primary">Browse our stock</Link>
                <Link href="/contact" className="shr-btn-ghost-light">Visit us</Link>
              </div>
            </div>

            <aside className={styles.storyStats} data-aos="fade-left">
              <div className={styles.storyStatHead}>
                <span className={styles.storyStatEyebrow}>By the numbers</span>
              </div>
              <div className={styles.storyStatGrid}>
                <div className={styles.storyStat}>
                  <span className={styles.storyStatNum}>500+</span>
                  <span className={styles.storyStatLabel}>Vehicles available</span>
                </div>
                <div className={styles.storyStat}>
                  <span className={styles.storyStatNum}>300+</span>
                  <span className={styles.storyStatLabel}>Happy customers</span>
                </div>
                <div className={styles.storyStat}>
                  <span className={styles.storyStatNum}>20+</span>
                  <span className={styles.storyStatLabel}>Years trading</span>
                </div>
                <div className={styles.storyStat}>
                  <span className={styles.storyStatNum}>125+</span>
                  <span className={styles.storyStatLabel}>Makes &amp; models</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className={`shr-section shr-section--dark ${styles.values}`}>
        <div className="shr-container">
          <div className="shr-section-head" data-aos="fade-up">
            <span className="shr-eyebrow">What we stand for</span>
            <h2 className="shr-section-head__title">Four values, every car, every customer.</h2>
          </div>
          <div className={styles.valuesGrid}>
            {VALUES.map((v, i) => {
              const Icon = v.icon
              return (
                <div key={v.title} className={styles.valueCard} data-aos="fade-up" data-aos-delay={`${i * 100}`}>
                  <span className={styles.valueIcon} aria-hidden>
                    <Icon size={22} strokeWidth={2.2} />
                  </span>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueBody}>{v.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className={`shr-section ${styles.visit}`}>
        <div className="shr-container">
          <div className={styles.visitLayout}>
            <div data-aos="fade-up">
              <span className="shr-eyebrow">Visit the showroom</span>
              <h2 className={styles.visitTitle}>Come and see your next car in person.</h2>
              <ul className={styles.visitDetails}>
                <li>
                  <MapPin size={18} strokeWidth={2.2} aria-hidden />
                  No 1 Oak Cottage, Coventry, CV5 9DA, West Midlands
                </li>
                <li>
                  <Phone size={18} strokeWidth={2.2} aria-hidden />
                  <a href="tel:07537164927">07537 164927</a>
                </li>
              </ul>
              <p className={styles.visitNote}>
                Viewings by appointment only — please call or message ahead to arrange a slot.
              </p>
              <Link href="/contact" className="shr-btn-primary">Book an appointment</Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}

export default ShowroomAboutPage
