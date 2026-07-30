'use client'

import type { CSSProperties, FormEvent } from 'react'
import type { BrandConfig } from '@/brands/types'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { resolveText } from '../lib/brand-text'
import styles from './ContactForm.module.css'

/**
 * Contact enquiry form — the /contact split's left column (design-language §7:
 * contact split on `bg`, form left, visit-lodge details right). On its own it is
 * the theme's "become a lead" moment on the contact route.
 *
 * Unique move (spec §"Unique move"): ledger-underline inputs — no boxed shells.
 * Each field is a serif-caps caption label over a value line whose only border is
 * a bottom hairline (`--color-border`) that thickens to 2px `--color-primary` on
 * focus, like writing on a ruled page. The label shifts to primary on
 * `:focus-within`. The submit button is the only solid element (AC1: no full
 * `border:` on input selectors).
 *
 * Wiring (orchestrator brief): shared `useLeadsForm` drives submit + honeypot +
 * rate-limit + idle/submitting/success/error states. The honeypot is visually
 * hidden but focusable for bots. On success the whole form swaps to a warm
 * thank-you block (serif title + line + reset).
 *
 * Data/copy: every string routes through `resolveText(brand, key)` under the
 * `enquiry.*` recipe section (build-rules §12). `brand` is passed as a prop from
 * the Server-Component page (plain JSON — safe across the boundary), so the form
 * needs no context.
 *
 * Tokens (spec §Tokens, build-rules §2): card is `bg`/`text`; labels `muted`;
 * values `text`; input rule `--color-border` → focus `--color-primary`; submit
 * `--color-primary`/`--color-on-primary`; validation uses the `--t-error` status
 * token, success note `--t-success`. Zero literals — legible on the claret
 * palette AND a light throwaway brand.
 */

type ContactFormProps = {
  brand: BrandConfig | null | undefined
}

type ContactValues = {
  name: string
  phone: string
  email: string
  message: string
}

const INITIAL: ContactValues = { name: '', phone: '', email: '', message: '' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Stable across renders — required flags + a light email-format check. The
// returned strings are sentinels only; the visible copy comes from the recipe.
const FIELD_CONFIG = {
  name: { required: true },
  email: {
    required: true,
    validate: (value: ContactValues[keyof ContactValues]) =>
      EMAIL_RE.test(String(value).trim()) ? null : 'invalid',
  },
  message: { required: true },
} as const

// Honeypot stays focusable for bots but off-screen for people.
const HONEYPOT_STYLE: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
  opacity: 0,
  pointerEvents: 'none',
}

