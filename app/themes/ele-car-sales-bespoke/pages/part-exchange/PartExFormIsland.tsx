'use client'

import { useEffect } from 'react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { isValidUkPhone } from '../../lib/uk-phone'
import styles from './page.module.css'

type PartExValues = {
  yourReg: string
  yourMileage: string
  yourMake: string
  yourModel: string
  targetCar: string
  name: string
  email: string
  phone: string
  postcode: string
  notes: string
  url: string
}

export default function PartExFormIsland() {
  const form = useLeadsForm<PartExValues>({
    initialValues: {
      yourReg: '', yourMileage: '', yourMake: '', yourModel: '',
      targetCar: '', name: '', email: '', phone: '', postcode: '', notes: '', url: '',
    },
    leadType: 'part-exchange',
    leadSource: 'part-exchange',
    fieldConfig: {
      yourReg: { required: true },
      yourMileage: {
        required: true,
        validate: (v) => (/^\d{1,7}$/.test(String(v || '').replace(/[\s,]/g, '')) ? null : 'Enter mileage as a number.'),
      },
      yourMake: { required: true },
      yourModel: { required: true },
      name: { required: true },
      email: {
        required: true,
        validate: (v) => (/\S+@\S+\.\S+/.test(String(v || '')) ? null : 'Enter a valid email address.'),
      },
      phone: {
        required: true,
        validate: (v) => (isValidUkPhone(v) ? null : 'Enter a valid UK phone number.'),
      },
    },
    buildPayload: (values, meta) => ({
      yourCar: {
        reg: values.yourReg,
        mileage: values.yourMileage,
        make: values.yourMake,
        model: values.yourModel,
      },
      targetCar: values.targetCar,
      name: values.name,
      email: values.email,
      phone: values.phone,
      postcode: values.postcode,
      notes: values.notes,
      url: values.url || (typeof window !== 'undefined' ? window.location.href : ''),
      leadType: 'part-exchange',
      leadSource: 'part-exchange',
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
        <p className={styles.formEyebrow}>Part-exchange</p>
        <h2 className={styles.formHeading}>Tell us about your part-exchange.</h2>
        <p className={styles.formLead}>
          We&apos;ll value your current car and apply it against the price of any
          vehicle in stock.
        </p>
      </header>

      <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void form.submit() }} noValidate>
        <input type="text" {...form.honeypotProps} className={styles.honeypot} aria-hidden="true" tabIndex={-1} autoComplete="off" />

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Your current car</legend>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Registration</span>
              <input
                type="text"
                required
                aria-required="true"
                aria-invalid={Boolean(form.errors.yourReg)}
                className={styles.input}
                {...form.getFieldProps('yourReg')}
              />
              {form.errors.yourReg ? <span className={styles.fieldError}>{form.errors.yourReg}</span> : null}
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Mileage</span>
              <input
                type="text"
                inputMode="numeric"
                required
                aria-required="true"
                aria-invalid={Boolean(form.errors.yourMileage)}
                className={styles.input}
                {...form.getFieldProps('yourMileage')}
              />
              {form.errors.yourMileage ? <span className={styles.fieldError}>{form.errors.yourMileage}</span> : null}
            </label>
          </div>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Make</span>
              <input
                type="text"
                required
                aria-required="true"
                className={styles.input}
                {...form.getFieldProps('yourMake')}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Model</span>
              <input
                type="text"
                required
                aria-required="true"
                className={styles.input}
                {...form.getFieldProps('yourModel')}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>The car you&apos;re after</legend>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Which car from our stock? (Optional)</span>
            <input
              type="text"
              placeholder="e.g. Audi A3 from your listings, or a make/model you're looking for"
              className={styles.input}
              {...form.getFieldProps('targetCar')}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Notes (Optional)</span>
            <textarea rows={3} className={styles.textarea} {...form.getFieldProps('notes')} />
          </label>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>About you</legend>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Full name</span>
              <input
                type="text"
                autoComplete="name"
                required
                aria-required="true"
                className={styles.input}
                {...form.getFieldProps('name')}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Postcode</span>
              <input
                type="text"
                autoComplete="postal-code"
                className={styles.input}
                {...form.getFieldProps('postcode')}
              />
            </label>
          </div>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                className={styles.input}
                {...form.getFieldProps('email')}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>UK phone</span>
              <input
                type="tel"
                autoComplete="tel"
                required
                aria-required="true"
                className={styles.input}
                {...form.getFieldProps('phone')}
              />
            </label>
          </div>
        </fieldset>

        {form.errorMessage ? (
          <p className={styles.formStatus} role="alert">{form.errorMessage}</p>
        ) : null}
        {form.status === 'success' ? (
          <p className={`${styles.formStatus} ${styles.formStatusSuccess}`} role="status">
            Thanks — we&apos;ll get back to you with a part-exchange offer shortly.
          </p>
        ) : null}

        <button
          type="submit"
          className={styles.submit}
          disabled={form.status === 'submitting'}
        >
          {form.status === 'submitting' ? 'Sending…' : 'Get my part-ex offer'}
        </button>
      </form>
    </div>
  )
}
