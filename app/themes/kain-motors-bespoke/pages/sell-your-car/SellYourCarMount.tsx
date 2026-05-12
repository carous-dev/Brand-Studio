'use client'

import {
  SellYourCarWidget,
  DefaultInfoPanel,
} from '@/app/widgets/SellYourCarWidget'
import '@/app/widgets/SellYourCarWidget/styles.css'
import { getBrandContactInfo } from '../../lib/contact'
import type { BrandConfig } from '@/brands/types'

type Props = { brand: BrandConfig | null | undefined }

export default function SellYourCarMount({ brand }: Props) {
  const brandName = brand?.name || 'Kain Motors'
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
      copy={{
        cardTitle: 'Get a guide price in 60 seconds',
        cardSubtitle:
          'Drop your registration and current mileage. We’ll generate a guide trade-price right away and confirm a firm offer at the Manchester showroom.',
        successHeading: 'Valuation request received',
        successBody:
          'Thanks — the team will be in touch within showroom hours to book the inspection slot and confirm the final figure.',
      }}
      infoPanel={<DefaultInfoPanel brandName={brandName} />}
    />
  )
}
