'use client'

import { useState } from 'react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import styles from './page.module.css'

type Values = {
  name: string
  email: string
  phone: string
  topic: string
  message: string
}

const INITIAL: Values = { name: '', email: '', phone: '', topic: 'general', message: '' }

export default function KainContactForm() {
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState<string | null>(null)
  const form = useLeadsForm<Values>({
    initialValues: INITIAL,
    leadType: 'contact',
    leadSource: 'contact-page',
    fieldConfig: {
      name: { required: true },
      email: { required: true, validate: (v) => (v && /\S+@\S+\.\S+/.test(String(v)) ? null : 'Enter a valid email.') },
      phone: { required: true },
      message: { required: true },
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) {
      setConsentError('Please confirm consent to be contacted.')
      return
    }
    setConsentError(null)
    await form.submit()
  }

  if (form.status === 'success') {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        <h3>Message received</h3>
        <p>Thanks — the showroom team will get back to you within opening hours.</p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <input type="text" {...form.honeypotProps} tabIndex={-1} autoComplete="off" className={styles.honeypot} aria-hidden="true" />

      <div className={styles.formGrid}>
        <label className="kain-field">
          <span className="kain-field-label">Name</span>
          <input
            type="text"
            className="kain-input"
            name="name"
            value={form.values.name}
            onChange={(e) => form.setFieldValue('name', e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!form.errors.name}
          />
          {form.errors.name && <span className="kain-field-error">{form.errors.name}</span>}
        </label>

        <label className="kain-field">
          <span className="kain-field-label">Email</span>
          <input
            type="email"
            className="kain-input"
            name="email"
            value={form.values.email}
            onChange={(e) => form.setFieldValue('email', e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!form.errors.email}
            autoComplete="email"
          />
          {form.errors.email && <span className="kain-field-error">{form.errors.email}</span>}
        </label>

        <label className="kain-field">
          <span className="kain-field-label">Phone</span>
          <input
            type="tel"
            className="kain-input"
            name="phone"
            value={form.values.phone}
            onChange={(e) => form.setFieldValue('phone', e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!form.errors.phone}
            autoComplete="tel"
          />
          {form.errors.phone && <span className="kain-field-error">{form.errors.phone}</span>}
        </label>

        <label className="kain-field">
          <span className="kain-field-label">Reason</span>
          <select
            className="kain-select"
            name="topic"
            value={form.values.topic}
            onChange={(e) => form.setFieldValue('topic', e.target.value)}
          >
            <option value="general">General enquiry</option>
            <option value="viewing">Book a viewing</option>
            <option value="finance">Finance enquiry</option>
            <option value="part-exchange">Part exchange</option>
            <option value="sell">Selling my car</option>
            <option value="aftercare">After-sale support</option>
          </select>
        </label>
      </div>

      <label className="kain-field">
        <span className="kain-field-label">Message</span>
        <textarea
          className="kain-textarea"
          name="message"
          value={form.values.message}
          onChange={(e) => form.setFieldValue('message', e.target.value)}
          required
          aria-required="true"
          aria-invalid={!!form.errors.message}
        />
        {form.errors.message && <span className="kain-field-error">{form.errors.message}</span>}
      </label>

      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setConsentError(null) }}
          aria-required="true"
          aria-invalid={!!consentError}
        />
        <span>I’m happy to be contacted about my enquiry. I can opt out at any time.</span>
      </label>
      {consentError && <span className="kain-field-error">{consentError}</span>}

      {form.errorMessage && <p className={styles.errorBanner} role="alert">{form.errorMessage}</p>}

      <button type="submit" className="kain-btn kain-btn--primary mfx-shimmer" disabled={form.status === 'submitting'}>
        {form.status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