export default function ContactForm({ brand }: ContactFormProps) {
  const { getFieldProps, errors, status, errorMessage, submit, reset, honeypotProps } =
    useLeadsForm<ContactValues>({
      initialValues: INITIAL,
      leadType: 'contact',
      leadSource: 'contact-page',
      fieldConfig: FIELD_CONFIG,
    })

  const title = resolveText(brand, 'enquiry.contact_title')
  const labelName = resolveText(brand, 'enquiry.label_name')
  const labelPhone = resolveText(brand, 'enquiry.label_phone')
  const labelEmail = resolveText(brand, 'enquiry.label_email')
  const labelMessage = resolveText(brand, 'enquiry.label_message')
  const placeholderMessage = resolveText(brand, 'enquiry.placeholder_message')
  const submitLabel = resolveText(brand, 'enquiry.submit')
  const sendingLabel = resolveText(brand, 'enquiry.sending')
  const errorText = resolveText(brand, 'enquiry.error')
  const successTitle = resolveText(brand, 'enquiry.success_title')
  const successBody = resolveText(brand, 'enquiry.success_body')
  const resetLabel = resolveText(brand, 'enquiry.success_reset')

  const isSubmitting = status === 'submitting'
  // Errors are set on blur/submit only — surface them once the user has engaged
  // (a pristine idle form shows none), so the underline stays calm until then.
  const showErrors = status !== 'idle'
  // A submit that failed for a non-field reason (network / rate-limit) has no
  // field to hang the message on, so show a form-level status line instead.
  const hasFieldErrors = Object.keys(errors).length > 0
  const showFormError = status === 'rate-limited' || (status === 'error' && !hasFieldErrors)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submit()
  }

  if (status === 'success') {
    return (
      <div className={styles.card}>
        <div className={styles.success} role="status" aria-live="polite">
          <h2 className={styles.successTitle}>{successTitle}</h2>
          <p className={styles.successBody}>{successBody}</p>
          <button type="button" className={styles.reset} onClick={reset}>
            {resetLabel}
          </button>
        </div>
      </div>
    )
  }

  const fieldError = (key: keyof ContactValues) =>
    showErrors && errors[key] ? errorText : ''

  return (
    <div className={styles.card}>
      <h2 className={styles.title} data-aos="fade-up">{title}</h2>

      <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label={title}>
        <input type="text" {...honeypotProps} style={HONEYPOT_STYLE} tabIndex={-1} aria-hidden="true" />

        {showFormError ? (
          <p className={styles.formError} role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div
          className={`${styles.field} ${fieldError('name') ? styles.hasError : ''}`}
          data-aos="fade-up"
          data-aos-delay="60"
        >
          <label className={styles.label} htmlFor="cf-name">
            {labelName}
          </label>
          <span className={styles.control}>
            <input
              id="cf-name"
              className={styles.input}
              type="text"
              autoComplete="name"
              aria-required="true"
              aria-invalid={fieldError('name') ? true : undefined}
              aria-describedby={fieldError('name') ? 'cf-name-error' : undefined}
              {...getFieldProps('name')}
            />
          </span>
          {fieldError('name') ? (
            <p className={styles.error} id="cf-name-error">
              {errorText}
            </p>
          ) : null}
        </div>

        <div className={styles.field} data-aos="fade-up" data-aos-delay="120">
          <label className={styles.label} htmlFor="cf-phone">
            {labelPhone}
          </label>
          <span className={styles.control}>
            <input
              id="cf-phone"
              className={styles.input}
              type="tel"
              autoComplete="tel"
              {...getFieldProps('phone')}
            />
          </span>
        </div>

        <div
          className={`${styles.field} ${fieldError('email') ? styles.hasError : ''}`}
          data-aos="fade-up"
          data-aos-delay="180"
        >
          <label className={styles.label} htmlFor="cf-email">
            {labelEmail}
          </label>
          <span className={styles.control}>
            <input
              id="cf-email"
              className={styles.input}
              type="email"
              autoComplete="email"
              aria-required="true"
              aria-invalid={fieldError('email') ? true : undefined}
              aria-describedby={fieldError('email') ? 'cf-email-error' : undefined}
              {...getFieldProps('email')}
            />
          </span>
          {fieldError('email') ? (
            <p className={styles.error} id="cf-email-error">
              {errorText}
            </p>
          ) : null}
        </div>

        <div
          className={`${styles.field} ${fieldError('message') ? styles.hasError : ''}`}
          data-aos="fade-up"
          data-aos-delay="240"
        >
          <label className={styles.label} htmlFor="cf-message">
            {labelMessage}
          </label>
          <span className={styles.control}>
            <textarea
              id="cf-message"
              className={styles.textarea}
              rows={4}
              placeholder={placeholderMessage}
              aria-required="true"
              aria-invalid={fieldError('message') ? true : undefined}
              aria-describedby={fieldError('message') ? 'cf-message-error' : undefined}
              {...getFieldProps('message')}
            />
          </span>
          {fieldError('message') ? (
            <p className={styles.error} id="cf-message-error">
              {errorText}
            </p>
          ) : null}
        </div>

        <div className={styles.actions} data-aos="fade-up" data-aos-delay="300">
          <button
            type="submit"
            className={`${styles.submit} mfx-shimmer`}
            disabled={isSubmitting}
          >
            {isSubmitting ? sendingLabel : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
