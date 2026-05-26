'use client'

import type { BrandConfig } from '@/brands/types'
import { SellYourCarWidget, DefaultInfoPanel } from '@/app/widgets/SellYourCarWidget'
import '@/app/widgets/SellYourCarWidget/styles.css'
import { getBrandContactInfo } from '../../lib/contact'

type Props = { brand: BrandConfig | null | undefined }

export default function SellYourCarMount({ brand }: Props) {
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Queensbury Cars'

  return (
    <SellYourCarWidget
      brandName={brandName}
      copy={{
        cardTitle: 'Get a guide trade-in price',
        cardSubtitle: 'Three quick steps. No obligation. We come back the same working day.',
        successHeading: 'Thanks — we have your details.',
        successBody: `${brandName} will be in touch within one working day with a confirmed figure.`,
      }}
      contact={{
        phoneDisplay: contact.phoneDisplay,
        phoneTel: contact.phoneTel,
        email: contact.email,
        whatsappUrl: contact.whatsappUrl,
      }}
      infoPanel={<DefaultInfoPanel brandName={brandName} />}
    />
  )
}
