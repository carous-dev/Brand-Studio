'use client'

import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { Mail, Phone, Send, X, CheckCircle2 } from 'lucide-react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
import styles from './EnquiryModal.module.css'

/**
 * Brandstudio global widget — vehicle / general enquiry modal.
 * =============================================================================
 *
 * Replaces per-theme inline enquiry forms on vehicle detail pages, contact
 * cards, and "request a callback" surfaces. Modeled after the modal pattern
 * used by carous-platform's vehicle apps (huntsmotors / csmotors etc.).
 *
 * Why modal, not inline:
 *  - Buyers scrolling a vehicle detail page don't want to scroll past a long
 *    inline form to reach the next section. A floating CTA + modal keeps the
 *    page scannable and the form focused when invoked.
 *  - The modal can be triggered from multiple call-out points (sticky sidebar,
 *    sticky mobile bar, hero CTA, gallery overlay) and reuses the same form
 *    state — no duplication of validation logic across the page.
 *  - Modal pattern matches how dealers expect the enquiry surface to feel
 *    (parity with carous-platform vehicle apps and most modern dealer sites).
 *
 * Usage:
 *   import { EnquiryModal, useEnquiryModal } from '@/app/widgets/EnquiryModal'
 *
 *   function VehicleDetailPage() {
 *     const { isOpen, open, close } = useEnquiryModal()
 *     const brand = useBrand()
 *     const contact = getBrandContactInfo(brand)
 *     return (
 *       <>
 *         <button onClick={open}>Enquire about this vehicle</button>
 *         <EnquiryModal
 *           open={isOpen}
 *           onClose={close}
 *           subject={`Enquiry: ${vehicleTitle}`}
 *           contact={contact}
 *           leadType="vehicle-enquiry"
 *           leadSource="vehicle-detail-modal"
 *           hiddenFields={{ vehicle: vehicleTitle, url: window.location.href }}
 *         />
 *       </>
 *     )
 *   }
 *
 * The modal is theme-agnostic and consumes brand tokens (`var(--color-*)`) so
 * each theme's primary / accent / surface colours retint it automatically.
 */

export type EnquiryContact = {
  phoneTel?: string
  phoneDisplay?: string
  email?: string
  whatsappUrl?: string
}

export type EnquiryModalProps = {
  open: boolean
  onClose: () => void
  /** Heading shown at the top of the modal. */
  subject?: string
  /** Optional intro paragraph below the heading. */
  intro?: string
  /** Brand contact details — used to render Call / WhatsApp / Email side-buttons. */
  contact?: EnquiryContact
  /** Lead type for `useLeadsForm` (e.g. 'vehicle-enquiry', 'contact'). */
  leadType?: string
  /** Lead source for analytics (e.g. 'vehicle-detail-modal'). */
  leadSource?: string
  /** Hidden fields (vehicle title, URL, vehicle id) included in the lead payload. */
  hiddenFields?: Record<string, string>
  /** Optional override for the submit button label. */
  submitLabel?: string
  /** Optional override for the success heading. */
  successHeading?: string
  /** Optional override for the success body copy. */
  successBody?: string
  /** Side panel content (e.g. trust signals, dealer logo, opening hours). */
  sidePanel?: ReactNode
}

type Values = {
  name: string
  email: string
  phone: string
  message: string
  __hiddenSerialized: string
}

