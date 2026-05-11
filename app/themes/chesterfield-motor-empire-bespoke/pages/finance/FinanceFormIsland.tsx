'use client'

import { useState, type FormEvent } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import styles from './page.module.css'

type Values = {
  name: string
  email: string
  phone: string
  budget: string
  deposit: string
  term: string
  vehicle: string
  notes: string
}

const TERM_OPTIONS = [
  { value: '', label: 'Select preferred term' },
  { value: '24', label: '24 months' },
  { value: '36', label: '36 months' },
  { value: '48', label: '48 months' },
  { value: '60', label: '60 months' },
]

export default function FinanceFormIsland() {
  const form = useLeadsForm<Values>({
    initialValues: {
      name: '', email: '', phone: '',
      budget: '', deposit: '', term: '', vehicle: '', notes: '',
    },
    leadType: 'finance',
    leadSource: 'finance-page',
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (value) => (/\S+@\S+\.\S+/.test(String(value || '')) ? null : 'Please enter a valid email.'),
      },
      phone: { required: true },
      budget: { required: true },
      term: { required: true },
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
          <h3 className={styles.successHeading}>Application received</h3>
          <p className={styles.successBody}>
            Thanks — we&rsquo;ll come back with a decision in principle, usually within 24 hours.
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
          <label htmlFor="fin-name" className={styles.fieldLabel}>Full name</label>
          <input id="fin-name" type="text" autoComplete="name" required aria-required="true"
            aria-invalid={Boolean(form.errors.name)} className={styles.input}
            {...form.getFieldProps('name')} />
          {form.errors.name ? <span className={styles.fieldError}>{form.errors.name}</span> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="fin-email" className={styles.fieldLabel}>Email</label>
          <input id="fin-email" type="email" autoComplete="email" required aria-required="true"
            aria-invalid={Boolean(form.errors.email)} className={styles.input}
            {...form.getFieldProps('email')} />
          {form.errors.email ? <span className={styles.fieldError}>{form.errors.email}</span> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="fin-phone" className={styles.fieldLabel}>Phone</label>
          <input id="fin-phone" type="tel" autoComplete="tel" required aria-required="true"
            aria-invalid={Boolean(form.errors.phone)} className={styles.input}
            {...form.getFieldProps('phone')} />
          {form.errors.phone ? <span className={styles.fieldError}>{form.errors.phone}</span> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="fin-vehicle" className={styles.fieldLabel}>Vehicle of interest</label>
          <input id="fin-vehicle" type="text" placeholder="e.g. Ford Fiesta or Audi A3"
            className={styles.input} {...form.getFieldProps('vehicle')} />
        </div>

        <div className={styles.field}>
          <label htmlFor="fin-budget" className={styles.fieldLabel}>Monthly budget (£)</label>
          <input id="fin-budget" type="number" min="50" step="10" required aria-required="true"
            placeholder="e.g. 250"
            aria-invalid={Boolean(form.errors.budget)} className={styles.input}
            {...form.getFieldProps('budget')} />
          {form.errors.budget ? <span className={styles.fieldError}>{form.errors.budget}</span> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="fin-deposit" className={styles.fieldLabel}>Deposit (£) <span className={styles.fieldOptional}>optional</span></label>
          <input id="fin-deposit" type="number" min="0" step="100" placeholder="e.g. 1000"
            className={styles.input} {...form.getFieldProps('deposit')} />
        </div>

        <div className={styles.field}>
          <label htmlFor="fin-term" className={styles.fieldLabel}>Preferred term</label>
          <select id="fin-term" required aria-required="true"
            aria-invalid={Boolean(form.errors.term)} className={styles.input}
            {...form.getFieldProps('term')}>
            {TERM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                {opt.label}
              </option>
            ))}
          </select>
          {form.errors.term ? <span className={styles.fieldError}>{form.errors.term}</span> : null}
        </div>

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label htmlFor="fin-notes" className={styles.fieldLabel}>
            Notes <span className={styles.fieldOptional}>optional</span>
          </label>
          <textarea id="fin-notes" rows={3} className={styles.textarea}
            placeholder="Anything we should know — part-exchange, finance preferences, etc."
            {...form.getFieldProps('notes')} />
        </div>
      </div>

      {form.status === 'error' && form.errorMessage ? (
        <p className={styles.formError} role="alert">{form.errorMessage}</p>
      ) : null}

      <button type="submit" className={`${styles.submit} mfx-shimmer`} disabled={form.status === 'submitting'}>
        {form.status === 'submitting' ? 'Sending…' : (
          <>
            Apply for finance
            <Send size={16} strokeWidth={2.4} aria-hidden="true" />
          </>
        )}
      </button>

      <p className={styles.formNote}>
        Soft credit search only. By submitting you agree to our{' '}
        <a className={styles.formNoteLink} href="/privacy-policy">privacy policy</a>.
      </p>
    </form>
  )
}
