'use client'

import { SellYourCarWidget, DefaultInfoPanel } from '@/app/widgets/SellYourCarWidget'
import '@/app/widgets/SellYourCarWidget/styles.css'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'

export default function SellYourCarMount() {
  const brand = useBrand()
  const brandName = brand?.name || 'Our showroom'
  const contact = getBrandContactInfo(brand)

  return (
    <section id="sellForm" className="sycw-app-mount">
      <SellYourCarWidget
        brandName={brandName}
        infoPanel={<DefaultInfoPanel brandName={brandName} />}
        contact={{
          phoneTel: contact.phoneTel || undefined,
          phoneDisplay: contact.phoneDisplay || undefined,
          email: contact.email || undefined,
        }}
        copy={{
          cardTitle: 'Vehicle Valuation Request',
          cardSubtitle: `Three quick steps. Dealer-backed offer from ${brandName}.`,
          successHeading: 'Thanks — your details are on their way',
          successBody: `A member of the ${brandName} team will be in touch shortly with a confirmed offer.`,
        }}
      />
    </section>
  )
}
