'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import type { BrandConfig } from '@/brands/types'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { resolveText } from '../lib/brand-text'
import CanvasFX from '@/app/widgets/CanvasFX/CanvasFX'
import LedgerSteps, { type LedgerStep } from './LedgerSteps'
import styles from './SellPxForm.module.css'

/**
 * SellPxForm — the sell / part-exchange lead section for /sell-my-car and
 * /part-exchange (design-language §7: section on `bg`, PX variant differs only
 * in copy). One component, two variants via the `variant` prop the route passes;
 * identical layout.
 *
 * Unique move (spec §"Unique move"): a two-part ledger entry. The form card
 * leads with an oversized UK-reg-plate-styled input (wide, centered, letterspaced
 * — styled with surface/bg/border tokens, NEVER plate-yellow) above a mileage
 * field, then the ledger-underline contact fields (name/phone/email) reusing
 * component 14's ruled-page grammar (duplicated locally — never cross-import
 * another page's module). Beside it, LedgerSteps recasts the proof-ledger's
 * numbered-serif motif as steps 01–03 (satisfies do-not §5: replaces, not joins,
 * a proof-ledger on the route).
 *
 * Wiring (orchestrator brief): shared `useLeadsForm` drives submit + honeypot +
 * rate-limit + idle/submitting/success/error states. The reg field is required
 * and normalised to uppercase in state (CSS also uppercases the display, scoped
 * to this input only per AC6); mileage/name/phone required, email optional but
 * format-checked when filled. An empty/invalid submit focuses and scrolls the
 * first invalid field into view. On success the card swaps to a warm thank-you.
 *
 * Tokens (spec §Tokens, build-rules §2): section + card paired
 * surface/bg/text; reg input `--color-bg`/`--color-text`/`--color-border` →
 * focus `--color-primary`; underline fields `--color-border` → focus
 * `--color-primary`; submit `--color-primary`/`--color-on-primary`; validation
 * uses `--t-error`, success `--t-success`. Zero literals — legible on the claret
 * palette AND a light throwaway brand.
 */

type SellPxVariant = 'sell' | 'px'

type SellPxFormProps = {
  brand: BrandConfig | null | undefined
  variant: SellPxVariant
}

type SellValues = {
  reg: string
  mileage: string
  name: string
  phone: string
  email: string
}

