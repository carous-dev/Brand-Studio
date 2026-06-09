'use client'

import { DefaultInfoPanel, SellYourCarWidget } from '@/app/widgets/SellYourCarWidget'
import '@/app/widgets/SellYourCarWidget/styles.css'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './SellYourCarWidgetMount.module.css'

type Props = {
  source?: 'sell-your-car' | 'part-exchange'
}

export default function SellYourCarWidgetMount({ source = 'sell-your-car' }: Props) {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'this dealership'
  const isPartExchangeRoute = source === 'part-exchange'

  return (
    <section className={styles.wrap}>
      <SellYourCarWidget
        brandName={brandName}
        leadType="sell-your-car"
        leadSource={isPartExchangeRoute ? 'part-exchange-sell-your-car-page' : 'sell-your-car-page'}
        contact={{
          phoneTel: contact.phoneTel,
          phoneDisplay: contact.phoneDisplay,
          email: contact.email,
          whatsappUrl: contact.whatsappUrl,
        }}
        infoPanel={
          <DefaultInfoPanel
            brandName={brandName}
            heading="How the valuation works"
            intro="Enter the registration and mileage, then add a few condition details. The team reviews the vehicle and comes back with the next step."
            benefits={[
              'Free, no-obligation valuation request',
              'Vehicle lookup by registration and mileage',
              'Outstanding finance can be reviewed',
              'Handover or collection discussed with the team',
            ]}
          />
        }
        copy={{
          cardTitle: 'Get your guide valuation',
          cardSubtitle: 'Use the Carous sell-your-car widget to request a quick dealer-backed valuation.',
          identifyHeading: 'Start with your registration',
          identifyHint: 'Add your registration and current mileage so we can identify the vehicle.',
          identifyCta: 'Find my vehicle',
          valuationHeading: 'Review your guide valuation',
          valuationSubheading: 'The guide figure helps start the conversation. Final offers depend on condition, history and specification.',
          valuationDisclaimer: 'Guide only. A confirmed figure is provided after review by the dealership.',
          detailsHeading: 'Send your details',
          detailsSubheading: 'Tell us how to contact you and anything useful about condition, service history or finance.',
          detailsSubmitCta: 'Request my offer',
          successHeading: 'Thanks - your valuation request is in',
          successBody: `${brandName} will review your vehicle details and contact you with the next step.`,
          successCtaLabel: 'Need a quicker answer?',
        }}
      />
    </section>
  )
}
