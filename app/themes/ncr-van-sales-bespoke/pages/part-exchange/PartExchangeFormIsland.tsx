'use client'

import { useEffect } from 'react'
import { useLeadsForm } from '../../../../hooks/useLeadsForm'
import { isValidUkPhone } from '../../lib/uk-phone'
import styles from './page.module.css'

type PxFormValues = {
  name: string
  email: string
  phone: string
  reg: string
  mileage: string
  conditionNotes: string
  outstandingFinance: string
  vehicleOfInterest: string
  url: string
}

export default function PartExchangeFormIsland() {
  const form = useLeadsForm<PxFormValues>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      reg: '',
      mileage: '',
      conditionNotes: '',
      outstandingFinance: 'No',
      vehicleOfInterest: '',
      url: '',
    },
    leadType: 'part-exchange',
    leadSource: 'part-exchange-form',
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
      reg: { required: true },
      mileage: { required: true },
    },
    buildPayload: (values, meta) => ({
      name: values.name,
      email: values.email,
      phone: values.phone,
      reg: values.reg,
      mileage: values.mileage,
      conditionNotes: values.conditionNotes,
      outstandingFinance: values.outstandingFinance,
      vehicleOfInterest: values.vehicleOfInterest,
      subject: 'Part exchange enquiry',
      url: values.url || (typeof window !== 'undefined' ? window.location.href : ''),
      leadType: 'part-exchange',
      leadSource: 'part-exchange-form',
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
        <p className={styles.formEyebrow}>Part exchange enquiry</p>
        <h2 className={styles.formHeading}>Tell us about your van.</h2>
      </header>

      <form
        className={styles.formGrid2}
        onSubmit={(e) => {
          e.preventDefault()
          void form.submit()
        }}
        noValidate
      >
        <input type="text" {...form.honeypotProps} className={styles.honeypot} aria-hidden="true" tabIndex={-1} />

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Full name</span>
          <input type="text" required aria-required="true"
            aria-invalid={Boolean(form.errors.name)} {...form.getFieldProps('name')} />
          {form.errors.name ? <span className={styles.fieldError}>{form.errors.name}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Phone</span>
          <input type="tel" required aria-required="true"
            aria-invalid={Boolean(form.errors.phone)} {...form.getFieldProps('phone')} />
          {form.errors.phone ? <span className={styles.fieldError}>{form.errors.phone}</span> : null}
        </label>

        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.fieldLabel}>Email</span>
          <input type="email" required aria-required="true"
            aria-invalid={Boolean(form.errors.email)} {...form.getFieldProps('email')} />
          {form.errors.email ? <span className={styles.fieldError}>{form.errors.email}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Your van reg</span>
          <input type="text" required aria-required="true"
            aria-invalid={Boolean(form.errors.reg)}
            style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
            {...form.getFieldProps('reg')} />
          {form.errors.reg ? <span className={styles.fieldError}>{form.errors.reg}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Mileage</span>
          <input type="number" inputMode="numeric" required aria-required="true"
            placeholder="e.g. 78000"
            aria-invalid={Boolean(form.errors.mileage)} {...form.getFieldProps('mileage')} />
          {form.errors.mileage ? <span className={styles.fieldError}>{form.errors.mileage}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Outstanding finance?</span>
          <select {...form.getFieldProps('outstandingFinance')}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
            <option value="Not sure">Not sure</option>
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Vehicle of interest (optional)</span>
          <input type="text" placeholder="e.g. Ford Transit Custom"
            {...form.getFieldProps('vehicleOfInterest')} />
        </label>

        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.fieldLabel}>Condition notes</span>
          <textarea rows={5} placeholder="Service history, any damage, recent work, MOT status..."
            {...form.getFieldProps('conditionNotes')} />
        </label>

        {form.errorMessage ? (
          <p className={`${styles.formStatus} ${styles.fieldFull}`} role="alert">{form.errorMessage}</p>
        ) : null}
        {form.status === 'success' ? (
          <p className={`${styles.formStatus} ${styles.formStatusSuccess} ${styles.fieldFull}`} role="status">
            Thanks — we'll be in touch within one working day.
          </p>
        ) : null}

        <button type="submit"
          className={`${styles.submit} ${styles.fieldFull} mfx-shimmer`}
          disabled={form.status === 'submitting'}>
          {form.status === 'submitting' ? 'Sending…' : 'Get my valuation'}
        </button>
      </form>
    </div>
  )
}
