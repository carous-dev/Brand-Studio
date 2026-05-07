"use client"

import { useEffect } from 'react'
import { ArrowUpRight, Car, FileCheck2, PoundSterling } from 'lucide-react'
import styles from './page.module.css'
import { useLeadsForm } from '../../../../hooks/useLeadsForm'
import { HeroBackdrop } from '../../components/HeroBackdrop'
import type { ThemePageProps } from '../../../types'

type PartExchangeFormValues = {
  name: string
  email: string
  registration: string
  mileage: string
  message: string
  url: string
}

const STEPS = [
  {
    title: 'Tell us about your car',
    description: 'Share the basics and any standout features so we can value your part exchange accurately.',
    icon: FileCheck2
  },
  {
    title: 'Receive a part exchange offer',
    description: 'We review the details and provide a transparent value against your next vehicle.',
    icon: PoundSterling
  },
  {
    title: 'Upgrade smoothly',
    description: 'Apply the value to your next car and handle the paperwork in one visit.',
    icon: Car
  }
]

export function SpringallsPartExchangePage(_props: ThemePageProps) {
  const leadsEndpoint = process.env.NEXT_PUBLIC_LEADS_API_URL || '/leads'
  const useExternalLeadApi = true

  const partExchangeForm = useLeadsForm<PartExchangeFormValues>({
    initialValues: {
      name: '',
      email: '',
      registration: '',
      mileage: '',
      message: '',
      url: ''
    },
    endpoint: leadsEndpoint || '/leads',
    leadType: 'part-exchange',
    leadSource: 'part-exchange',
    honeypotField: 'website',
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (value) => (/\S+@\S+\.\S+/.test(String(value || '')) ? null : 'Please enter a valid email.')
      },
      registration: { required: true },
      mileage: { required: true },
      message: { required: true }
    },
    buildPayload: (values, meta) => {
      const vehicleUrl = values.url || (typeof window !== 'undefined' ? window.location.href : '')
      const submittedDetails = [
        `Registration: ${values.registration || 'Not provided'}`,
        `Mileage: ${values.mileage || 'Not provided'}`,
        `Vehicle URL: ${vehicleUrl || 'Not provided'}`
      ]
      const composedMessage = values.message.trim() || 'No additional message provided.'
      const payload = {
        name: values.name,
        email: values.email,
        subject: `Part Exchange Enquiry: ${values.registration || 'New enquiry'}`,
        message: composedMessage,
        submittedDetails: submittedDetails.join('\n'),
        registration: values.registration,
        mileage: values.mileage,
        url: vehicleUrl,
        leadType: meta.leadType || 'part-exchange',
        leadSource: meta.leadSource || 'part-exchange',
        formTs: meta.formTs,
        recaptchaToken: meta.recaptchaToken,
        [meta.honeypotField]: meta.honeypotValue
      }

      if (useExternalLeadApi) {
        return payload
      }

      return { leadData: payload }
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && !partExchangeForm.values.url) {
      partExchangeForm.setFieldValue('url', window.location.href)
    }
  }, [partExchangeForm.setFieldValue, partExchangeForm.values.url])

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <HeroBackdrop />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Part Exchange</p>
          <h1 className={styles.heroTitle}>Upgrade with a fair part exchange valuation</h1>
          <p className={styles.heroLead}>
            Tell us about your current car and the vehicle you want. We will put together a clear offer you can use
            immediately.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How it works</h2>
            <p className={styles.sectionText}>Three straightforward steps to your next vehicle.</p>
          </div>
          <div className={styles.stepGrid}>
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <article key={step.title} className={styles.stepCard}>
                  <div className={styles.stepIcon} aria-hidden="true">
                    <Icon size={24} strokeWidth={1.8} />
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Request a part exchange valuation</h2>
            <p className={styles.sectionText}>Share your details and we will confirm your valuation promptly.</p>
          </div>
          <form className={styles.form} onSubmit={partExchangeForm.handleSubmit}>
            <input type="text" className={styles.honeypot} tabIndex={-1} aria-hidden="true" {...partExchangeForm.honeypotProps} />
            <label className={styles.field}>
              <span>Full name</span>
              <input
                id="part-exchange-name"
                type="text"
                placeholder="Your name"
                aria-invalid={Boolean(partExchangeForm.errors.name)}
                {...partExchangeForm.getFieldProps('name')}
              />
              {partExchangeForm.errors.name ? (
                <span className={styles.fieldError}>{partExchangeForm.errors.name}</span>
              ) : null}
            </label>
            <label className={styles.field}>
              <span>Email address</span>
              <input
                id="part-exchange-email"
                type="email"
                placeholder="you@email.com"
                aria-invalid={Boolean(partExchangeForm.errors.email)}
                {...partExchangeForm.getFieldProps('email')}
              />
              {partExchangeForm.errors.email ? (
                <span className={styles.fieldError}>{partExchangeForm.errors.email}</span>
              ) : null}
            </label>
            <label className={styles.field}>
              <span>Registration</span>
              <input
                id="part-exchange-registration"
                type="text"
                placeholder="AB12 CDE"
                aria-invalid={Boolean(partExchangeForm.errors.registration)}
                {...partExchangeForm.getFieldProps('registration')}
              />
              {partExchangeForm.errors.registration ? (
                <span className={styles.fieldError}>{partExchangeForm.errors.registration}</span>
              ) : null}
            </label>
            <label className={styles.field}>
              <span>Mileage</span>
              <input
                id="part-exchange-mileage"
                type="text"
                placeholder="e.g. 45,000"
                aria-invalid={Boolean(partExchangeForm.errors.mileage)}
                {...partExchangeForm.getFieldProps('mileage')}
              />
              {partExchangeForm.errors.mileage ? (
                <span className={styles.fieldError}>{partExchangeForm.errors.mileage}</span>
              ) : null}
            </label>
            <label className={styles.fieldWide}>
              <span>Tell us more</span>
              <textarea
                id="part-exchange-message"
                placeholder="Service history, condition, and the vehicle you want..."
                rows={4}
                aria-invalid={Boolean(partExchangeForm.errors.message)}
                {...partExchangeForm.getFieldProps('message')}
              />
              {partExchangeForm.errors.message ? (
                <span className={styles.fieldError}>{partExchangeForm.errors.message}</span>
              ) : null}
            </label>
            <div className={styles.formActions}>
              <button type="submit" className={styles.formButton} disabled={partExchangeForm.status === 'submitting'}>
                {partExchangeForm.status === 'submitting' ? 'Sending...' : 'Request valuation'}
                <ArrowUpRight size={18} strokeWidth={2} />
              </button>
              {partExchangeForm.status === 'success' ? (
                <span className={styles.formSuccess}>Thanks! We will be in touch shortly.</span>
              ) : null}
              {partExchangeForm.status === 'error' || partExchangeForm.status === 'rate-limited' ? (
                <span className={styles.formError}>
                  {partExchangeForm.errorMessage || 'Something went wrong. Please try again.'}
                </span>
              ) : null}
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

export default SpringallsPartExchangePage
