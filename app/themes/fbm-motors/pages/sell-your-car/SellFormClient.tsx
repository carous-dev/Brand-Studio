'use client'

import { useState } from 'react'
import styles from './page.module.css'

const stepLabels = ['Your car', 'Condition', 'Your details']

function Field({ label, id, type = 'text', placeholder }: { label: string; id: string; type?: string; placeholder?: string }) {
  return (
    <div className={styles.formField}>
      <label className={styles.formLabel} htmlFor={id}>{label}</label>
      <input id={id} type={type} placeholder={placeholder} className="fbm-field" />
    </div>
  )
}

function SelectField({ label, id, options }: { label: string; id: string; options: string[] }) {
  return (
    <div className={styles.formField}>
      <label className={styles.formLabel} htmlFor={id}>{label}</label>
      <select id={id} className="fbm-field">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function SellFormClient() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className={styles.formCard}>
        <div className={styles.done}>
          <span className={styles.doneIcon}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <h2 className={styles.doneTitle}>Valuation request sent</h2>
          <p className={styles.doneBody}>
            We&apos;ll review your details and reply within 24 hours with a no-obligation offer.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.formCard}>
      <div className={styles.stepper}>
        {stepLabels.map((s, i) => (
          <div key={s} className={styles.stepperCell}>
            <span className={`${styles.stepperDot} ${i <= step ? styles.stepperDotActive : ''}`}>{i + 1}</span>
            <span className={`${styles.stepperLabel} ${i <= step ? styles.stepperLabelActive : ''}`}>{s}</span>
            {i < stepLabels.length - 1 && <span className={styles.stepperBar} aria-hidden />}
          </div>
        ))}
      </div>

      <div className={styles.formGrid}>
        {step === 0 && (
          <>
            <Field label="Registration number" id="reg" placeholder="e.g. BJ07 FZC" />
            <div className={styles.formGridRow}>
              <Field label="Mileage" id="mileage" placeholder="e.g. 64,000" />
              <SelectField label="Service history" id="history" options={['Full', 'Partial', 'None']} />
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <SelectField label="Overall condition" id="condition" options={['Excellent', 'Good', 'Fair', 'Needs work']} />
            <div className={styles.formGridRow}>
              <SelectField label="Number of keys" id="keys" options={['2+', '1']} />
              <SelectField label="Outstanding finance?" id="finance" options={['No', 'Yes']} />
            </div>
            <Field label="Anything we should know? (optional)" id="notes" placeholder="Scratches, recent work, extras…" />
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Full name" id="name" placeholder="Your name" />
            <div className={styles.formGridRow}>
              <Field label="Email" id="email" type="email" placeholder="you@example.com" />
              <Field label="Phone" id="phone" type="tel" placeholder="07…" />
            </div>
          </>
        )}
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className="fbm-btn-ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </button>
        <button
          type="button"
          className="fbm-btn-primary"
          onClick={() => (step === stepLabels.length - 1 ? setDone(true) : setStep((s) => s + 1))}
        >
          {step === stepLabels.length - 1 ? 'Get my valuation' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
