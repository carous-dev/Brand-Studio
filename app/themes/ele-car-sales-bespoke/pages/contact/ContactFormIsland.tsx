'use client'

import { useEffect } from 'react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { isValidUkPhone } from '../../lib/uk-phone'
import styles from './page.module.css'

type ContactFormValues = {
  name: string
  email: string
  phone: string
  topic: string
  message: string
  url: string
}

export default function ContactFormIsland() {
  const form = useLeadsForm<ContactFormValues>({
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

  return (
    <div className={styles.formWrap}>
      <header className={styles.formHead}>
        <p className={styles.formEyebrow}>Send a message</p>
        <h2 className={styles.formHeading}>We&apos;ll reply within one working day.</h2>
      </header>

      <form
        className={styles.form}
        onSubmit={(e) => { e.preventDefault(); void form.submit() }}
        noValidate
      >
        <input type="text" {...form.honeypotProps} className={styles.honeypot} aria-hidden="true" tabIndex={-1} autoComplete="off" />

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Full name</span>
            <input
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={Boolean(form.errors.name)}
              aria-describedby={form.errors.name ? 'ele-contact-name-error' : undefined}
              className={styles.input}
              {...form.getFieldProps('name')}
            />
            {form.errors.name ? <span id="ele-contact-name-error" className={styles.fieldError}>{form.errors.name}</span> : null}
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Email address</span>
            <input
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={Boolean(form.errors.email)}
              aria-describedby={form.errors.email ? 'ele-contact-email-error' : undefined}
              className={styles.input}
              {...form.getFieldProps('email')}
            />
            {form.errors.email ? <span id="ele-contact-email-error" className={styles.fieldError}>{form.errors.email}</span> : null}
          </label>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>UK phone</span>
            <input
              type="tel"
              autoComplete="tel"
              required
              aria-required="true"
              aria-invalid={Boolean(form.errors.phone)}
              aria-describedby={form.errors.phone ? 'ele-contact-phone-error' : undefined}
              className={styles.input}
              {...form.getFieldProps('phone')}
            />
            {form.errors.phone ? <span id="ele-contact-phone-error" className={styles.fieldError}>{form.errors.phone}</span> : null}
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>What can we help with?</span>
            <select className={styles.input} {...form.getFieldProps('topic')}>
              <option value="Vehicle enquiry">Vehicle enquiry</option>
              <option value="Finance">Finance</option>
              <option value="Part exchange">Part exchange</option>
              <option value="Sell my car">Sell my car</option>
              <option value="Delivery">Nationwide delivery</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Your message</span>
          <textarea
            rows={5}
            required
            aria-required="true"
            aria-invalid={Boolean(form.errors.message)}
            aria-describedby={form.errors.message ? 'ele-contact-message-error' : undefined}
            className={styles.textarea}
            {...form.getFieldProps('message')}
          />
          {form.errors.message ? <span id="ele-contact-message-error" className={styles.fieldError}>{form.errors.message}</span> : null}
        </label>

        {form.errorMessage ? (
          <p className={styles.formStatus} role="alert">{form.errorMessage}</p>
        ) : null}
        {form.status === 'success' ? (
          <p className={`${styles.formStatus} ${styles.formStatusSuccess}`} role="status">
            Thanks — your message is on its way. We&apos;ll be in touch shortly.
          </p>
        ) : null}

        <button
          type="submit"
          className={styles.submit}
          disabled={form.status === 'submitting'}
        >
          {form.status === 'submitting' ? 'Sending…' : 'Send enquiry'}
        </button>
      </form>
    </div>
  )
}
