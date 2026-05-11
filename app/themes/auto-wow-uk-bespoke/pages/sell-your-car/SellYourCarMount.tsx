'use client'

import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'
import { SellYourCarWidget, DefaultInfoPanel } from '@/app/widgets/SellYourCarWidget'
import '@/app/widgets/SellYourCarWidget/styles.css'
import styles from './page.module.css'

export default function SellYourCarMount() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'AUTOWOW UK LTD'

  return (
    <section className={`auto-section ${styles.section}`}>
      <div className="auto-container">
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
            cardTitle: 'Get your guide valuation',
            cardSubtitle: 'Quick reg lookup. Honest trade price. Same-day callback.',
            successHeading: 'Thanks &mdash; valuation request received.',
            successBody: `${brandName} will be in touch shortly to confirm pricing and next steps.`,
          }}
        />
      </div>
    </section>
  )
}
