import type { ThemePageProps } from '../../../types'
import ServiceMain from '../../components/ServiceMain'
import FAQSchema from '../../components/FAQSchema'

const serviceFaqItems = [
  {
    question: 'What does a full service include?',
    answer:
      'Our full service includes a multi-point inspection, fluids top-up, brake and tyre checks, parts condition report, and recommendations. We also provide an itemised invoice with any suggested repairs.',
  },
  {
    question: 'Do you offer courtesy cars?',
    answer:
      'Courtesy cars are available subject to availability. Please request one at the time of booking and we can reserve a small car for routine services.',
  },
  {
    question: 'How long does a typical service take?',
    answer:
      'Most standard services take between 1.5 and 3 hours depending on the vehicle and any additional work required. MOTs and larger repairs may take longer.',
  },
  {
    question: 'What warranty options do you offer?',
    answer:
      'We provide several warranty packages and extended coverage options. Visit our warranty page for plan details or contact our team for a personalised quote.',
  },
]

export function GildedServicesPage(_: ThemePageProps) {
  return (
    <main>
      <FAQSchema items={serviceFaqItems} />
      <ServiceMain />
    </main>
  )
}

export default GildedServicesPage
