import Link from 'next/link'
import { Award, Users, MapPin, ShieldCheck } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CtaBanner from '../../components/CtaBanner'
import styles from './page.module.css'

const STATS = [
  { Icon: Award, value: 'Hand-picked', label: 'Every car personally selected' },
  { Icon: Users, value: 'Family-run', label: 'Independent Lanarkshire dealer' },
  { Icon: MapPin, value: 'Central belt', label: 'Showroom in Shotts' },
  { Icon: ShieldCheck, value: 'HPI-checked', label: 'Provenance verified before sale' },
]

export function EleAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'ELE Car Sales'
  return (
    <main>
      <PageHero
        eyebrow="About us"
        title={`The team behind ${brandName}.`}
        lead="A family-run dealer in Shotts, Lanarkshire — focused on quality used cars, transparent pricing, and the kind of after-sale support you'd expect from your local garage."
        imageSlot="about"
      />

      <section className={styles.story}>
        <div className={styles.storyInner}>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>Our approach</p>
            <h2 className={styles.h2}>Stock you can trust, service you can rely on.</h2>
            <p className={styles.body}>
              Every car at {brandName} is hand-picked, mechanically inspected, and
              prepared with a fresh 12-month MOT before it goes on sale. We don&apos;t
              do hard sells — we&apos;d rather you drive away happy and come back when
              you need your next one.
            </p>
            <p className={styles.body}>
              We work with FCA-approved lenders to make finance simple, take any
              car in part-exchange, and can deliver nationwide door-to-door if
              you can&apos;t make it to Shotts.
            </p>
            <Link href="/contact" className={styles.cta}>Speak to the team</Link>
          </div>

          <ul className={styles.stats} role="list">
            {STATS.map((s) => {
              const Icon = s.Icon
              return (
                <li key={s.label} className={styles.statCard} data-aos="fade-up">
                  <span className={styles.statIcon} aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <p className={styles.statValue}>{s.value}</p>
                  <p className={styles.statLabel}>{s.label}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <CtaBanner
        eyebrow="Ready when you are"
        title="Visit the showroom or browse online."
        body="We're open Mon–Sat and out-of-hours by appointment. Pop in, give us a call, or browse the latest stock first."
        primaryHref="/used-cars"
        primaryLabel="Browse stock"
        secondaryHref="/contact"
        secondaryLabel="Plan a visit"
        imageSlot="hero"
      />
    </main>
  )
}

export default EleAboutPage
