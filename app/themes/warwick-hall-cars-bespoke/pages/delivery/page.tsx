import Link from 'next/link'
import { ArrowRight, CalendarCheck, CheckCircle2, ClipboardCheck, MapPin, Truck } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from '../info-page.module.css'

export function WarwickDeliveryPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Warwick Hall Cars'

  return (
    <main className={styles.page} style={{ '--page-hero-image': 'var(--brand-image-recently-sold)' } as any}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>
            <Truck size={17} aria-hidden="true" />
            Delivery
          </span>
          <h1 className={styles.heroTitle}>Vehicle delivery and handover made simple.</h1>
          <p className={styles.heroLead}>
            Whether you collect from the showroom or arrange a delivery, {brandName} will confirm
            the timing, documents and handover steps before the day.
          </p>
          <div className={styles.heroActions}>
            <Link href="/used-cars" className={styles.primaryLink}>
              Choose a vehicle
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/contact" className={styles.secondaryLink}>
              Discuss delivery
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.shell}>
          <header className={styles.sectionHead}>
            <span className={styles.kicker}>Handover options</span>
            <h2 className={styles.title}>Plan collection or delivery with the team.</h2>
            <p className={styles.lead}>
              Availability depends on location, vehicle, preparation status and payment arrangements.
              The team will confirm what is possible before booking your handover.
            </p>
          </header>

          <div className={styles.grid}>
            <article className={styles.card}>
              <span className={styles.cardIcon}><MapPin size={20} aria-hidden="true" /></span>
              <h3>Showroom collection</h3>
              <p>Book an appointment to view, complete paperwork and collect your vehicle in person.</p>
            </article>
            <article className={styles.card}>
              <span className={styles.cardIcon}><Truck size={20} aria-hidden="true" /></span>
              <h3>Delivery discussion</h3>
              <p>Ask the team whether delivery is available for your location and chosen vehicle.</p>
            </article>
            <article className={styles.card}>
              <span className={styles.cardIcon}><ClipboardCheck size={20} aria-hidden="true" /></span>
              <h3>Paperwork ready</h3>
              <p>Have identification, payment confirmation and any finance documents ready for handover.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={`${styles.shell} ${styles.split}`}>
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>Process</span>
            <h2 className={styles.title}>What happens before handover.</h2>
          </div>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNo}>01</span>
              <div>
                <h3>Confirm the vehicle</h3>
                <p>Reserve or agree the vehicle, subject to the dealer process and availability.</p>
              </div>
            </li>
            <li>
              <span className={styles.stepNo}>02</span>
              <div>
                <h3>Agree collection or delivery</h3>
                <p>The team confirms timing, location and any delivery considerations with you.</p>
              </div>
            </li>
            <li>
              <span className={styles.stepNo}>03</span>
              <div>
                <h3>Complete final checks</h3>
                <p>Payment, ID, paperwork and vehicle handover are checked before release.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.shell}>
          <div className={styles.panel}>
            <ul className={styles.list}>
              <li><CheckCircle2 size={18} aria-hidden="true" /> Bring a valid driving licence or photographic ID when requested.</li>
              <li><CheckCircle2 size={18} aria-hidden="true" /> Arrange insurance and vehicle tax before driving away.</li>
              <li><CalendarCheck size={18} aria-hidden="true" /> Confirm appointment times before travelling to the showroom.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

export default WarwickDeliveryPage
