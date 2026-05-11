import Link from 'next/link'
import { ArrowRight, Car, RefreshCw, Banknote, ShieldCheck, Search, Truck, Check } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CtaImageBand from '../../components/CtaImageBand'
import styles from './page.module.css'

const SERVICES = [
  {
    id: 'car-sales',
    icon: Car,
    title: 'Car sales',
    blurb: 'Privately sourced used vehicles, prepared to retail standard, ready to drive away.',
    bullets: [
      'Sourced predominantly through main dealers',
      'Full specialist health check before listing',
      'HPI and finance checks completed',
      'Comprehensive walk-around photography',
    ],
    href: '/used-cars',
    cta: 'Browse stock',
  },
  {
    id: 'part-exchange',
    icon: RefreshCw,
    title: 'Part exchange',
    blurb: 'Competitive part-exchange values for your current vehicle so the upgrade stays simple.',
    bullets: [
      'Honest valuation against current market data',
      'Roll your equity into your next car',
      'Outstanding finance settled on your behalf',
      'No-obligation written quote',
    ],
    href: '/part-exchange',
    cta: 'Get a part-ex valuation',
  },
  {
    id: 'finance',
    icon: Banknote,
    title: 'Finance options',
    blurb: 'Tailored finance packages with clear monthly figures, no jargon, before you commit.',
    bullets: [
      'Hire purchase &amp; PCP options',
      'Fixed monthly payments',
      'Soft search — no impact on your credit score',
      'Decision in principle before you visit',
    ],
    href: '/finance',
    cta: 'Apply for finance',
  },
  {
    id: 'after-sales',
    icon: ShieldCheck,
    title: 'After-sales support',
    blurb: 'Minimum 3-month comprehensive warranty as standard, with friendly support after handover.',
    bullets: [
      '3-month warranty included (unless stated)',
      'Extended warranty plans available',
      'Local independent garage referrals',
      'Direct line to the team for any concerns',
    ],
    href: '/contact',
    cta: 'Talk to us about warranty',
  },
  {
    id: 'inspection',
    icon: Search,
    title: 'Vehicle inspection',
    blurb: 'HPI &amp; finance checks plus full preparation so every car is ready for the road.',
    bullets: [
      'HPI check on every vehicle',
      'Outstanding finance verification',
      'Service-history documented',
      'Full valet before handover',
    ],
    href: '/contact',
    cta: 'Ask about a specific car',
  },
  {
    id: 'delivery',
    icon: Truck,
    title: 'Delivery service',
    blurb: 'Local collection support and practical handover for distance customers across the UK.',
    bullets: [
      'Nationwide delivery on request',
      'Trade plates &amp; insurance covered',
      'Train-station pickup arranged',
      'Pre-delivery video walk-around',
    ],
    href: '/contact',
    cta: 'Discuss delivery',
  },
]

export function ChesterfieldServicesPage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title={<>Complete used-car support — <span className={styles.heroAccent}>handover to handover</span>.</>}
        lead="From sourcing and preparation to finance, part exchange, and aftercare. Six services, one team in Chesterfield."
        imageVar="var(--brand-image-services)"
      />

      <section className={styles.list} aria-label="Our services">
        <div className={styles.listInner}>
          {SERVICES.map((s, i) => {
            const Icon = s.icon
            const reversed = i % 2 === 1
            return (
              <article
                key={s.id}
                id={s.id}
                className={`${styles.row} ${reversed ? styles.rowReversed : ''}`}
                data-aos="fade-up"
              >
                <div className={styles.rowMedia} aria-hidden="true">
                  <div className={styles.rowMediaInner}>
                    <span className={styles.rowMediaCorner} data-pos="tl" />
                    <span className={styles.rowMediaCorner} data-pos="br" />
                    <span className={styles.rowMediaIcon}>
                      <Icon size={48} strokeWidth={1.6} />
                    </span>
                    <span className={styles.rowMediaIndex}>0{i + 1}</span>
                  </div>
                </div>
                <div className={styles.rowCopy}>
                  <p className={styles.rowEyebrow}>Service · 0{i + 1}</p>
                  <h2 className={styles.rowTitle}>{s.title}</h2>
                  <p
                    className={styles.rowBlurb}
                    dangerouslySetInnerHTML={{ __html: s.blurb }}
                  />
                  <ul className={styles.rowBullets}>
                    {s.bullets.map((b, idx) => (
                      <li key={idx}>
                        <Check size={16} strokeWidth={2.4} aria-hidden="true" />
                        <span dangerouslySetInnerHTML={{ __html: b }} />
                      </li>
                    ))}
                  </ul>
                  <Link href={s.href} className={styles.rowCta}>
                    {s.cta}
                    <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <CtaImageBand variant="contact" />
    </>
  )
}

export default ChesterfieldServicesPage
