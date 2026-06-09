import Link from 'next/link'
import { ArrowRight, CheckCircle2, ClipboardCheck, PhoneCall, ShieldCheck, Wrench } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from '../info-page.module.css'

export function WarwickWarrantyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Warwick Hall Cars'

  return (
    <main className={styles.page} style={{ '--page-hero-image': 'var(--brand-image-services)' } as any}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>
            <ShieldCheck size={17} aria-hidden="true" />
            Warranty
          </span>
          <h1 className={styles.heroTitle}>Warranty support for confident ownership.</h1>
          <p className={styles.heroLead}>
            Every used car is different. Speak with {brandName} about the warranty options, cover levels
            and aftersales support available on the vehicle you are interested in.
          </p>
          <div className={styles.heroActions}>
            <Link href="/used-cars" className={styles.primaryLink}>
              View current stock
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/contact" className={styles.secondaryLink}>
              Ask about warranty
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.shell}>
          <header className={styles.sectionHead}>
            <span className={styles.kicker}>Before you buy</span>
            <h2 className={styles.title}>Clear guidance before you commit.</h2>
            <p className={styles.lead}>
              Warranty availability can vary by age, mileage, vehicle type and provider. The team will
              explain what applies to the car you choose before you make a decision.
            </p>
          </header>

          <div className={styles.grid}>
            <article className={styles.card}>
              <span className={styles.cardIcon}><ClipboardCheck size={20} aria-hidden="true" /></span>
              <h3>Cover explained</h3>
              <p>Understand the warranty options, exclusions and claim process for your chosen vehicle.</p>
            </article>
            <article className={styles.card}>
              <span className={styles.cardIcon}><Wrench size={20} aria-hidden="true" /></span>
              <h3>Vehicle preparation</h3>
              <p>Ask what checks and preparation have been completed before the handover appointment.</p>
            </article>
            <article className={styles.card}>
              <span className={styles.cardIcon}><PhoneCall size={20} aria-hidden="true" /></span>
              <h3>Aftersales support</h3>
              <p>Know who to contact if you need help after collection or delivery.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={`${styles.shell} ${styles.split}`}>
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>What to ask</span>
            <h2 className={styles.title}>A simple warranty checklist.</h2>
            <p className={styles.lead}>
              Use these points when comparing vehicles or finalising your purchase.
            </p>
          </div>
          <div className={styles.panel}>
            <ul className={styles.list}>
              <li><CheckCircle2 size={18} aria-hidden="true" /> What warranty option is available on this exact vehicle?</li>
              <li><CheckCircle2 size={18} aria-hidden="true" /> What parts, labour and diagnostic items are included?</li>
              <li><CheckCircle2 size={18} aria-hidden="true" /> Is there a claim limit, excess or approved repairer process?</li>
              <li><CheckCircle2 size={18} aria-hidden="true" /> Can the cover be extended or upgraded at purchase?</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

export default WarwickWarrantyPage
