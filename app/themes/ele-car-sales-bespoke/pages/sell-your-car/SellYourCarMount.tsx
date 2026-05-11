'use client'

import { SellYourCarWidget, DefaultInfoPanel } from '@/app/widgets/SellYourCarWidget'
import '@/app/widgets/SellYourCarWidget/styles.css'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'

/**
 * Client island that mounts the global SellYourCarWidget for the ELE theme.
 * Pulls the brand name + contact info from useBrand() so the widget's
 * default info panel and success-state contact CTAs render with the real
 * dealer values.
 */
export default function SellYourCarMount() {
  const brand = useBrand()
  const brandName = brand?.name || 'ELE Car Sales'
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
          cardTitle: 'Vehicle Valuation Request',
          cardSubtitle: `Three quick steps. Dealer-backed offer from ${brandName}.`,
          successHeading: 'Thanks — your details are on their way',
          successBody: `A member of the ${brandName} team will be in touch shortly with a confirmed offer.`,
        }}
      />
    </section>
  )
}
