'use client'

import { useState, type FormEvent } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import styles from './page.module.css'

type Values = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

type Props = {
  brandName?: string
}

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select a subject' },
  { value: 'general', label: 'General enquiry' },
  { value: 'vehicle', label: 'Vehicle enquiry' },
  { value: 'finance', label: 'Finance' },
  { value: 'part-exchange', label: 'Part exchange' },
  { value: 'sell-my-car', label: 'Sell my car' },
  { value: 'after-sales', label: 'After-sales support' },
]

export default function ContactFormIsland({ brandName = 'us' }: Props) {
  const form = useLeadsForm<Values>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
    leadType: 'contact',
    leadSource: 'contact-page',
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (value) => (/\S+@\S+\.\S+/.test(String(value || '')) ? null : 'Please enter a valid email.'),
      },
      phone: { required: true },
      subject: { required: true },
      message: { required: true },
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
          <h2 className={styles.successHeading}>Message received</h2>
          <p className={styles.successBody}>
            Thanks for getting in touch with {brandName}. The team will reply during opening hours.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
      <header className={styles.formHeader}>
        <p className={styles.formEyebrow}>Send a message</p>
        <h2 className={styles.formHeading}>How can we help?</h2>
      </header>

      <input type="text" {...form.honeypotProps} className={styles.honeypot} aria-hidden="true" tabIndex={-1} />

      <div className={styles.fieldsGrid}>
        <div className={styles.field}>
          <label htmlFor="contact-name" className={styles.fieldLabel}>
            Full name
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={Boolean(form.errors.name)}
            className={styles.input}
            {...form.getFieldProps('name')}
          />
          {form.errors.name ? <span className={styles.fieldError}>{form.errors.name}</span> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-email" className={styles.fieldLabel}>
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={Boolean(form.errors.email)}
            className={styles.input}
            {...form.getFieldProps('email')}
          />
          {form.errors.email ? <span className={styles.fieldError}>{form.errors.email}</span> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-phone" className={styles.fieldLabel}>
            Phone
          </label>
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            required
            aria-required="true"
            aria-invalid={Boolean(form.errors.phone)}
            className={styles.input}
            {...form.getFieldProps('phone')}
          />
          {form.errors.phone ? <span className={styles.fieldError}>{form.errors.phone}</span> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-subject" className={styles.fieldLabel}>
            Subject
          </label>
          <select
            id="contact-subject"
            required
            aria-required="true"
            aria-invalid={Boolean(form.errors.subject)}
            className={styles.input}
            {...form.getFieldProps('subject')}
          >
            {SUBJECT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                {opt.label}
              </option>
            ))}
          </select>
          {form.errors.subject ? <span className={styles.fieldError}>{form.errors.subject}</span> : null}
        </div>

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label htmlFor="contact-message" className={styles.fieldLabel}>
            Message
          </label>
          <textarea
            id="contact-message"
            rows={5}
            required
            aria-required="true"
            aria-invalid={Boolean(form.errors.message)}
            className={styles.textarea}
            placeholder="Tell us what you're after — make/model, budget, finance need, anything we should know."
            {...form.getFieldProps('message')}
          />
          {form.errors.message ? <span className={styles.fieldError}>{form.errors.message}</span> : null}
        </div>
      </div>

      {form.status === 'error' && form.errorMessage ? (
        <p className={styles.formError} role="alert">{form.errorMessage}</p>
      ) : null}

      <button type="submit" className={`${styles.submit} mfx-shimmer`} disabled={form.status === 'submitting'}>
        {form.status === 'submitting' ? 'Sending…' : (
          <>
            Send message
            <Send size={16} strokeWidth={2.4} aria-hidden="true" />
          </>
        )}
      </button>

      <p className={styles.formNote}>
        We typically reply within minutes during showroom hours. By submitting you agree to our{' '}
        <a className={styles.formNoteLink} href="/privacy-policy">privacy policy</a>.
      </p>
    </form>
  )
}
