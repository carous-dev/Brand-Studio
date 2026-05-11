'use client'

import { useEffect } from 'react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { isValidUkPhone } from '../../lib/uk-phone'
import styles from './page.module.css'

type ContactValues = {
  name: string
  email: string
  phone: string
  topic: string
  message: string
  url: string
}

const TOPICS = [
  'Vehicle enquiry',
  'Finance question',
  'Part-exchange valuation',
  'Selling my car',
  'Aftercare / service',
  'Something else',
]

export default function ContactFormIsland() {
  const form = useLeadsForm<ContactValues>({
    initialValues: { name: '', email: '', phone: '', topic: 'Vehicle enquiry', message: '', url: '' },
    leadType: 'contact-enquiry',
    leadSource: 'contact-us',
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (v) => (/\S+@\S+\.\S+/.test(String(v || '')) ? null : 'Enter a valid email address.'),
      },
      phone: {
        required: true,
        validate: (v) => (isValidUkPhone(v) ? null : 'Enter a valid UK phone number.'),
      },
      message: { required: true },
    },
    buildPayload: (values, meta) => ({
      name: values.name,
      email: values.email,
      phone: values.phone,
      topic: values.topic,
      subject: `Contact enquiry: ${values.topic || 'General'}`,
      message: values.message,
      url: values.url || (typeof window !== 'undefined' ? window.location.href : ''),
      leadType: 'contact-enquiry',
      leadSource: 'contact-us',
      formTs: meta.formTs,
      [meta.honeypotField]: meta.honeypotValue,
    }),
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && !form.values.url) {
      form.setFieldValue('url', window.location.href)
    }
  }, [form])

  const submitted = form.status === 'success'
  const submitting = form.status === 'submitting'
  const hasSubmitError = form.status === 'error' || form.status === 'rate-limited'

  return (
    <div className={styles.formCard}>
      <div className={styles.formCorner} aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      <header className={styles.formHead}>
        <p className={styles.formEyebrow}>
          <span className={styles.eyebrowDash} aria-hidden="true" />
          Send a message
        </p>
        <h2 className={styles.formHeading}>Tell us what you&apos;re after.</h2>
        <p className={styles.formLead}>
          We reply within one working day. Need an answer sooner? WhatsApp or
          call us from the directory below.
        </p>
      </header>

      {submitted ? (
        <div className={styles.successBox} role="status">
          <h3 className={styles.successHeading}>Message received.</h3>
          <p>A member of the team will be back in touch within one working day.</p>
        </div>
      ) : (
        <form
          className={styles.form}
          onSubmit={(e) => { e.preventDefault(); void form.submit() }}
          noValidate
        >
          <input
            type="text"
            {...form.honeypotProps}
            className={styles.honeypot}
            aria-hidden="true"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Full name</span>
              <input
                type="text"
                autoComplete="name"
                required
                aria-required="true"
                aria-invalid={Boolean(form.errors.name)}
                aria-describedby={form.errors.name ? 'auto-contact-name-error' : undefined}
                className={styles.input}
                {...form.getFieldProps('name')}
              />
              {form.errors.name ? <span id="auto-contact-name-error" className={styles.fieldError}>{form.errors.name}</span> : null}
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={Boolean(form.errors.email)}
                aria-describedby={form.errors.email ? 'auto-contact-email-error' : undefined}
                className={styles.input}
                {...form.getFieldProps('email')}
              />
              {form.errors.email ? <span id="auto-contact-email-error" className={styles.fieldError}>{form.errors.email}</span> : null}
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Phone</span>
              <input
                type="tel"
                autoComplete="tel"
                required
                aria-required="true"
                aria-invalid={Boolean(form.errors.phone)}
                aria-describedby={form.errors.phone ? 'auto-contact-phone-error' : undefined}
                className={styles.input}
                placeholder="07…"
                {...form.getFieldProps('phone')}
              />
              {form.errors.phone ? <span id="auto-contact-phone-error" className={styles.fieldError}>{form.errors.phone}</span> : null}
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>I&apos;m enquiring about</span>
              <select
                className={styles.input}
                {...form.getFieldProps('topic')}
              >
                {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>

          <label className={[styles.field, styles.fieldFull].join(' ')}>
            <span className={styles.fieldLabel}>Message</span>
            <textarea
              required
              aria-required="true"
              aria-invalid={Boolean(form.errors.message)}
              aria-describedby={form.errors.message ? 'auto-contact-msg-error' : undefined}
              className={[styles.input, styles.textarea].join(' ')}
              placeholder="What car you’re after, when you’d like to come down, anything else we should know…"
              rows={5}
              {...form.getFieldProps('message')}
            />
            {form.errors.message ? <span id="auto-contact-msg-error" className={styles.fieldError}>{form.errors.message}</span> : null}
          </label>

          {hasSubmitError ? (
            <p className={styles.submitError} role="alert">
              {form.errorMessage || 'Something went wrong sending your message. Please try again or call us directly.'}
            </p>
          ) : null}

          <div className={styles.submitRow}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send message'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
            <p className={styles.submitNote}>We never share your details. UK GDPR-compliant.</p>
          </div>
        </form>
      )}
    </div>
  )
}
