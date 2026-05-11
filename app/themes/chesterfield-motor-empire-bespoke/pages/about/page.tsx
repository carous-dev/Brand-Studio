import Link from 'next/link'
import { ArrowRight, ShieldCheck, Users, Award, Wrench, MapPin, Clock } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CtaImageBand from '../../components/CtaImageBand'
import styles from './page.module.css'

const VALUES = [
  { icon: ShieldCheck, title: 'Honest dealing', body: 'No hidden fees, no high-pressure tactics. Every car comes with full disclosure.' },
  { icon: Users,       title: 'Family-run',    body: 'A small Chesterfield team that gets to know every customer that walks through the door.' },
  { icon: Award,       title: 'Quality first',  body: 'We pick our stock carefully and prepare every car to retail standard before listing it.' },
  { icon: Wrench,      title: 'Backed afterwards', body: '3-month warranty as standard plus friendly after-sales support when you need it.' },
]

const TIMELINE = [
  { year: '300+', label: 'happy customers across Derbyshire and beyond' },
  { year: '500+', label: 'vehicles passed through the showroom' },
  { year: '125+', label: 'makes and models prepared, sold, and delivered' },
  { year: '6',     label: 'days a week the showroom is open for viewings' },
]

export function ChesterfieldAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Chesterfield Motor Empire'
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={<>A family-run dealership <span className={styles.heroAccent}>built on quality</span>.</>}
        lead={`${brandName} has been pairing buyers with the right used car for years from our showroom in Shuttlewood. Honest valuations, prepared stock, dealer-backed warranty.`}
        imageVar="var(--brand-image-about)"
      >
        <Link href="/used-cars" className={styles.heroCtaPrimary}>
          Browse stock
          <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </Link>
        <Link href="/contact" className={styles.heroCtaSecondary}>
          Visit the showroom
        </Link>
      </PageHero>

      <section className={styles.intro}>
        <div className={styles.introInner}>
          <div className={styles.introCopy} data-aos="fade-right">
            <p className={styles.eyebrow}>Our story</p>
            <h2 className={styles.heading}>
              We sell cars we&rsquo;d be happy to drive ourselves.
            </h2>
            <p className={styles.body}>
              {brandName} is a family-owned dealership in Shuttlewood, Chesterfield. We source our stock
              predominantly through main dealers and prepare each vehicle to a high retail standard.
            </p>
            <p className={styles.body}>
              Every car undergoes a full specialist health check before it lands on the forecourt — and
              we keep things straightforward all the way to handover. No hidden fees, no pressure, just
              honest dealer-backed advice.
            </p>
            <div className={styles.introMeta}>
              <span className={styles.metaItem}>
                <MapPin size={14} strokeWidth={2.4} aria-hidden="true" />
                Shuttlewood, Chesterfield, S44 6QX
              </span>
              <span className={styles.metaItem}>
                <Clock size={14} strokeWidth={2.4} aria-hidden="true" />
                Mon–Sat 09:00–16:30
              </span>
            </div>
          </div>
          <div className={styles.introImage} data-aos="fade-left">
            <div className={styles.imageFrame} style={{ backgroundImage: 'var(--brand-image-services)' }} aria-label={`${brandName} showroom`} role="img">
              <span className={styles.imageBracket} data-pos="tl" aria-hidden="true" />
              <span className={styles.imageBracket} data-pos="br" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.values} aria-labelledby="values-heading">
        <div className={styles.valuesInner}>
          <header className={styles.valuesHeader} data-aos="fade-up">
            <p className={styles.eyebrow}>What we stand for</p>
            <h2 id="values-heading" className={styles.heading}>
              Four things you can count on.
            </h2>
          </header>
          <ul className={styles.valuesGrid}>
            {VALUES.map((v, i) => {
              const Icon = v.icon
              return (
                <li
                  key={v.title}
                  className={styles.valueCard}
                  data-aos="fade-up"
                  data-aos-delay={String(i * 80)}
                >
                  <span className={styles.valueIcon} aria-hidden="true">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueBody}>{v.body}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className={styles.numbers} aria-labelledby="numbers-heading">
        <div className={styles.numbersInner}>
          <h2 id="numbers-heading" className={styles.numbersHeading} data-aos="fade-up">
            By the numbers
          </h2>
          <ul className={styles.numbersGrid}>
            {TIMELINE.map((t, i) => (
              <li
                key={t.year}
                className={styles.numberCard}
                data-aos="zoom-in"
                data-aos-delay={String(i * 80)}
              >
                <span className={styles.numberValue}>{t.year}</span>
                <span className={styles.numberLabel}>{t.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaImageBand variant="contact" />
    </>
  )
}

export default ChesterfieldAboutPage
