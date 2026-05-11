'use client'

import { SellYourCarWidget, DefaultInfoPanel } from '@/app/widgets/SellYourCarWidget'
import '@/app/widgets/SellYourCarWidget/styles.css'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'

export default function SellYourCarMount() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Chesterfield Motor Empire'

  return (
    <SellYourCarWidget
      copy={{
        cardTitle: 'Get your free dealer valuation',
        cardSubtitle: 'Three steps. No obligation. Decision within 24 hours from the Chesterfield team.',
        successHeading: 'Thanks — your valuation request is in',
        successBody: `Our team is reviewing your details and will be in touch shortly with a confirmed offer from ${brandName}.`,
      }}
      contact={{
        phoneTel: contact.phoneTel,
        phoneDisplay: contact.phoneDisplay,
        email: contact.email,
        whatsappUrl: contact.whatsappUrl,
      }}
      infoPanel={
        <DefaultInfoPanel
          brandName={brandName}
          benefitsHeading={`Why sell to ${brandName}?`}
          benefits={[
            'Family-run team with no high-pressure sales',
            'Honest dealer-backed valuation',
            'Outstanding finance settled on your behalf',
            'Same-day handover when ready',
          ]}
        />
      }
    />
  )
}
