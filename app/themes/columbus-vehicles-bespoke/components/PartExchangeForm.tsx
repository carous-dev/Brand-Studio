'use client'

import { useLeadsForm } from '../../../hooks/useLeadsForm'
import { isValidUkPhone } from '../lib/uk-phone'
import styles from './PartExchangeForm.module.css'

/**
 * Part-exchange valuation form — client island.
 *
 * Extracted out of the part-exchange page so the page itself can stay a
 * Server Component (only the form needs interactivity). Eliminates the
 * Turbopack `'use client'` chunk-item collision we hit when the page itself
 * carried the directive at a path that mirrored springalls-classic's.
 */

type PartExchangeFormValues = {
  name: string
  email: string
  phone: string
  registration: string
  mileage: string
  condition: string
  vehicleOfInterest: string
  notes: string
}

export default function PartExchangeForm() {
  const form = useLeadsForm<PartExchangeFormValues>({
    initialValues: {
      name: '', email: '', phone: '', registration: '', mileage: '',
      condition: 'Excellent', vehicleOfInterest: '', notes: '',
    },
    leadType: 'part-exchange',
    leadSource: 'part-exchange',
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (v) => (/\S+@\S+\.\S+/.test(String(v || '')) ? null : 'Enter a valid email address.'),
      },
      phone: { required: true, validate: (v) => (isValidUkPhone(v) ? null : 'Enter a valid UK phone number.') },
      registration: { required: true },
      mileage: { required: true },
    },
    buildPayload: (values, meta) => ({
      ...values,
      subject: `Part-exchange valuation: ${values.registration || 'New enquiry'}`,
      message: [
        `Reg: ${values.registration}`,
        `Mileage: ${values.mileage}`,
        `Condition: ${values.condition}`,
        values.vehicleOfInterest ? `Considering: ${values.vehicleOfInterest}` : '',
        '',
        values.notes || '',
      ].filter(Boolean).join('\n'),
      leadType: 'part-exchange',
      leadSource: 'part-exchange',
      formTs: meta.formTs,
      [meta.honeypotField]: meta.honeypotValue,
    }),
  })

  return (
    <form
      className={styles.form}
      onSubmit={(e) => { e.preventDefault(); void form.submit() }}
      noValidate
    >
      <input type="text" {...form.honeypotProps} className={styles.honeypot} aria-hidden="true" tabIndex={-1} />
      <h2 className={styles.formHeading}>Tell us about your trade-in</h2>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Registration</span>
        <input type="text" required aria-required="true" {...form.getFieldProps('registration')} />
        {form.errors.registration ? <span className={styles.fieldError}>{form.errors.registration}</span> : null}
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Current mileage</span>
        <input type="text" required aria-required="true" inputMode="numeric" {...form.getFieldProps('mileage')} />
        {form.errors.mileage ? <span className={styles.fieldError}>{form.errors.mileage}</span> : null}
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Condition</span>
        <select {...form.getFieldProps('condition')}>
          <option>Excellent</option>
          <option>Good</option>
          <option>Average</option>
          <option>Needs work</option>
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Considering a specific vehicle? (optional)</span>
        <input type="text" placeholder="e.g. Jeep Wrangler Rubicon 2018" {...form.getFieldProps('vehicleOfInterest')} />
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Anything else? (optional)</span>
        <textarea rows={3} placeholder="Service history, modifications, outstanding finance, etc." {...form.getFieldProps('notes')} />
      </label>

      <hr className={styles.divider} />

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Your name</span>
        <input type="text" required aria-required="true" {...form.getFieldProps('name')} />
        {form.errors.name ? <span className={styles.fieldError}>{form.errors.name}</span> : null}
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Email</span>
        <input type="email" required aria-required="true" {...form.getFieldProps('email')} />
        {form.errors.email ? <span className={styles.fieldError}>{form.errors.email}</span> : null}
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Phone</span>
        <input type="tel" required aria-required="true" {...form.getFieldProps('phone')} />
        {form.errors.phone ? <span className={styles.fieldError}>{form.errors.phone}</span> : null}
      </label>

      {form.errorMessage ? <p className={styles.formStatus} role="alert">{form.errorMessage}</p> : null}
      {form.status === 'success' ? (
        <p className={`${styles.formStatus} ${styles.formStatusSuccess}`} role="status">
          Thanks — we&apos;ll send your part-exchange valuation within the working day.
        </p>
      ) : null}

      <button type="submit" className={styles.submit} disabled={form.status === 'submitting'}>
        {form.status === 'submitting' ? 'Sending…' : 'Get my valuation'}
      </button>
    </form>
  )
}