const INITIAL: SellValues = { reg: '', mileage: '', name: '', phone: '', email: '' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Required flags + a light email-format check that tolerates an empty value
// (email is optional — a phone alone is enough for a valuation callback).
const FIELD_CONFIG = {
  reg: { required: true },
  mileage: { required: true },
  name: { required: true },
  phone: { required: true },
  email: {
    validate: (value: SellValues[keyof SellValues]) => {
      const trimmed = String(value).trim()
      if (trimmed === '') return null
      return EMAIL_RE.test(trimmed) ? null : 'invalid'
    },
  },
} as const

// Order the first-invalid-field focus walk follows (matches DOM order).
const FIELD_ORDER: (keyof SellValues)[] = ['reg', 'mileage', 'name', 'phone', 'email']

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

export default function SellPxForm({ brand, variant }: SellPxFormProps) {
  const isPx = variant === 'px'

  const { values, getFieldProps, setFieldValue, errors, status, errorMessage, submit, reset, honeypotProps } =
    useLeadsForm<SellValues>({
      initialValues: INITIAL,
      leadType: isPx ? 'part-exchange' : 'sell-car',
      leadSource: isPx ? 'part-exchange-page' : 'sell-my-car-page',
      fieldConfig: FIELD_CONFIG,
    })

  const formRef = useRef<HTMLFormElement>(null)

  // Copy — variant differs only in title + step-3 body (design-language §7 /
  // spec §"Copy keys"). Shared field labels + states reuse the generic
  // enquiry.* keys so no duplicate keys are minted.
  const title = resolveText(brand, isPx ? 'px_form.title' : 'sell.title')
  const labelReg = resolveText(brand, 'sell.label_reg')
  const placeholderReg = resolveText(brand, 'sell.placeholder_reg')
  const labelMileage = resolveText(brand, 'sell.label_mileage')
  const labelName = resolveText(brand, 'enquiry.label_name')
  const labelPhone = resolveText(brand, 'enquiry.label_phone')
  const labelEmail = resolveText(brand, 'enquiry.label_email')
  const submitLabel = resolveText(brand, 'sell.submit')
  const sendingLabel = resolveText(brand, 'enquiry.sending')
  const errorText = resolveText(brand, 'enquiry.error')
  const successTitle = resolveText(brand, 'enquiry.success_title')
  const successBody = resolveText(brand, 'enquiry.success_body')
  const resetLabel = resolveText(brand, 'enquiry.success_reset')
  const stepsTitleSr = resolveText(brand, 'sell.steps_title_sr')

  const steps: LedgerStep[] = [
    {
      title: resolveText(brand, 'sell.step_1_title'),
      body: resolveText(brand, 'sell.step_1_body'),
    },
    {
      title: resolveText(brand, 'sell.step_2_title'),
      body: resolveText(brand, 'sell.step_2_body'),
    },
    {
      title: resolveText(brand, 'sell.step_3_title'),
      body: resolveText(brand, isPx ? 'px_form.step_3_body_px' : 'sell.step_3_body'),
    },
  ]

  const isSubmitting = status === 'submitting'
  // Errors surface once the user has engaged (blur/submit) — a pristine idle
  // form stays calm.
  const showErrors = status !== 'idle'
  const hasFieldErrors = Object.keys(errors).length > 0
  const showFormError = status === 'rate-limited' || (status === 'error' && !hasFieldErrors)

  // Empty/invalid submit → focus + scroll the first invalid field into view
  // (spec §States). Runs after the render that set aria-invalid.
  useEffect(() => {
    if (status !== 'error' || !hasFieldErrors) return
    const firstInvalid = FIELD_ORDER.find((key) => errors[key])
    if (!firstInvalid) return
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
    if (el) {
      el.focus({ preventScroll: true })
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [status, errors, hasFieldErrors])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submit()
  }

  const fieldError = (key: keyof SellValues) => (showErrors && errors[key] ? errorText : '')

  const regProps = getFieldProps('reg')

  return (
    <section className={styles.section} aria-label={title}>
      {/* Furnishing (luxury→refined): the same soft brand-light canvas the hero
          / proof-ledger / visit bands carry, faint (density 0.4) for warm
          continuity behind the ledger form. Self-guards — static token wash
          under reduced-motion / ≤640px, pauses off-screen. Decorative +
          aria-hidden. */}
      <CanvasFX variant="aurora-light" density={0.4} className={styles.aurora} />
      <div className={styles.inner}>
        <div className={styles.grid}>
          {status === 'success' ? (
            <div className={styles.card}>
              <div className={styles.successState} role="status" aria-live="polite">
                <h2 className={styles.successTitle}>{successTitle}</h2>
                <p className={styles.successBody}>{successBody}</p>
                <button type="button" className={styles.reset} onClick={reset}>
                  {resetLabel}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.card} data-aos="fade-up">
              <h2 className={styles.title} data-aos="fade-up">
                {title}
              </h2>

              <form
                ref={formRef}
                className={styles.form}
                onSubmit={handleSubmit}
                noValidate
                aria-label={title}
              >
                <input
                  type="text"
                  {...honeypotProps}
                  style={HONEYPOT_STYLE}
                  tabIndex={-1}
                  aria-hidden="true"
                />

                {showFormError ? (
                  <p className={styles.formError} role="alert">
                    {errorMessage}
                  </p>
                ) : null}

                {/* Reg plate — the oversized letterspaced lead field. */}
                <div
                  className={`${styles.regField} ${fieldError('reg') ? styles.hasError : ''}`}
                  data-aos="fade-up"
                  data-aos-delay="80"
                >
                  <label className={styles.label} htmlFor="spx-reg">
                    {labelReg}
                  </label>
                  <input
                    id="spx-reg"
                    className={styles.regInput}
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    placeholder={placeholderReg}
                    aria-required="true"
                    aria-invalid={fieldError('reg') ? true : undefined}
                    aria-describedby={fieldError('reg') ? 'spx-reg-error' : undefined}
                    name={regProps.name}
                    value={regProps.value}
                    onBlur={regProps.onBlur}
                    onChange={(event) =>
                      setFieldValue('reg', event.target.value.toUpperCase() as SellValues['reg'])
                    }
                  />
                  {fieldError('reg') ? (
                    <p className={styles.error} id="spx-reg-error">
                      {errorText}
                    </p>
                  ) : null}
                </div>

                <div className={styles.underlineFields} data-aos="fade-up" data-aos-delay="160">
                  <div className={`${styles.field} ${fieldError('mileage') ? styles.hasError : ''}`}>
                    <label className={styles.label} htmlFor="spx-mileage">
                      {labelMileage}
                    </label>
                    <input
                      id="spx-mileage"
                      className={styles.input}
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-required="true"
                      aria-invalid={fieldError('mileage') ? true : undefined}
                      aria-describedby={fieldError('mileage') ? 'spx-mileage-error' : undefined}
                      {...getFieldProps('mileage')}
                    />
                    {fieldError('mileage') ? (
                      <p className={styles.error} id="spx-mileage-error">
                        {errorText}
                      </p>
                    ) : null}
                  </div>

                  <div className={`${styles.field} ${fieldError('name') ? styles.hasError : ''}`}>
                    <label className={styles.label} htmlFor="spx-name">
                      {labelName}
                    </label>
                    <input
                      id="spx-name"
                      className={styles.input}
                      type="text"
                      autoComplete="name"
                      aria-required="true"
                      aria-invalid={fieldError('name') ? true : undefined}
                      aria-describedby={fieldError('name') ? 'spx-name-error' : undefined}
                      {...getFieldProps('name')}
                    />
                    {fieldError('name') ? (
                      <p className={styles.error} id="spx-name-error">
                        {errorText}
                      </p>
                    ) : null}
                  </div>

                  <div className={`${styles.field} ${fieldError('phone') ? styles.hasError : ''}`}>
                    <label className={styles.label} htmlFor="spx-phone">
                      {labelPhone}
                    </label>
                    <input
                      id="spx-phone"
                      className={styles.input}
                      type="tel"
                      autoComplete="tel"
                      aria-required="true"
                      aria-invalid={fieldError('phone') ? true : undefined}
                      aria-describedby={fieldError('phone') ? 'spx-phone-error' : undefined}
                      {...getFieldProps('phone')}
                    />
                    {fieldError('phone') ? (
                      <p className={styles.error} id="spx-phone-error">
                        {errorText}
                      </p>
                    ) : null}
                  </div>

                  <div className={`${styles.field} ${fieldError('email') ? styles.hasError : ''}`}>
                    <label className={styles.label} htmlFor="spx-email">
                      {labelEmail}
                    </label>
                    <input
                      id="spx-email"
                      className={styles.input}
                      type="email"
                      autoComplete="email"
                      aria-invalid={fieldError('email') ? true : undefined}
                      aria-describedby={fieldError('email') ? 'spx-email-error' : undefined}
                      {...getFieldProps('email')}
                    />
                    {fieldError('email') ? (
                      <p className={styles.error} id="spx-email-error">
                        {errorText}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className={styles.actions} data-aos="fade-up" data-aos-delay="220">
                  <button type="submit" className={styles.submit} disabled={isSubmitting}>
                    {isSubmitting ? sendingLabel : submitLabel}
                  </button>
                </div>
              </form>
            </div>
          )}

          <LedgerSteps titleSr={stepsTitleSr} steps={steps} className={styles.rail} />
        </div>
      </div>
    </section>
  )
}
