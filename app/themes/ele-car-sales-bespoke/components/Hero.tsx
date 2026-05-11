import Link from 'next/link'
import { ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react'
import styles from './Hero.module.css'

type HeroProps = {
  brandName?: string
  city?: string
  county?: string
}

export default function Hero({ brandName = 'ELE Car Sales', city = 'Shotts', county = 'Lanarkshire' }: HeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="ele-hero-title">
      <div className={styles.gridBg} aria-hidden="true" />
      <div className={styles.glowA} aria-hidden="true" />
      <div className={styles.glowB} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.copy}>
          <div className={styles.eyebrowRow} data-aos="fade-right">
            <span className={styles.eyebrowAccent} aria-hidden="true" />
            <p className={styles.eyebrow}>Used cars · {city}, {county}</p>
          </div>
          <h1 id="ele-hero-title" className={styles.title} data-aos="fade-up">
            Hand-picked used cars,<br />
            <span className={styles.titleHighlight}>ready to drive away.</span>
          </h1>
          <p className={styles.lead} data-aos="fade-up" data-aos-delay="80">
            Family-run dealer with quality stock, transparent pricing, and
            finance options tailored to you. Visit the showroom in {city}
            or browse the full range online.
          </p>
          <div className={styles.ctaRow} data-aos="fade-up" data-aos-delay="160">
            <Link href="/used-cars" className={styles.primaryCta}>
              Browse stock
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/finance" className={styles.secondaryCta}>
              Check finance options
            </Link>
          </div>
          <ul className={styles.assuranceRow} role="list" data-aos="fade-up" data-aos-delay="240">
            <li className={styles.assuranceItem}>
              <ShieldCheck size={16} aria-hidden="true" />
              HPI-checked
            </li>
            <li className={styles.assuranceItem}>
              <Sparkles size={16} aria-hidden="true" />
              12-month MOT
            </li>
            <li className={styles.assuranceItem}>
              <Truck size={16} aria-hidden="true" />
              Nationwide delivery
            </li>
          </ul>
        </div>

        <div className={styles.media} data-aos="zoom-in" data-aos-delay="80">
          <div className={styles.mediaFrame} aria-hidden="true">
            <div className={styles.mediaImage} role="img" aria-label={`${brandName} showroom`} />
            <div className={styles.mediaScan} aria-hidden="true" />
            <div className={styles.mediaBadge}>
              <span className={styles.mediaBadgeDot} aria-hidden="true" />
              Live stock
            </div>
            <div className={styles.mediaCorner1} aria-hidden="true" />
            <div className={styles.mediaCorner2} aria-hidden="true" />
            <div className={styles.mediaCorner3} aria-hidden="true" />
            <div className={styles.mediaCorner4} aria-hidden="true" />
          </div>
          <span className={styles.mediaAccent} aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
