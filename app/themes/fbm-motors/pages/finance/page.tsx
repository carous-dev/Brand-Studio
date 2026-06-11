import Link from 'next/link'
import { ShieldCheck, Clock, BadgePoundSterling, Search } from 'lucide-react'
import { resolveText } from '../../lib/brand-text'
import { getBrandContactInfo } from '../../lib/contact'
import { contactImage as defaultContact } from '../../lib/cars'
import LoanCalculatorClient from './LoanCalculatorClient'
import FaqAccordionClient, { type FaqItem } from './FaqAccordionClient'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const defaultFaqs: FaqItem[] = [
  {
    q: 'What warranty comes with your cars?',
    a: 'Every vehicle includes a minimum 3-month warranty and 12 months of AA Breakdown Cover at no extra cost. Extended warranty options are available on request.',
  },
  {
    q: 'Do you offer finance?',
    a: 'Yes — we work with reputable lenders to offer competitive financing matched to your budget. Use our Loan Calculator for an estimate, then our team will find you a tailored quote.',
  },
  {
    q: 'Can I part-exchange my current car?',
    a: 'Absolutely. Tell us about your car on the Sell Your Car page or bring it along — we give fair, honest valuations and handle all the paperwork.',
  },
  {
    q: 'Are your cars history-checked?',
    a: "Every car is HPI-checked and inspected before it goes on sale. We're transparent about each vehicle's history, mileage, and condition — just ask.",
  },
  {
    q: 'Can you hold or reserve a car for me?',
    a: 'Yes — a small refundable deposit reserves any vehicle while you arrange finance or a viewing. Reserved cars are clearly marked on the site.',
  },
]

