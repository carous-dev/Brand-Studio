'use client'

import { FormEvent } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { useBrand } from '../../context/BrandClientWrapper'
import { isValidUkPhone } from '../../lib/uk-phone'
import styles from './PartExchangeIsland.module.css'

type FormValues = {
  reg: string; mileage: string; condition: string;
  buyer_name: string; buyer_email: string; buyer_phone: string;
  notes: string; consent: boolean
}

const INITIAL: FormValues = {
  reg: '', mileage: '', condition: 'good',
  buyer_name: '', buyer_email: '', buyer_phone: '',
  notes: '', consent: false,
}

export default function PartExchangeIsland() {
  const brand = useBrand()
  const brandName = brand?.name || 'the showroom'

  const form = useLeadsForm<FormValues>({
    initialValues: INITIAL,
    leadType: 'part-exchange',
    leadSource: 'part-exchange-page',
    fieldConfig: {
      reg: { required: true },
      mileage: {
        required: true,
        validate: (v) => (/^\d{1,7}$/.test(String(v || '').replace(/\D/g, '')) ? null : 'Enter mileage as a number.'),
      },
      buyer_name: { required: true },
      buyer_email: {
        required: true,
        validate: (v) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim()) ? null : 'Please enter a valid email.',
      },
      buyer_phone: {
        required: true,
        validate: (v) => (isValidUkPhone(String(v || '')) ? null : 'Please enter a UK phone number.'),
      },
      consent: { required: true, validate: (v) => (v ? null : 'Please tick to confirm.') },
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
        <h2>Got it</h2>
        <p>
          Thanks — {brandName} will value your car and come back within 24 hours
          with a guide price.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      <header className={styles.header}>
        <span className={styles.eyebrow}>{'> '}get-a-value</span>
        <h2 className={styles.title}>Tell us about your car</h2>
        <p className={styles.lead}>
          Reg, mileage, and condition. We&apos;ll come back with a guide price
          within 24 hours.
        </p>
      </header>

      <input type="text" tabIndex={-1} className={styles.honeypot} aria-hidden="true" {...form.honeypotProps} />

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Registration</span>
          <input type="text" inputMode="text" autoComplete="off" maxLength={9} required aria-required="true" placeholder="ABC 123" aria-invalid={form.errors.reg ? 'true' : undefined} {...form.getFieldProps('reg')} />
          {form.errors.reg ? <span className={styles.fieldError}>{form.errors.reg}</span> : null}
        </label>
        <label className={styles.field}>
          <span>Mileage</span>
          <input type="number" inputMode="numeric" required aria-required="true" placeholder="e.g. 42000" aria-invalid={form.errors.mileage ? 'true' : undefined} {...form.getFieldProps('mileage')} />
          {form.errors.mileage ? <span className={styles.fieldError}>{form.errors.mileage}</span> : null}
        </label>
      </div>

      <label className={styles.field}>
        <span>Condition</span>
        <select {...form.getFieldProps('condition')}>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Needs work</option>
        </select>
      </label>

      <div className={styles.divider}>{'> '}your-details</div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Name</span>
          <input type="text" autoComplete="name" required aria-required="true" aria-invalid={form.errors.buyer_name ? 'true' : undefined} {...form.getFieldProps('buyer_name')} />
          {form.errors.buyer_name ? <span className={styles.fieldError}>{form.errors.buyer_name}</span> : null}
        </label>
        <label className={styles.field}>
          <span>Phone</span>
          <input type="tel" autoComplete="tel" required aria-required="true" aria-invalid={form.errors.buyer_phone ? 'true' : undefined} {...form.getFieldProps('buyer_phone')} />
          {form.errors.buyer_phone ? <span className={styles.fieldError}>{form.errors.buyer_phone}</span> : null}
        </label>
      </div>

      <label className={styles.field}>
        <span>Email</span>
        <input type="email" autoComplete="email" required aria-required="true" aria-invalid={form.errors.buyer_email ? 'true' : undefined} {...form.getFieldProps('buyer_email')} />
        {form.errors.buyer_email ? <span className={styles.fieldError}>{form.errors.buyer_email}</span> : null}
      </label>

      <label className={styles.field}>
        <span>Notes (optional)</span>
        <textarea rows={3} placeholder="Service history, recent work, anything we should know" {...form.getFieldProps('notes')} />
      </label>

      <label className={styles.checkbox}>
        <input type="checkbox" required aria-required="true" checked={Boolean(form.values.consent)} onChange={(e) => form.setFieldValue('consent', e.target.checked as any)} />
        <span>I&apos;m happy for {brandName} to contact me with a guide price.</span>
      </label>
      {form.errors.consent ? <span className={styles.fieldError}>{form.errors.consent}</span> : null}

      {form.status === 'error' ? (
        <div role="alert" className={styles.alert}>
          {form.errorMessage || 'Something went wrong. Please try again or call us.'}
        </div>
      ) : null}

      <button type="submit" className={`axis-btn axis-btn--primary ${styles.submit}`} disabled={form.status === 'submitting'}>
        {form.status === 'submitting' ? 'Sending...' : 'Get my value'}
        <ArrowRight size={18} strokeWidth={2} />
      </button>
    </form>
  )
}
