'use client'

import { ArrowUpRight } from 'lucide-react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import styles from './page.module.css'

type Values = {
  name: string
  email: string
  phone: string
  yourReg: string
  yourMileage: string
  interested: string
  message: string
}

export default function PartExForm() {
  const form = useLeadsForm<Values>({
    initialValues: {
      name: '', email: '', phone: '', yourReg: '', yourMileage: '', interested: '', message: '',
    },
    leadType: 'part-exchange',
    leadSource: 'part-exchange-page',
    honeypotField: 'website',
    fieldConfig: {
      name: { required: true },
      email: { required: true, validate: (v) => (/\S+@\S+\.\S+/.test(String(v || '')) ? null : 'Enter a valid email') },
      yourReg: { required: true },
      yourMileage: { required: true },
    },
  })

  return (
    <form
      className={styles.form}
      onSubmit={(e) => { e.preventDefault(); void form.submit() }}
      aria-label="Part-exchange valuation"
    >
      <p className="auto-eyebrow">Get your appraisal</p>
      <h2 className={styles.formTitle}>Tell us about your car.</h2>

      <input
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        className={styles.honeypot}
        {...form.honeypotProps}
      />

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Your reg</span>
          <input
            type="text" placeholder="AB12 CDE"
            aria-required="true"
            aria-invalid={Boolean(form.errors.yourReg)}
            {...form.getFieldProps('yourReg')}
          />
          {form.errors.yourReg && <span className={styles.fieldError}>{form.errors.yourReg}</span>}
        </label>
        <label className={styles.field}>
          <span>Mileage</span>
          <input
            type="text" placeholder="45,000"
            aria-required="true"
            aria-invalid={Boolean(form.errors.yourMileage)}
            {...form.getFieldProps('yourMileage')}
          />
          {form.errors.yourMileage && <span className={styles.fieldError}>{form.errors.yourMileage}</span>}
        </label>
      </div>

      <label className={styles.field}>
        <span>Full name</span>
        <input
          type="text" placeholder="Your name"
          aria-required="true"
          aria-invalid={Boolean(form.errors.name)}
          {...form.getFieldProps('name')}
        />
        {form.errors.name && <span className={styles.fieldError}>{form.errors.name}</span>}
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email" placeholder="you@email.com"
            aria-required="true"
            aria-invalid={Boolean(form.errors.email)}
            {...form.getFieldProps('email')}
          />
          {form.errors.email && <span className={styles.fieldError}>{form.errors.email}</span>}
        </label>
        <label className={styles.field}>
          <span>Phone</span>
          <input type="tel" placeholder="07__ ___ ____" {...form.getFieldProps('phone')} />
        </label>
      </div>

      <label className={styles.field}>
        <span>Interested in (optional)</span>
        <input type="text" placeholder="e.g. SUV under £15,000" {...form.getFieldProps('interested')} />
      </label>

      <label className={styles.field}>
        <span>Anything else</span>
        <textarea rows={4} placeholder="Service history, ownership, condition…" {...form.getFieldProps('message')} />
      </label>

      <div className={styles.formFoot}>
        <button
          type="submit"
          className={`auto-btn auto-btn--primary ${styles.submit}`}
          disabled={form.status === 'submitting'}
        >
          {form.status === 'submitting' ? 'Sending…' : (
            <>
              Get my appraisal
              <ArrowUpRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
        {form.status === 'success' && (
          <p className={styles.formSuccess}>Thanks! We&rsquo;ll come back with an appraisal shortly.</p>
        )}
        {(form.status === 'error' || form.status === 'rate-limited') && (
          <p className={styles.formError}>
            {form.errorMessage || 'Something went wrong. Please try again.'}
          </p>
        )}
      </div>
    </form>
  )
}
