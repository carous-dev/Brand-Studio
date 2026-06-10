import { resolveText } from '../../lib/brand-text'
import { PageHero } from '../../components/PageHero'
import { contactImage as defaultContact } from '../../lib/cars'
import LoanCalculatorClient from './LoanCalculatorClient'
import FaqAccordionClient, { type FaqItem } from './FaqAccordionClient'
import type { ThemePageProps } from '../../../types'

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
  const heroBg = brand.images?.finance || brand.heroImage || defaultContact
  const heroTitle = resolveText(brand, 'financeHeroTitle')
  const heroLead = resolveText(brand, 'financeHeroLead')
  const disclaimer = resolveText(brand, 'financeDisclaimer')

  const brandFaqs: FaqItem[] = Array.isArray((brand as any)?.faq) && (brand as any).faq.length > 0
    ? (brand as any).faq
        .map((f: any) => ({ q: String(f?.question || ''), a: String(f?.answer || '') }))
        .filter((f: FaqItem) => f.q && f.a)
    : defaultFaqs

  return (
    <>
      <PageHero image={heroBg} title={heroTitle} lead={heroLead} />
      <LoanCalculatorClient disclaimer={disclaimer} />
      <FaqAccordionClient faqs={brandFaqs} />
    </>
  )
}

export default FbmFinancePage
