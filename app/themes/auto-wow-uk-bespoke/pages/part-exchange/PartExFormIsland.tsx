'use client'

import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { isValidUkPhone } from '../../lib/uk-phone'
import styles from './page.module.css'

type PartExValues = {
  name: string
  email: string
  phone: string
  reg: string
  mileage: string
  notes: string
}

export default function PartExFormIsland() {
  const form = useLeadsForm<PartExValues>({
    initialValues: { name: '', email: '', phone: '', reg: '', mileage: '', notes: '' },
    leadType: 'part-exchange',
    leadSource: 'part-exchange-page',
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
      reg: {
        required: true,
        validate: (v) => (String(v || '').replace(/\s+/g, '').length >= 5 ? null : 'Enter your registration plate.'),
      },
      mileage: { required: true },
    },
    buildPayload: (values, meta) => ({
      ...values,
      reg: String(values.reg || '').replace(/\s+/g, '').toUpperCase(),
      subject: `Part-exchange valuation — ${String(values.reg || '').toUpperCase()}`,
      leadType: 'part-exchange',
      leadSource: 'part-exchange-page',
      formTs: meta.formTs,
      [meta.honeypotField]: meta.honeypotValue,
    }),
  })

  const submitted = form.status === 'success'
  const submitting = form.status === 'submitting'
  const hasSubmitError = form.status === 'error' || form.status === 'rate-limited'

  return (
    <div className={styles.formCard} data-aos="fade-up">
      <div className={styles.formCorner} aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      <header className={styles.formHead}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDash} aria-hidden="true" />
          Request valuation
        </p>
        <h2 className={styles.formHeading}>Get a written quote.</h2>
        <p className={styles.formLead}>
          Pop your reg, mileage and contact details in. We&apos;ll come back
          with a firm offer within one working day.
        </p>
      </header>

      {submitted ? (
        <div className={styles.successBox} role="status">
          <h3 className={styles.successHeading}>Valuation request received.</h3>
          <p>One of our buyers will be in touch within one working day with your written offer.</p>
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
              <span className={styles.fieldLabel}>Registration</span>
              <input type="text" autoComplete="off" required aria-required="true" aria-invalid={Boolean(form.errors.reg)}
                className={[styles.input, styles.reg].join(' ')} placeholder="AB12 CDE"
                {...form.getFieldProps('reg')} />
              {form.errors.reg ? <span className={styles.fieldError}>{form.errors.reg}</span> : null}
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Mileage</span>
              <input type="text" inputMode="numeric" required aria-required="true" aria-invalid={Boolean(form.errors.mileage)}
                className={styles.input} placeholder="45,000" {...form.getFieldProps('mileage')} />
              {form.errors.mileage ? <span className={styles.fieldError}>{form.errors.mileage}</span> : null}
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Full name</span>
              <input type="text" autoComplete="name" required aria-required="true" aria-invalid={Boolean(form.errors.name)}
                className={styles.input} {...form.getFieldProps('name')} />
              {form.errors.name ? <span className={styles.fieldError}>{form.errors.name}</span> : null}
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <input type="email" autoComplete="email" required aria-required="true" aria-invalid={Boolean(form.errors.email)}
                className={styles.input} {...form.getFieldProps('email')} />
              {form.errors.email ? <span className={styles.fieldError}>{form.errors.email}</span> : null}
            </label>
            <label className={[styles.field, styles.fieldFull].join(' ')}>
              <span className={styles.fieldLabel}>Phone</span>
              <input type="tel" autoComplete="tel" required aria-required="true" aria-invalid={Boolean(form.errors.phone)}
                className={styles.input} placeholder="07…" {...form.getFieldProps('phone')} />
              {form.errors.phone ? <span className={styles.fieldError}>{form.errors.phone}</span> : null}
            </label>
          </div>

          <label className={[styles.field, styles.fieldFull].join(' ')}>
            <span className={styles.fieldLabel}>Anything we should know?</span>
            <textarea
              className={[styles.input, styles.textarea].join(' ')}
              placeholder="Service history, modifications, outstanding finance, condition notes…"
              rows={4}
              {...form.getFieldProps('notes')}
            />
          </label>

          {hasSubmitError ? (
            <p className={styles.submitError} role="alert">
              {form.errorMessage || 'Something went wrong. Please try again or call us directly.'}
            </p>
          ) : null}

          <div className={styles.submitRow}>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Sending…' : 'Request valuation'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
            <p className={styles.submitNote}>Written offer within 24h. No obligation.</p>
          </div>
        </form>
      )}
    </div>
  )
}
