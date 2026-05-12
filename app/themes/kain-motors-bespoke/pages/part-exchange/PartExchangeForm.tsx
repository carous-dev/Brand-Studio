'use client'

import { useState } from 'react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import styles from './page.module.css'

type Values = {
  name: string
  email: string
  phone: string
  reg: string
  mileage: string
  condition: string
  outstandingFinance: string
  notes: string
}

const INITIAL: Values = {
  name: '', email: '', phone: '', reg: '', mileage: '', condition: 'good',
  outstandingFinance: 'no', notes: '',
}

export default function PartExchangeForm() {
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState<string | null>(null)
  const form = useLeadsForm<Values>({
    initialValues: INITIAL,
    leadType: 'part-exchange',
    leadSource: 'part-exchange-page',
    fieldConfig: {
      name: { required: true },
      email: { required: true, validate: (v) => (v && /\S+@\S+\.\S+/.test(String(v)) ? null : 'Enter a valid email.') },
      phone: { required: true },
      reg: { required: true },
      mileage: { required: true, validate: (v) => (/^\d{1,7}$/.test(String(v).replace(/\D/g, '')) ? null : 'Enter mileage in miles.') },
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
        <h3>Quote request received</h3>
        <p>Thanks — we’ll come back with your guide figure within showroom hours.</p>
      </div>
    )
  }

  const setVal = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    form.setFieldValue(k, e.target.value)

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <input type="text" {...form.honeypotProps} tabIndex={-1} autoComplete="off" className={styles.honeypot} aria-hidden="true" />

      <div className={styles.formGrid}>
        <label className="kain-field">
          <span className="kain-field-label">Your name</span>
          <input type="text" className="kain-input" name="name" value={form.values.name} onChange={setVal('name')} required aria-required="true" aria-invalid={!!form.errors.name} />
          {form.errors.name && <span className="kain-field-error">{form.errors.name}</span>}
        </label>
        <label className="kain-field">
          <span className="kain-field-label">Email</span>
          <input type="email" className="kain-input" name="email" value={form.values.email} onChange={setVal('email')} required aria-required="true" aria-invalid={!!form.errors.email} autoComplete="email" />
          {form.errors.email && <span className="kain-field-error">{form.errors.email}</span>}
        </label>
        <label className="kain-field">
          <span className="kain-field-label">Phone</span>
          <input type="tel" className="kain-input" name="phone" value={form.values.phone} onChange={setVal('phone')} required aria-required="true" aria-invalid={!!form.errors.phone} autoComplete="tel" />
          {form.errors.phone && <span className="kain-field-error">{form.errors.phone}</span>}
        </label>
        <label className="kain-field">
          <span className="kain-field-label">Registration</span>
          <input type="text" className="kain-input" name="reg" value={form.values.reg} onChange={setVal('reg')} required aria-required="true" aria-invalid={!!form.errors.reg} placeholder="AB12 CDE" />
          {form.errors.reg && <span className="kain-field-error">{form.errors.reg}</span>}
        </label>
        <label className="kain-field">
          <span className="kain-field-label">Mileage</span>
          <input type="text" className="kain-input" inputMode="numeric" name="mileage" value={form.values.mileage} onChange={setVal('mileage')} required aria-required="true" aria-invalid={!!form.errors.mileage} placeholder="e.g. 48,500" />
          {form.errors.mileage && <span className="kain-field-error">{form.errors.mileage}</span>}
        </label>
        <label className="kain-field">
          <span className="kain-field-label">Condition</span>
          <select className="kain-select" name="condition" value={form.values.condition} onChange={setVal('condition')}>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </label>
        <label className="kain-field">
          <span className="kain-field-label">Outstanding finance?</span>
          <select className="kain-select" name="outstandingFinance" value={form.values.outstandingFinance} onChange={setVal('outstandingFinance')}>
            <option value="no">No</option>
            <option value="yes">Yes — please settle</option>
            <option value="not-sure">Not sure</option>
          </select>
        </label>
      </div>

      <label className="kain-field">
        <span className="kain-field-label">Anything else we should know?</span>
        <textarea className="kain-textarea" name="notes" value={form.values.notes} onChange={setVal('notes')} placeholder="Service history gaps, accident repairs, modifications, plate retention…" />
      </label>

      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setConsentError(null) }}
          aria-required="true"
          aria-invalid={!!consentError}
        />
        <span>I’m happy to be contacted with a guide figure and follow-up questions about my part exchange.</span>
      </label>
      {consentError && <span className="kain-field-error">{consentError}</span>}
      {form.errorMessage && <p className={styles.errorBanner} role="alert">{form.errorMessage}</p>}

      <button type="submit" className="kain-btn kain-btn--primary mfx-shimmer" disabled={form.status === 'submitting'}>
        {form.status === 'submitting' ? 'Sending…' : 'Request my quote'}
      </button>
    </form>
  )
}
