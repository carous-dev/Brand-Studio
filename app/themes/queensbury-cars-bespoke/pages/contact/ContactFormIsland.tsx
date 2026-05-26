'use client'

import { useState } from 'react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import styles from './ContactFormIsland.module.css'

type Values = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  website: string
}

export default function ContactFormIsland() {
  const form = useLeadsForm<Values>({
    initialValues: { name: '', email: '', phone: '', subject: '', message: '', website: '' },
    leadType: 'contact',
    leadSource: 'contact-page',
    honeypotField: 'website',
    fieldConfig: {
      name: { required: true },
      email: { required: true },
      message: { required: true },
    },
  })

  const [submittedOnce, setSubmittedOnce] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedOnce(true)
    await form.submit()
  }

  if (form.status === 'success') {
    return (
      <div className={styles.success} role="status">
        <h3 className={styles.successHead}>Thanks — message received.</h3>
        <p>We've sent your enquiry to the team. Expect a reply within one working day, often faster.</p>
        <button type="button" className="qb-btn qb-btn--ghost qb-btn--sm" onClick={() => form.reset()}>
          Send another
        </button>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>Your name *</span>
          <input
            type="text"
            value={form.values.name}
            onChange={(e) => form.setFieldValue('name', e.target.value)}
            aria-invalid={Boolean(submittedOnce && form.errors.name)}
            aria-required="true"
            autoComplete="name"
          />
          {submittedOnce && form.errors.name && (
            <span className={styles.error} role="alert">
              {form.errors.name}
            </span>
          )}
        </label>
        <label className={styles.field}>
          <span>Email *</span>
          <input
            type="email"
            value={form.values.email}
            onChange={(e) => form.setFieldValue('email', e.target.value)}
            aria-invalid={Boolean(submittedOnce && form.errors.email)}
            aria-required="true"
            autoComplete="email"
          />
          {submittedOnce && form.errors.email && (
            <span className={styles.error} role="alert">
              {form.errors.email}
            </span>
          )}
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Phone</span>
          <input
            type="tel"
            value={form.values.phone}
            onChange={(e) => form.setFieldValue('phone', e.target.value)}
            autoComplete="tel"
          />
        </label>
        <label className={styles.field}>
          <span>Subject</span>
          <input
            type="text"
            value={form.values.subject}
            onChange={(e) => form.setFieldValue('subject', e.target.value)}
            placeholder="e.g. 'About the 2020 Golf'"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span>Message *</span>
        <textarea
          rows={5}
          value={form.values.message}
          onChange={(e) => form.setFieldValue('message', e.target.value)}
          aria-invalid={Boolean(submittedOnce && form.errors.message)}
          aria-required="true"
        />
        {submittedOnce && form.errors.message && (
          <span className={styles.error} role="alert">
            {form.errors.message}
          </span>
        )}
      </label>

      {/* Honeypot — visually hidden */}
      <input
        type="text"
        name="website"
        value={form.values.website}
        onChange={(e) => form.setFieldValue('website', e.target.value)}
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className={styles.honeypot}
      />

      {form.status === 'error' && form.errorMessage && (
        <div className={styles.formError} role="alert">
          {form.errorMessage}
        </div>
      )}

      <button
        type="submit"
        className={`qb-btn qb-btn--gradient ${styles.submit}`}
        disabled={form.status === 'submitting'}
      >
        {form.status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
