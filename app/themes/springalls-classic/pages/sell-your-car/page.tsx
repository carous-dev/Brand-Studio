"use client"

import { useEffect } from 'react'
import { ArrowUpRight, Car, FileCheck2, PoundSterling } from 'lucide-react'
import styles from './page.module.css'
import { useLeadsForm } from '../../../../hooks/useLeadsForm'
import { HeroBackdrop } from '../../components/HeroBackdrop'
import type { ThemePageProps } from '../../../types'

type SellMyCarFormValues = {
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
    description: 'Share the basics and any standout features. The more detail, the better the valuation.',
    icon: FileCheck2
  },
  {
    title: 'Receive a fair valuation',
    description: 'Our team reviews the details and gives you a transparent, market-informed offer.',
    icon: PoundSterling
  },
  {
    title: 'Choose next steps',
    description: 'Sell outright or part exchange toward your next vehicle in our stock.',
    icon: Car
  }
]


export function SpringallsSellYourCarPage(_props: ThemePageProps) {
  const leadsEndpoint = process.env.NEXT_PUBLIC_LEADS_API_URL || '/leads'
  const useExternalLeadApi = true

  const sellForm = useLeadsForm<SellMyCarFormValues>({
    initialValues: {
      name: '',
      email: '',
      registration: '',
      mileage: '',
      message: '',
      url: ''
    },
    endpoint: leadsEndpoint || '/leads',
    leadType: 'sell-my-car',
    leadSource: 'sell-my-car',
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
        subject: `Sell My Car Valuation: ${values.registration || 'New enquiry'}`,
        message: composedMessage,
        submittedDetails: submittedDetails.join('\n'),
        registration: values.registration,
        mileage: values.mileage,
        url: vehicleUrl,
        leadType: meta.leadType || 'sell-my-car',
        leadSource: meta.leadSource || 'sell-my-car',
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
    if (typeof window !== 'undefined' && !sellForm.values.url) {
      sellForm.setFieldValue('url', window.location.href)
    }
  }, [sellForm.setFieldValue, sellForm.values.url])

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <HeroBackdrop />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Sell My Car</p>
          <h1 className={styles.heroTitle}>A simple, transparent way to sell your car</h1>
          <p className={styles.heroLead}>
            Get a fair valuation and a smooth process. We handle the details so you can move on quickly.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How it works</h2>
            <p className={styles.sectionText}>Three straightforward steps to a completed sale.</p>
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
            <h2 className={styles.sectionTitle}>Get your valuation</h2>
            <p className={styles.sectionText}>Submit the details below and we will be in touch promptly.</p>
          </div>
          <form className={styles.form} onSubmit={sellForm.handleSubmit}>
            <input type="text" className={styles.honeypot} tabIndex={-1} aria-hidden="true" {...sellForm.honeypotProps} />
            <label className={styles.field}>
              <span>Full name</span>
              <input
                id="sell-name"
                type="text"
                placeholder="Your name"
                aria-invalid={Boolean(sellForm.errors.name)}
                {...sellForm.getFieldProps('name')}
              />
              {sellForm.errors.name ? <span className={styles.fieldError}>{sellForm.errors.name}</span> : null}
            </label>
            <label className={styles.field}>
              <span>Email address</span>
              <input
                id="sell-email"
                type="email"
                placeholder="you@email.com"
                aria-invalid={Boolean(sellForm.errors.email)}
                {...sellForm.getFieldProps('email')}
              />
              {sellForm.errors.email ? <span className={styles.fieldError}>{sellForm.errors.email}</span> : null}
            </label>
            <label className={styles.field}>
              <span>Registration</span>
              <input
                id="sell-registration"
                type="text"
                placeholder="AB12 CDE"
                aria-invalid={Boolean(sellForm.errors.registration)}
                {...sellForm.getFieldProps('registration')}
              />
              {sellForm.errors.registration ? (
                <span className={styles.fieldError}>{sellForm.errors.registration}</span>
              ) : null}
            </label>
            <label className={styles.field}>
              <span>Mileage</span>
              <input
                id="sell-mileage"
                type="text"
                placeholder="e.g. 45,000"
                aria-invalid={Boolean(sellForm.errors.mileage)}
                {...sellForm.getFieldProps('mileage')}
              />
              {sellForm.errors.mileage ? <span className={styles.fieldError}>{sellForm.errors.mileage}</span> : null}
            </label>
            <label className={styles.fieldWide}>
              <span>Tell us more</span>
              <textarea
                id="sell-message"
                placeholder="Service history, ownership, condition..."
                rows={4}
                aria-invalid={Boolean(sellForm.errors.message)}
                {...sellForm.getFieldProps('message')}
              />
              {sellForm.errors.message ? <span className={styles.fieldError}>{sellForm.errors.message}</span> : null}
            </label>
            <div className={styles.formActions}>
              <button type="submit" className={styles.formButton} disabled={sellForm.status === 'submitting'}>
                {sellForm.status === 'submitting' ? 'Sending...' : 'Request valuation'}
                <ArrowUpRight size={18} strokeWidth={2} />
              </button>
              {sellForm.status === 'success' ? (
                <span className={styles.formSuccess}>Thanks! We will be in touch shortly.</span>
              ) : null}
              {sellForm.status === 'error' || sellForm.status === 'rate-limited' ? (
                <span className={styles.formError}>
                  {sellForm.errorMessage || 'Something went wrong. Please try again.'}
                </span>
              ) : null}
            </div>
          </form>
        </div>
      </section>

    </main>
  )
}

export default SpringallsSellYourCarPage
