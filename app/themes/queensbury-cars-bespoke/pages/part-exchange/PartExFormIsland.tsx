'use client'

import { useState } from 'react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import styles from './PartExFormIsland.module.css'

type Values = {
  reg: string
  mileage: string
  condition: string
  name: string
  email: string
  phone: string
  notes: string
  website: string
}

export default function PartExFormIsland() {
  const form = useLeadsForm<Values>({
    initialValues: {
      reg: '',
      mileage: '',
      condition: 'Good',
      name: '',
      email: '',
      phone: '',
      notes: '',
      website: '',
    },
    leadType: 'part-exchange',
    leadSource: 'part-exchange-page',
    honeypotField: 'website',
    fieldConfig: {
      reg: { required: true },
      mileage: { required: true },
      name: { required: true },
      email: { required: true },
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
        <h3 className={styles.successHead}>Got it — quote on the way.</h3>
        <p>Our buyer will reply within one working day with a guide trade-in figure. Keep an eye on your inbox.</p>
        <button type="button" className="qb-btn qb-btn--ghost qb-btn--sm" onClick={() => form.reset()}>
          Submit another
        </button>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>Reg plate *</span>
          <input
            type="text"
            value={form.values.reg}
            onChange={(e) => form.setFieldValue('reg', e.target.value.toUpperCase())}
            placeholder="e.g. AB12 CDE"
            aria-required="true"
            aria-invalid={Boolean(submittedOnce && form.errors.reg)}
          />
          {submittedOnce && form.errors.reg && (
            <span className={styles.error} role="alert">{form.errors.reg}</span>
          )}
        </label>
        <label className={styles.field}>
          <span>Mileage *</span>
          <input
            type="text"
            inputMode="numeric"
            value={form.values.mileage}
            onChange={(e) => form.setFieldValue('mileage', e.target.value)}
            placeholder="e.g. 58,400"
            aria-required="true"
            aria-invalid={Boolean(submittedOnce && form.errors.mileage)}
          />
          {submittedOnce && form.errors.mileage && (
            <span className={styles.error} role="alert">{form.errors.mileage}</span>
          )}
        </label>
      </div>

      <label className={styles.field}>
        <span>Condition</span>
        <select value={form.values.condition} onChange={(e) => form.setFieldValue('condition', e.target.value)}>
          <option>Excellent — minimal wear</option>
          <option>Good — typical age-appropriate wear</option>
          <option>Fair — visible cosmetic / minor mechanical</option>
          <option>Below average — needs attention</option>
        </select>
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Your name *</span>
          <input
            type="text"
            value={form.values.name}
            onChange={(e) => form.setFieldValue('name', e.target.value)}
            autoComplete="name"
            aria-required="true"
            aria-invalid={Boolean(submittedOnce && form.errors.name)}
          />
          {submittedOnce && form.errors.name && (
            <span className={styles.error} role="alert">{form.errors.name}</span>
          )}
        </label>
        <label className={styles.field}>
          <span>Email *</span>
          <input
            type="email"
            value={form.values.email}
            onChange={(e) => form.setFieldValue('email', e.target.value)}
            autoComplete="email"
            aria-required="true"
            aria-invalid={Boolean(submittedOnce && form.errors.email)}
          />
          {submittedOnce && form.errors.email && (
            <span className={styles.error} role="alert">{form.errors.email}</span>
          )}
        </label>
      </div>

      <label className={styles.field}>
        <span>Phone (optional)</span>
        <input
          type="tel"
          value={form.values.phone}
          onChange={(e) => form.setFieldValue('phone', e.target.value)}
          autoComplete="tel"
        />
      </label>

      <label className={styles.field}>
        <span>Anything else we should know?</span>
        <textarea
          rows={3}
          value={form.values.notes}
          onChange={(e) => form.setFieldValue('notes', e.target.value)}
          placeholder="Service history, modifications, outstanding finance, etc."
        />
      </label>

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
        <div className={styles.formError} role="alert">{form.errorMessage}</div>
      )}

      <button
        type="submit"
        className={`qb-btn qb-btn--gradient ${styles.submit}`}
        disabled={form.status === 'submitting'}
      >
        {form.status === 'submitting' ? 'Sending…' : 'Get my guide price'}
      </button>
    </form>
  )
}
