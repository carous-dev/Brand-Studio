'use client'

import { useState } from 'react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import styles from './page.module.css'

type Values = {
  name: string
  email: string
  phone: string
  vehicleOfInterest: string
  productType: string
  deposit: string
  term: string
  employmentStatus: string
  monthlyIncome: string
}

const INITIAL: Values = {
  name: '', email: '', phone: '', vehicleOfInterest: '', productType: 'pcp',
  deposit: '', term: '48', employmentStatus: 'employed', monthlyIncome: '',
}

export default function FinanceForm() {
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState<string | null>(null)
  const form = useLeadsForm<Values>({
    initialValues: INITIAL,
    leadType: 'finance',
    leadSource: 'finance-page',
    fieldConfig: {
      name: { required: true },
      email: { required: true, validate: (v) => (v && /\S+@\S+\.\S+/.test(String(v)) ? null : 'Enter a valid email.') },
      phone: { required: true },
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) {
      setConsentError('Please confirm consent to a soft credit search.')
      return
    }
    setConsentError(null)
    await form.submit()
  }

  if (form.status === 'success') {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        <h3>Application received</h3>
        <p>Thanks — we’ll be in touch in showroom hours with lender options. No impact on your credit file.</p>
      </div>
    )
  }

  const setVal = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    form.setFieldValue(k, e.target.value)

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <input type="text" {...form.honeypotProps} tabIndex={-1} autoComplete="off" className={styles.honeypot} aria-hidden="true" />

      <div className={styles.formGrid}>
        <label className="kain-field">
          <span className="kain-field-label">Full name</span>
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
          <span className="kain-field-label">Vehicle of interest</span>
          <input type="text" className="kain-input" name="vehicleOfInterest" value={form.values.vehicleOfInterest} onChange={setVal('vehicleOfInterest')} placeholder="e.g. 2020 Audi A4 2.0 TDI" />
        </label>
        <label className="kain-field">
          <span className="kain-field-label">Product</span>
          <select className="kain-select" name="productType" value={form.values.productType} onChange={setVal('productType')}>
            <option value="pcp">Personal Contract Purchase (PCP)</option>
            <option value="hp">Hire Purchase (HP)</option>
            <option value="lease">Lease</option>
            <option value="not-sure">Not sure — guide me</option>
          </select>
        </label>
        <label className="kain-field">
          <span className="kain-field-label">Deposit</span>
          <input type="text" className="kain-input" inputMode="decimal" name="deposit" value={form.values.deposit} onChange={setVal('deposit')} placeholder="£" />
        </label>
        <label className="kain-field">
          <span className="kain-field-label">Term (months)</span>
          <select className="kain-select" name="term" value={form.values.term} onChange={setVal('term')}>
            <option value="24">24</option>
            <option value="36">36</option>
            <option value="48">48</option>
            <option value="60">60</option>
            <option value="72">72</option>
          </select>
        </label>
        <label className="kain-field">
          <span className="kain-field-label">Employment status</span>
          <select className="kain-select" name="employmentStatus" value={form.values.employmentStatus} onChange={setVal('employmentStatus')}>
            <option value="employed">Employed (PAYE)</option>
            <option value="self-employed">Self-employed</option>
            <option value="director">Company director</option>
            <option value="retired">Retired</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="kain-field">
          <span className="kain-field-label">Monthly income (£)</span>
          <input type="text" className="kain-input" inputMode="decimal" name="monthlyIncome" value={form.values.monthlyIncome} onChange={setVal('monthlyIncome')} placeholder="£" />
        </label>
      </div>

      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setConsentError(null) }}
          aria-required="true"
          aria-invalid={!!consentError}
        />
        <span>I agree to a soft credit search (no impact on my score) and consent to being contacted about finance options.</span>
      </label>
      {consentError && <span className="kain-field-error">{consentError}</span>}
      {form.errorMessage && <p className={styles.errorBanner} role="alert">{form.errorMessage}</p>}

      <button type="submit" className="kain-btn kain-btn--primary mfx-shimmer" disabled={form.status === 'submitting'}>
        {form.status === 'submitting' ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  )
}
