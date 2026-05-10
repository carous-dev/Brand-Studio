'use client'

import { useLeadsForm } from '../../../hooks/useLeadsForm'
import { isValidUkPhone } from '../lib/uk-phone'
import styles from './SellYourCarForm.module.css'

/**
 * Sell-your-car valuation form — client island.
 * Same architectural rationale as PartExchangeForm: page stays a Server
 * Component, only the form is client. Avoids Turbopack chunk-item collision
 * and keeps useLeadsForm scoped to the part of the tree that needs it.
 */

type ValuationFormValues = {
  name: string
  email: string
  phone: string
  registration: string
  mileage: string
  condition: string
  notes: string
}

export default function SellYourCarForm() {
  const form = useLeadsForm<ValuationFormValues>({
    initialValues: { name: '', email: '', phone: '', registration: '', mileage: '', condition: 'Excellent', notes: '' },
    leadType: 'sell-my-car',
    leadSource: 'sell-my-car',
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
      subject: `Sell-my-4×4 valuation: ${values.registration || 'New enquiry'}`,
      message: `Reg: ${values.registration}\nMileage: ${values.mileage}\nCondition: ${values.condition}\n\n${values.notes || ''}`.trim(),
      leadType: 'sell-my-car',
      leadSource: 'sell-my-car',
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
      <h2 className={styles.formHeading}>Tell us about your 4×4</h2>

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
        <span className={styles.fieldLabel}>Anything else we should know?</span>
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
          Thanks — we&apos;ve got your details. Expect a valuation within the working day.
        </p>
      ) : null}

      <button type="submit" className={styles.submit} disabled={form.status === 'submitting'}>
        {form.status === 'submitting' ? 'Sending…' : 'Get my valuation'}
      </button>
    </form>
  )
}
