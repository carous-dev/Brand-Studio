'use client'

import { SellYourCarWidget, DefaultInfoPanel } from '@/app/widgets/SellYourCarWidget'
import '@/app/widgets/SellYourCarWidget/styles.css'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'

export default function SellYourCarMount() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'our showroom'

  return (
    <section style={{ padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem) clamp(3rem, 6vw, 5rem)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <SellYourCarWidget
          brandName={brandName}
          contact={{
            phoneTel: contact.phoneTel,
            phoneDisplay: contact.phoneDisplay,
            email: contact.email,
            whatsappUrl: contact.whatsappUrl,
          }}
          copy={{
            cardTitle: 'Valuation in 60 seconds',
            cardSubtitle: 'Enter your reg + mileage. We support both cars and bikes.',
            successHeading: 'We\'ll be in touch',
            successBody: `Thanks — ${brandName} will text or call within 24 hours with a firm offer.`,
          }}
          infoPanel={<DefaultInfoPanel brandName={brandName} />}
        />
      </div>
    </section>
  )
}