export function EnquiryModal({
  open,
  onClose,
  subject = 'Send an enquiry',
  intro = 'Tell us when you’d like to come and view, or anything you’d like to know. We typically reply within minutes during showroom hours.',
  contact,
  leadType = 'vehicle-enquiry',
  leadSource = 'enquiry-modal',
  hiddenFields,
  submitLabel = 'Send enquiry',
  successHeading = 'Enquiry received',
  successBody = 'Thanks — the showroom team will be in touch during opening hours.',
  sidePanel,
}: EnquiryModalProps) {
  const dialogId = useId()
  const initialFocusRef = useRef<HTMLInputElement | null>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const form = useLeadsForm<Values>({
    initialValues: {
      name: '', email: '', phone: '', message: '',
      __hiddenSerialized: hiddenFields ? JSON.stringify(hiddenFields) : '',
    },
    leadType,
    leadSource,
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (v) => (/\S+@\S+\.\S+/.test(String(v || '')) ? null : 'Please enter a valid email.'),
      },
      phone: { required: true },
      message: { required: true },
    },
    buildPayload: (values, meta) => ({
      leadData: {
        leadType,
        leadSource,
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: values.message,
        ...(hiddenFields || {}),
        formTs: meta.formTs,
        [meta.honeypotField]: meta.honeypotValue,
      },
    }),
  })

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSubmitted(false)
      restoreFocusRef.current = (typeof document !== 'undefined' ? document.activeElement : null) as HTMLElement | null
      // Focus first input on next tick
      setTimeout(() => initialFocusRef.current?.focus(), 80)
    } else if (restoreFocusRef.current) {
      restoreFocusRef.current.focus?.()
      restoreFocusRef.current = null
    }
  }, [open])

  // Lock body scroll while modal is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Escape closes
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const r = await form.submit()
    if (r.success) setSubmitted(true)
  }, [form])

  if (!open) return null

  return (
    <div
      className={styles.root}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${dialogId}-title`}
      aria-describedby={`${dialogId}-intro`}
    >
      {/* audit-ignore: a11y-div-as-button — backdrop overlay; the dialog itself has Escape + close button */}
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={styles.dialog} data-has-side={sidePanel ? 'true' : 'false'}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close enquiry"
        >
          <X size={18} strokeWidth={2.4} />
        </button>

        <div className={styles.layout}>
          <div className={styles.formCol}>
            <header className={styles.header}>
              <p className={styles.eyebrow}>Enquiry</p>
              <h2 id={`${dialogId}-title`} className={styles.title}>{subject}</h2>
              {intro ? <p id={`${dialogId}-intro`} className={styles.intro}>{intro}</p> : null}
            </header>

            {submitted ? (
              <div className={styles.success} role="status" aria-live="polite">
                <CheckCircle2 size={36} strokeWidth={2} aria-hidden="true" />
                <h3 className={styles.successHeading}>{successHeading}</h3>
                <p className={styles.successBody}>{successBody}</p>
                <div className={styles.successActions}>
                  {contact?.phoneTel ? (
                    <a className={styles.successCall} href={`tel:${contact.phoneTel}`}>
                      <Phone size={16} strokeWidth={2.4} aria-hidden="true" />
                      Call {contact.phoneDisplay || contact.phoneTel}
                    </a>
                  ) : null}
                  <button type="button" className={styles.successClose} onClick={onClose}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <input type="text" {...form.honeypotProps} className={styles.honeypot} aria-hidden="true" tabIndex={-1} />

                <div className={styles.fieldsGrid}>
                  <div className={styles.field}>
                    <label htmlFor={`${dialogId}-name`} className={styles.fieldLabel}>Full name</label>
                    <input
                      id={`${dialogId}-name`}
                      ref={initialFocusRef}
                      type="text"
                      autoComplete="name"
                      required
                      aria-required="true"
                      aria-invalid={Boolean(form.errors.name)}
                      className={styles.input}
                      {...form.getFieldProps('name')}
                    />
                    {form.errors.name ? <span className={styles.fieldError}>{form.errors.name}</span> : null}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor={`${dialogId}-email`} className={styles.fieldLabel}>Email</label>
                    <input
                      id={`${dialogId}-email`}
                      type="email"
                      autoComplete="email"
                      required
                      aria-required="true"
                      aria-invalid={Boolean(form.errors.email)}
                      className={styles.input}
                      {...form.getFieldProps('email')}
                    />
                    {form.errors.email ? <span className={styles.fieldError}>{form.errors.email}</span> : null}
                  </div>
                  <div className={`${styles.field} ${styles.fieldWide}`}>
                    <label htmlFor={`${dialogId}-phone`} className={styles.fieldLabel}>Phone</label>
                    <input
                      id={`${dialogId}-phone`}
                      type="tel"
                      autoComplete="tel"
                      required
                      aria-required="true"
                      aria-invalid={Boolean(form.errors.phone)}
                      className={styles.input}
                      {...form.getFieldProps('phone')}
                    />
                    {form.errors.phone ? <span className={styles.fieldError}>{form.errors.phone}</span> : null}
                  </div>
                  <div className={`${styles.field} ${styles.fieldWide}`}>
                    <label htmlFor={`${dialogId}-message`} className={styles.fieldLabel}>Message</label>
                    <textarea
                      id={`${dialogId}-message`}
                      rows={4}
                      required
                      aria-required="true"
                      aria-invalid={Boolean(form.errors.message)}
                      className={styles.textarea}
                      placeholder="When would you like to view? Any specific questions about the vehicle?"
                      {...form.getFieldProps('message')}
                    />
                    {form.errors.message ? <span className={styles.fieldError}>{form.errors.message}</span> : null}
                  </div>
                </div>

                {form.status === 'error' && form.errorMessage ? (
                  <p className={styles.formError} role="alert">{form.errorMessage}</p>
                ) : null}

                <div className={styles.actions}>
                  <button
                    type="submit"
                    className={`${styles.submit} mfx-shimmer`}
                    disabled={form.status === 'submitting'}
                  >
                    {form.status === 'submitting' ? 'Sending…' : (
                      <>
                        {submitLabel}
                        <Send size={16} strokeWidth={2.4} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>

                <p className={styles.note}>
                  By submitting you agree to our{' '}
                  <a className={styles.noteLink} href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                    privacy policy
                  </a>
                  .
                </p>
              </form>
            )}

            {/* Inline contact rail — only renders when no custom sidePanel is
                provided AND we have at least one direct-contact channel. Keeps
                the modal single-column without losing the alternative-contact
                affordance the dual-panel layout used to surface. */}
            {!sidePanel && !submitted && contact && (contact.phoneTel || contact.email || contact.whatsappUrl) ? (
              <div className={styles.contactRail} aria-label="Other ways to reach us">
                <span className={styles.contactRailLabel}>Or reach us directly</span>
                <div className={styles.contactRailChips}>
                  {contact.phoneTel ? (
                    <a className={styles.contactChip} href={`tel:${contact.phoneTel}`}>
                      <Phone size={14} strokeWidth={2.4} aria-hidden="true" />
                      <span>{contact.phoneDisplay || contact.phoneTel}</span>
                    </a>
                  ) : null}
                  {contact.whatsappUrl ? (
                    <a
                      className={`${styles.contactChip} ${styles.contactChipWa}`}
                      href={contact.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon size={14} />
                      <span>WhatsApp</span>
                    </a>
                  ) : null}
                  {contact.email ? (
                    <a className={styles.contactChip} href={`mailto:${contact.email}`}>
                      <Mail size={14} strokeWidth={2.4} aria-hidden="true" />
                      <span>Email</span>
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {sidePanel ? (
            <aside className={styles.sideCol} aria-label="Contact options">
              {sidePanel}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * Convenience hook for managing modal state.
 *
 *   const { isOpen, open, close, toggle } = useEnquiryModal()
 */
export function useEnquiryModal() {
  const [isOpen, setIsOpen] = useState(false)
  return {
    isOpen,
    open: useCallback(() => setIsOpen(true), []),
    close: useCallback(() => setIsOpen(false), []),
    toggle: useCallback(() => setIsOpen((prev) => !prev), []),
  }
}

export default EnquiryModal
