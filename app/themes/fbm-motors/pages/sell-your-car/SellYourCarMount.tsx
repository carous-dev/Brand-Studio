'use client'

import { SellYourCarWidget, DefaultInfoPanel } from '@/app/widgets/SellYourCarWidget'
import '@/app/widgets/SellYourCarWidget/styles.css'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'

export default function SellYourCarMount() {
  const brand = useBrand()
  const brandName = brand?.name || 'the showroom'
  const contact = getBrandContactInfo(brand)

  return (
    <SellYourCarWidget
      brandName={brandName}
      contact={{
        phoneTel: contact.phoneTel,
        phoneDisplay: contact.phoneDisplay,
        email: contact.email,
        whatsappUrl: contact.whatsappUrl,
      }}
      infoPanel={<DefaultInfoPanel brandName={brandName} />}
      copy={{
        cardTitle: 'Get a guide price',
        cardSubtitle: `Three steps and ${brandName} comes back with a number.`,
        successHeading: 'Thanks — your details are with us',
        successBody: `${brandName} will review your car and come back within 24 hours with a firm offer.`,
      }}
    />
  )
}