export function FbmFinancePage({ brand }: ThemePageProps) {
  const contact = getBrandContactInfo(brand)
  const heroBg = brand.images?.finance || brand.heroImage || defaultContact
  const heroEyebrow = resolveText(brand, 'financeHeroEyebrow')
  const heroTitle = resolveText(brand, 'financeHeroTitle')
  const heroLead = resolveText(brand, 'financeHeroLead')
  const disclaimer = resolveText(brand, 'financeDisclaimer')

  const calcEyebrow = resolveText(brand, 'financeCalcEyebrow')
  const calcTitle = resolveText(brand, 'financeCalcTitle')
  const calcLead = resolveText(brand, 'financeCalcLead')

  const stat1Value = resolveText(brand, 'financeStat1Value')
  const stat1Label = resolveText(brand, 'financeStat1Label')
  const stat2Value = resolveText(brand, 'financeStat2Value')
  const stat2Label = resolveText(brand, 'financeStat2Label')
  const stat3Value = resolveText(brand, 'financeStat3Value')
  const stat3Label = resolveText(brand, 'financeStat3Label')
  const stat4Value = resolveText(brand, 'financeStat4Value')
  const stat4Label = resolveText(brand, 'financeStat4Label')

  const faqEyebrow = resolveText(brand, 'financeFaqEyebrow')
  const faqTitle = resolveText(brand, 'financeFaqTitle')
  const faqLead = resolveText(brand, 'financeFaqLead')

  const ctaEyebrow = resolveText(brand, 'financeCtaEyebrow')
  const ctaTitle = resolveText(brand, 'financeCtaTitle')
  const ctaLead = resolveText(brand, 'financeCtaLead')

  const brandFaqs: FaqItem[] = Array.isArray((brand as any)?.faq) && (brand as any).faq.length > 0
    ? (brand as any).faq
        .map((f: any) => ({ q: String(f?.question || ''), a: String(f?.answer || '') }))
        .filter((f: FaqItem) => f.q && f.a)
    : defaultFaqs

  const stats: Array<{ value: string; label: string; icon: 'shield' | 'clock' | 'pound' | 'search' }> = [
    { value: stat1Value, label: stat1Label, icon: 'pound' },
    { value: stat2Value, label: stat2Label, icon: 'clock' },
    { value: stat3Value, label: stat3Label, icon: 'shield' },
    { value: stat4Value, label: stat4Label, icon: 'search' },
  ]

  const renderStatIcon = (kind: 'shield' | 'clock' | 'pound' | 'search') => {
    if (kind === 'shield') return <ShieldCheck size={22} strokeWidth={1.6} />
    if (kind === 'clock') return <Clock size={22} strokeWidth={1.6} />
    if (kind === 'pound') return <BadgePoundSterling size={22} strokeWidth={1.6} />
    return <Search size={22} strokeWidth={1.6} />
  }

  return (
    <main>
      {/* ─── Hero — dark anchor ─── */}
      <section className={styles.hero} aria-label="Finance hero">
        {heroBg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroBg} alt="" className={styles.heroImage} />
        )}
        <div className={styles.heroWash} aria-hidden />
        <div className={styles.heroTint} aria-hidden />
        <div className={styles.heroInner}>
          {heroEyebrow && (
            <span className={`fbm-eyebrow ${styles.heroEyebrow} fbm-animate-rise`}>{heroEyebrow}</span>
          )}
          <h1 className={`${styles.heroTitle} fbm-animate-rise`} style={{ animationDelay: '100ms' }}>{heroTitle}</h1>
          {heroLead && (
            <p className={`${styles.heroLead} fbm-animate-rise`} style={{ animationDelay: '180ms' }}>{heroLead}</p>
          )}
        </div>
      </section>

      {/* ─── Calculator band ─── */}
      <section className={styles.calcBand}>
        <div className={styles.calcInner}>
          <div className={styles.calcHeading}>
            {calcEyebrow && <p className={`fbm-eyebrow ${styles.calcEyebrow}`}>{calcEyebrow}</p>}
            <h2 className={styles.calcTitle}>{calcTitle}</h2>
            {calcLead && <p className={styles.calcLead}>{calcLead}</p>}
          </div>

          <ul className={styles.statStrip}>
            {stats.map((s) => (
              <li key={s.label} className={styles.statItem}>
                <span className={styles.statIcon} aria-hidden>{renderStatIcon(s.icon)}</span>
                <div>
                  <p className={styles.statValue}>{s.value}</p>
                  <p className={styles.statLabel}>{s.label}</p>
                </div>
              </li>
            ))}
          </ul>

          <LoanCalculatorClient disclaimer={disclaimer} />
        </div>
      </section>

      {/* ─── FAQ band ─── */}
      {/* `id="faqs"` is load-bearing — the Header + Footer "FAQs" links point
       * at `/finance#faqs`. There's no dedicated `/faqs` route in
       * `ThemePageRegistry`. */}
      <section id="faqs" className={styles.faqBand}>
        <div className={styles.faqInner}>
          <div className={styles.faqHeading}>
            {faqEyebrow && <p className={`fbm-eyebrow ${styles.faqEyebrow}`}>{faqEyebrow}</p>}
            <h2 className={styles.faqTitle}>{faqTitle}</h2>
            {faqLead && <p className={styles.faqLead}>{faqLead}</p>}
          </div>
          <FaqAccordionClient faqs={brandFaqs} />
        </div>
      </section>

      {/* ─── CTA tail — brand-tinted dark ─── */}
      <section className={styles.ctaTail} aria-label="Ready to drive away">
        <div className={styles.ctaTint} aria-hidden />
        <div className={styles.ctaInner}>
          {ctaEyebrow && <p className={`fbm-eyebrow ${styles.ctaEyebrow}`}>{ctaEyebrow}</p>}
          <h2 className={styles.ctaTitle}>{ctaTitle}</h2>
          {ctaLead && <p className={styles.ctaLead}>{ctaLead}</p>}
          <div className={styles.ctaActions}>
            <Link href="/used-cars" className="fbm-btn-primary">Browse stock →</Link>
            {contact.phoneDisplay && (
              <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className="fbm-btn-ghost-dark">
                Call {contact.phoneDisplay}
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default FbmFinancePage
