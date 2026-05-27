// Inlined from carous-platform/packages/hooks/src/useContactLeadForm.ts.
// Rewired to use the theme-local @carous/hooks shim at lib/use-leads-form.ts.
'use client'

import { useLeadsForm, type LeadFormErrors } from '../lib/use-leads-form'

type ContactLeadFormValues = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const CONTACT_LEAD_INITIAL_VALUES: ContactLeadFormValues = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'chcars24@yahoo.com'
const LEADS_ENDPOINT = process.env.NEXT_PUBLIC_LEADS_API_URL ?? '/api/send-lead-email'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useContactLeadForm() {
  return useLeadsForm<ContactLeadFormValues>({
    initialValues: CONTACT_LEAD_INITIAL_VALUES,
    endpoint: LEADS_ENDPOINT,
    leadType: 'contact-us',
    fieldConfig: {
      name: { required: true },
      email: { required: true },
      message: { required: true },
    },
    validate(values) {
      const errors: LeadFormErrors<ContactLeadFormValues> = {}
      if (!values.name.trim()) {
        errors.name = 'Please enter your full name.'
      }
      if (!values.email.trim()) {
        errors.email = 'Please enter an email address.'
      } else if (!EMAIL_REGEX.test(values.email)) {
        errors.email = 'Please enter a valid email address.'
      }
      if (!values.message.trim()) {
        errors.message = 'Please include a message so we know how to help.'
      }
      return errors
    },
    buildPayload(values, meta) {
      const messageParts: string[] = []
      if (values.subject.trim()) {
        messageParts.push(`Subject: ${values.subject.trim()}`)
      }
      if (values.message.trim()) {
        messageParts.push(values.message.trim())
      }

      return {
        leadData: {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone.trim(),
          message: messageParts.join('\n\n'),
          leadType: 'contact-us',
          permalink: typeof window === 'undefined' ? undefined : window.location.href,
          website: meta.honeypotValue,
        },
        recipientEmail: CONTACT_EMAIL,
      }
    },
  })
}
