'use client'

import { SellYourCarWidget, DefaultInfoPanel } from '@/app/widgets/SellYourCarWidget'
import '@/app/widgets/SellYourCarWidget/styles.css'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'

export default function SellYourCarMount() {
  const brand = useBrand()
  const brandName = brand?.name || 'AUTOWOW UK'
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
          whatsappUrl: contact.whatsappUrl || undefined,
        }}
        copy={{
          cardTitle: 'Vehicle valuation request',
          cardSubtitle: `Three quick steps. Dealer-backed offer from ${brandName}.`,
          successHeading: 'Thanks — your details are on their way',
          successBody: `A buyer from ${brandName} will be in touch shortly with a confirmed offer.`,
        }}
      />
    </section>
  )
}
