'use client'

import { useState, type FormEvent } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
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

const CONDITION_OPTIONS = [
  { value: '', label: 'Select condition' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
]

const FINANCE_OPTIONS = [
  { value: '', label: 'Outstanding finance?' },
  { value: 'no', label: 'No finance outstanding' },
  { value: 'yes', label: 'Yes, finance outstanding' },
]

export default function PartExchangeFormIsland() {
  const form = useLeadsForm<Values>({
    initialValues: {
      name: '', email: '', phone: '',
      reg: '', mileage: '', condition: '', outstandingFinance: '', notes: '',
    },
    leadType: 'part-exchange',
    leadSource: 'part-exchange-page',
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (value) => (/\S+@\S+\.\S+/.test(String(value || '')) ? null : 'Please enter a valid email.'),
      },
      phone: { required: true },
      reg: { required: true },
      mileage: { required: true },
      condition: { required: true },
    },
  })

  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await form.submit()
    if (result.success) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className={styles.formCard}>
        <div className={styles.successBadge} role="status" aria-live="polite">
          <CheckCircle2 size={28} strokeWidth={2} aria-hidden="true" />
          <h3 className={styles.successHeading}>Valuation request received</h3>
          <p className={styles.successBody}>
            Thanks — the team is reviewing the details. You&rsquo;ll hear from us with a written figure within
            one working day.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
      <input type="text" {...form.honeypotProps} className={styles.honeypot} aria-hidden="true" tabIndex={-1} />

      <div className={styles.fieldsGrid}>
        <div className={styles.field}>
          <label htmlFor="px-name" className={styles.fieldLabel}>Full name</label>
          <input id="px-name" type="text" autoComplete="name" required aria-required="true"
            aria-invalid={Boolean(form.errors.name)} className={styles.input}
            {...form.getFieldProps('name')} />
          {form.errors.name ? <span className={styles.fieldError}>{form.errors.name}</span> : null}
        </div>
        <div className={styles.field}>
          <label htmlFor="px-email" className={styles.fieldLabel}>Email</label>
          <input id="px-email" type="email" autoComplete="email" required aria-required="true"
            aria-invalid={Boolean(form.errors.email)} className={styles.input}
            {...form.getFieldProps('email')} />
          {form.errors.email ? <span className={styles.fieldError}>{form.errors.email}</span> : null}
        </div>
        <div className={styles.field}>
          <label htmlFor="px-phone" className={styles.fieldLabel}>Phone</label>
          <input id="px-phone" type="tel" autoComplete="tel" required aria-required="true"
            aria-invalid={Boolean(form.errors.phone)} className={styles.input}
            {...form.getFieldProps('phone')} />
          {form.errors.phone ? <span className={styles.fieldError}>{form.errors.phone}</span> : null}
        </div>
        <div className={styles.field}>
          <label htmlFor="px-reg" className={styles.fieldLabel}>Registration</label>
          <input id="px-reg" type="text" required aria-required="true" placeholder="e.g. AB12 CDE"
            aria-invalid={Boolean(form.errors.reg)} className={styles.input}
            {...form.getFieldProps('reg')} />
          {form.errors.reg ? <span className={styles.fieldError}>{form.errors.reg}</span> : null}
        </div>
        <div className={styles.field}>
          <label htmlFor="px-mileage" className={styles.fieldLabel}>Current mileage</label>
          <input id="px-mileage" type="number" min="0" step="100" required aria-required="true"
            placeholder="e.g. 45000"
            aria-invalid={Boolean(form.errors.mileage)} className={styles.input}
            {...form.getFieldProps('mileage')} />
          {form.errors.mileage ? <span className={styles.fieldError}>{form.errors.mileage}</span> : null}
        </div>
        <div className={styles.field}>
          <label htmlFor="px-condition" className={styles.fieldLabel}>Condition</label>
          <select id="px-condition" required aria-required="true"
            aria-invalid={Boolean(form.errors.condition)} className={styles.input}
            {...form.getFieldProps('condition')}>
            {CONDITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''}>{opt.label}</option>
            ))}
          </select>
          {form.errors.condition ? <span className={styles.fieldError}>{form.errors.condition}</span> : null}
        </div>
        <div className={styles.field}>
          <label htmlFor="px-finance" className={styles.fieldLabel}>Outstanding finance</label>
          <select id="px-finance" className={styles.input} {...form.getFieldProps('outstandingFinance')}>
            {FINANCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label htmlFor="px-notes" className={styles.fieldLabel}>
            Notes <span className={styles.fieldOptional}>optional</span>
          </label>
          <textarea id="px-notes" rows={3} className={styles.textarea}
            placeholder="Service history, modifications, anything we should know."
            {...form.getFieldProps('notes')} />
        </div>
      </div>

      {form.status === 'error' && form.errorMessage ? (
        <p className={styles.formError} role="alert">{form.errorMessage}</p>
      ) : null}

      <button type="submit" className={`${styles.submit} mfx-shimmer`} disabled={form.status === 'submitting'}>
        {form.status === 'submitting' ? 'Sending…' : (
          <>
            Get my valuation
            <Send size={16} strokeWidth={2.4} aria-hidden="true" />
          </>
        )}
      </button>

      <p className={styles.formNote}>
        No obligation, no impact on credit. By submitting you agree to our{' '}
        <a className={styles.formNoteLink} href="/privacy-policy">privacy policy</a>.
      </p>
    </form>
  )
}
