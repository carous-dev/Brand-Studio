'use client'

import { FormEvent } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { useBrand } from '../../context/BrandClientWrapper'
import { isValidUkPhone } from '../../lib/uk-phone'
import styles from './ContactIsland.module.css'

type FormValues = { name: string; email: string; phone: string; message: string; consent: boolean }
const INITIAL: FormValues = { name: '', email: '', phone: '', message: '', consent: false }

export default function ContactIsland() {
  const brand = useBrand()
  const brandName = brand?.name || 'the showroom'

  const form = useLeadsForm<FormValues>({
    initialValues: INITIAL,
    leadType: 'contact',
    leadSource: 'contact-page',
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (value) => {
          const v = String(value || '').trim()
          if (!v) return 'Please enter your email.'
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email.'
          return null
        },
      },
      phone: {
        required: true,
        validate: (value) => {
          const v = String(value || '').trim()
          if (!v) return 'Please enter your phone number.'
          if (!isValidUkPhone(v)) return 'Please enter a UK phone number.'
          return null
        },
      },
      message: { required: true },
      consent: { required: true, validate: (value) => (value ? null : 'Please tick to confirm.') },
    },
  })

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await form.submitValues()
  }

  if (form.status === 'success') {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        <Check size={32} strokeWidth={2} aria-hidden="true" />
        <h2>Message received</h2>
        <p>
          Thanks — {brandName} will reply by the end of the working day. If
          it&apos;s urgent, give us a call.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      <header className={styles.header}>
        <span className={styles.eyebrow}>{'> '}send-a-message</span>
        <h2 className={styles.title}>Drop us a line</h2>
        <p className={styles.lead}>
          Tell us a bit about what you&apos;re looking for. We&apos;ll reply by email
          or call you back.
        </p>
      </header>

      <input type="text" tabIndex={-1} className={styles.honeypot} aria-hidden="true" {...form.honeypotProps} />

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Name</span>
          <input type="text" autoComplete="name" required aria-required="true" aria-invalid={form.errors.name ? 'true' : undefined} {...form.getFieldProps('name')} />
          {form.errors.name ? <span className={styles.fieldError}>{form.errors.name}</span> : null}
        </label>
        <label className={styles.field}>
          <span>Phone</span>
          <input type="tel" autoComplete="tel" required aria-required="true" aria-invalid={form.errors.phone ? 'true' : undefined} {...form.getFieldProps('phone')} />
          {form.errors.phone ? <span className={styles.fieldError}>{form.errors.phone}</span> : null}
        </label>
      </div>

      <label className={styles.field}>
        <span>Email</span>
        <input type="email" autoComplete="email" required aria-required="true" aria-invalid={form.errors.email ? 'true' : undefined} {...form.getFieldProps('email')} />
        {form.errors.email ? <span className={styles.fieldError}>{form.errors.email}</span> : null}
      </label>

      <label className={styles.field}>
        <span>Message</span>
        <textarea rows={5} required aria-required="true" aria-invalid={form.errors.message ? 'true' : undefined} {...form.getFieldProps('message')} />
        {form.errors.message ? <span className={styles.fieldError}>{form.errors.message}</span> : null}
      </label>

      <label className={styles.checkbox}>
        <input type="checkbox" required aria-required="true" checked={Boolean(form.values.consent)} onChange={(e) => form.setFieldValue('consent', e.target.checked as any)} />
        <span>I&apos;m happy for {brandName} to contact me about my enquiry.</span>
      </label>
      {form.errors.consent ? <span className={styles.fieldError}>{form.errors.consent}</span> : null}

      {form.status === 'error' ? (
        <div role="alert" className={styles.alert}>
          {form.errorMessage || 'Something went wrong. Please try again or call us.'}
        </div>
      ) : null}
      {form.status === 'rate-limited' ? (
        <div role="alert" className={styles.alert}>Too many submissions — please wait a moment.</div>
      ) : null}

      <button type="submit" className={`axis-btn axis-btn--primary ${styles.submit}`} disabled={form.status === 'submitting'}>
        {form.status === 'submitting' ? 'Sending...' : 'Send message'}
        <ArrowRight size={18} strokeWidth={2} />
      </button>
    </form>
  )
}
