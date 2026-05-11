'use client'

import { useEffect } from 'react'
import { useLeadsForm } from '../../../../hooks/useLeadsForm'
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
    initialValues: { name: '', email: '', phone: '', topic: 'Van enquiry', message: '', url: '' },
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
      <header className={styles.formHeader}>
        <p className={styles.formEyebrow}>Send a message</p>
        <h2 className={styles.formHeading}>We'll get back within one working day.</h2>
      </header>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault()
          void form.submit()
        }}
        noValidate
      >
        <input type="text" {...form.honeypotProps} className={styles.honeypot} aria-hidden="true" tabIndex={-1} />

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Full name</span>
          <input
            type="text"
            required
            aria-required="true"
            aria-invalid={Boolean(form.errors.name)}
            aria-describedby={form.errors.name ? 'name-error' : undefined}
            {...form.getFieldProps('name')}
          />
          {form.errors.name ? <span id="name-error" className={styles.fieldError}>{form.errors.name}</span> : null}
        </label>

        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <input
              type="email"
              required
              aria-required="true"
              aria-invalid={Boolean(form.errors.email)}
              aria-describedby={form.errors.email ? 'email-error' : undefined}
              {...form.getFieldProps('email')}
            />
            {form.errors.email ? <span id="email-error" className={styles.fieldError}>{form.errors.email}</span> : null}
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Phone</span>
            <input
              type="tel"
              required
              aria-required="true"
              aria-invalid={Boolean(form.errors.phone)}
              aria-describedby={form.errors.phone ? 'phone-error' : undefined}
              {...form.getFieldProps('phone')}
            />
            {form.errors.phone ? <span id="phone-error" className={styles.fieldError}>{form.errors.phone}</span> : null}
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>What can we help with?</span>
          <select {...form.getFieldProps('topic')}>
            <option value="Van enquiry">Van enquiry</option>
            <option value="Finance">Finance</option>
            <option value="Part exchange">Part exchange</option>
            <option value="Sell my van">Sell my van</option>
            <option value="Fleet enquiry">Fleet enquiry</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Message</span>
          <textarea
            rows={5}
            required
            aria-required="true"
            aria-invalid={Boolean(form.errors.message)}
            aria-describedby={form.errors.message ? 'msg-error' : undefined}
            {...form.getFieldProps('message')}
          />
          {form.errors.message ? <span id="msg-error" className={styles.fieldError}>{form.errors.message}</span> : null}
        </label>

        {form.errorMessage ? (
          <p className={styles.formStatus} role="alert">{form.errorMessage}</p>
        ) : null}
        {form.status === 'success' ? (
          <p className={`${styles.formStatus} ${styles.formStatusSuccess}`} role="status">
            Thanks — your message is on its way. We'll be in touch shortly.
          </p>
        ) : null}

        <button
          type="submit"
          className={`${styles.submit} mfx-shimmer`}
          disabled={form.status === 'submitting'}
        >
          {form.status === 'submitting' ? 'Sending…' : 'Send enquiry'}
        </button>
      </form>
    </div>
  )
}
