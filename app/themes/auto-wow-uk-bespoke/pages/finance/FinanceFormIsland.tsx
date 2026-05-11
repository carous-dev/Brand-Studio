'use client'

import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { isValidUkPhone } from '../../lib/uk-phone'
import styles from './page.module.css'

type FinanceValues = {
  name: string
  email: string
  phone: string
  deposit: string
  monthlyBudget: string
  term: string
  message: string
}

export default function FinanceFormIsland() {
  const form = useLeadsForm<FinanceValues>({
    initialValues: { name: '', email: '', phone: '', deposit: '', monthlyBudget: '', term: '60', message: '' },
    leadType: 'finance-enquiry',
    leadSource: 'finance-page',
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
      monthlyBudget: {
        required: true,
        validate: (v) => (Number(String(v || '').replace(/[^0-9]/g, '')) > 0 ? null : 'Enter your monthly budget.'),
      },
    },
    buildPayload: (values, meta) => ({
      ...values,
      subject: `Finance enquiry — £${values.monthlyBudget || '0'}/month`,
      leadType: 'finance-enquiry',
      leadSource: 'finance-page',
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
          Soft-search application
        </p>
        <h2 className={styles.formHeading}>Get a no-impact decision.</h2>
        <p className={styles.formLead}>
          Two minutes, no mark on your credit file. We&apos;ll come back with
          rates and lender options.
        </p>
      </header>

      {submitted ? (
        <div className={styles.successBox} role="status">
          <h3 className={styles.successHeading}>Application received.</h3>
          <p>We&apos;ll get back to you within one working day with rates.</p>
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
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Phone</span>
              <input type="tel" autoComplete="tel" required aria-required="true" aria-invalid={Boolean(form.errors.phone)}
                className={styles.input} placeholder="07…" {...form.getFieldProps('phone')} />
              {form.errors.phone ? <span className={styles.fieldError}>{form.errors.phone}</span> : null}
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Deposit (£)</span>
              <input type="text" inputMode="numeric" className={styles.input} placeholder="1000"
                {...form.getFieldProps('deposit')} />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Monthly budget (£)</span>
              <input type="text" inputMode="numeric" required aria-required="true" aria-invalid={Boolean(form.errors.monthlyBudget)}
                className={styles.input} placeholder="250" {...form.getFieldProps('monthlyBudget')} />
              {form.errors.monthlyBudget ? <span className={styles.fieldError}>{form.errors.monthlyBudget}</span> : null}
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Term (months)</span>
              <select className={styles.input} {...form.getFieldProps('term')}>
                <option value="24">24</option>
                <option value="36">36</option>
                <option value="48">48</option>
                <option value="60">60</option>
                <option value="72">72</option>
              </select>
            </label>
          </div>

          <label className={[styles.field, styles.fieldFull].join(' ')}>
            <span className={styles.fieldLabel}>Notes (optional)</span>
            <textarea
              className={[styles.input, styles.textarea].join(' ')}
              placeholder="Anything we should know — type of car you’re looking at, employment, anything else."
              rows={3}
              {...form.getFieldProps('message')}
            />
          </label>

          {hasSubmitError ? (
            <p className={styles.submitError} role="alert">
              {form.errorMessage || 'Something went wrong. Please try again or call us directly.'}
            </p>
          ) : null}

          <div className={styles.submitRow}>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send application'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
            <p className={styles.submitNote}>Soft-search only. No mark on your credit file.</p>
          </div>
        </form>
      )}
    </div>
  )
}
