'use client'

import { useEffect } from 'react'

export type WhatsAppEnquiryIntent = {
  id: string
  label: string
  intro: string
}

export type WhatsAppEnquiryVehicle = {
  label?: string | null
  year?: string | number | null
  make?: string | null
  model?: string | null
  derivative?: string | null
  registration?: string | null
  vin?: string | null
  slug?: string | null
  price?: string | number | null
  mileage?: string | number | null
  fuel?: string | null
  transmission?: string | null
  bodyType?: string | null
  colour?: string | null
}

export type ExternalWhatsAppEnquirySubject = {
  dealerName: string
  phoneNumber?: string | null
  whatsappNumber?: string | null
  pageTitle?: string | null
  pageUrl?: string | null
  vehicle?: WhatsAppEnquiryVehicle | null
  quickActions?: WhatsAppEnquiryIntent[]
  defaultIntentId?: string | null
  defaultMessage?: string | null
  greeting?: string | null
  launcherLabel?: string | null
  panelTitle?: string | null
  panelDescription?: string | null
  accentColor?: string | null
  surfaceColor?: string | null
  textColor?: string | null
  borderColor?: string | null
  placement?: 'bottom-right' | 'bottom-left'
}

declare global {
  interface Window {
    CarousWhatsAppEnquiry?: {
      subject?: ExternalWhatsAppEnquirySubject | null
      setSubject?: (subject: ExternalWhatsAppEnquirySubject | null) => void
      [key: string]: unknown
    }
  }
}

type ExternalWhatsAppSubjectBridgeProps = {
  subject: ExternalWhatsAppEnquirySubject | null
}

export default function ExternalWhatsAppSubjectBridge({ subject }: ExternalWhatsAppSubjectBridgeProps) {
  useEffect(() => {
    window.CarousWhatsAppEnquiry = {
      ...(window.CarousWhatsAppEnquiry || {}),
      subject,
    }

    window.CarousWhatsAppEnquiry.setSubject?.(subject)

    return () => {
      window.CarousWhatsAppEnquiry = {
        ...(window.CarousWhatsAppEnquiry || {}),
        subject: null,
      }
      window.CarousWhatsAppEnquiry.setSubject?.(null)
    }
  }, [subject])

  return null
}
