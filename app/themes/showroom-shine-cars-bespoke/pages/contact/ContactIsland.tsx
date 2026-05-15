'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
import styles from './page.module.css'

type ContactFormValues = {
  name: string
  email: string
  phone: string
  message: string
}

function openingHoursLines(hours: unknown): string[] {
  if (!hours || typeof hours !== 'object') return ['Contact us for opening hours']
  const lines = Object.entries(hours as Record<string, unknown>)
    .map(([day, value]) => `${day}: ${String(value || '').trim()}`)
    .filter((line) => !line.endsWith(':'))
  return lines.length ? lines : ['Contact us for opening hours']
}

export default function ContactIsland() {
  const brand = useBrand()
  const brandName = brand?.name || 'this dealership'
  const contact = getBrandContactInfo(brand)
  const hours = openingHoursLines((brand as any)?.openingHours)

  const [submitted, setSubmitted] = useState(false)

  const lead = useLeadsForm<ContactFormValues>({
    initialValues: { name: '', email: '', phone: '', message: '' },
    leadType: 'contact',
    leadSource: 'contact-page',
    fieldConfig: {
      name: { required: true },
      email: { required: true },
      message: { required: true },
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await lead.submit()
    if (result.success) setSubmitted(true)
  }

  const nameProps = lead.getFieldProps('name')
  const emailProps = lead.getFieldProps('email')
  const phoneProps = lead.getFieldProps('phone')
  const messageProps = lead.getFieldProps('message')

  return (
    <article>
      <section className="shr-page-hero shr-page-hero--contact">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Contact</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            Need help? Talk to our team.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Stock, finance, valuations or sourcing: drop us a message or call and we will
            come back to you as soon as possible.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.contactBody}`}>
        <div className="shr-container">
          <div className={styles.layout}>
            <aside className={styles.details} data-aos="fade-right">
              <h2 className={styles.detailsTitle}>{brandName}</h2>
              <ul className={styles.detailList}>
                {contact.showroomAddress ? (
                  <li>
                    <MapPin size={18} strokeWidth={2.2} aria-hidden />
                    <div>
                      <span className={styles.detailLabel}>Address</span>
                      <p>{contact.showroomAddress}</p>
                    </div>
                  </li>
                ) : null}
                {contact.phoneDisplay ? (
                  <li>
                    <Phone size={18} strokeWidth={2.2} aria-hidden />
                    <div>
                      <span className={styles.detailLabel}>Call us</span>
                      <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a>
                    </div>
                  </li>
                ) : null}
                {contact.email ? (
                  <li>
                    <Mail size={18} strokeWidth={2.2} aria-hidden />
                    <div>
                      <span className={styles.detailLabel}>Email</span>
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </div>
                  </li>
                ) : null}
                <li>
                  <Clock size={18} strokeWidth={2.2} aria-hidden />
                  <div>
                    <span className={styles.detailLabel}>Opening hours</span>
                    {hours.slice(0, 4).map((line) => <p key={line}>{line}</p>)}
                    <p className={styles.detailNote}>Please confirm availability before travelling.</p>
                  </div>
                </li>
                {contact.whatsappUrl ? (
                  <li>
                    <WhatsAppIcon size={18} aria-hidden />
                    <div>
                      <span className={styles.detailLabel}>WhatsApp</span>
                      <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">Chat with us</a>
                    </div>
                  </li>
                ) : null}
              </ul>
            </aside>

            <form className={styles.form} onSubmit={handleSubmit} data-aos="fade-left" noValidate>
              {submitted ? (
                <div className={styles.success} role="status">
                  <CheckCircle2 size={48} strokeWidth={1.6} />
                  <h2>Message received.</h2>
                  <p>Thanks {String(lead.values.name).split(' ')[0]}, our team will reply within one working day.</p>
                </div>
              ) : (
                <>
                  <div className={styles.formHead}>
                    <span className="shr-eyebrow">Send a message</span>
                    <h2 className={styles.formTitle}>Drop us a line.</h2>
                  </div>
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span>Name *</span>
                      <input
                        type="text"
                        {...nameProps}
                        required
                        aria-required="true"
                        aria-invalid={Boolean(lead.errors.name)}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Email *</span>
                      <input
                        type="email"
                        {...emailProps}
                        required
                        aria-required="true"
                        aria-invalid={Boolean(lead.errors.email)}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Phone</span>
                      <input type="tel" {...phoneProps} />
                    </label>
                    <label className={`${styles.field} ${styles.fieldFull}`}>
                      <span>Message *</span>
                      <textarea
                        rows={5}
                        {...messageProps}
                        required
                        aria-required="true"
                        aria-invalid={Boolean(lead.errors.message)}
                      />
                    </label>
                    <input type="text" {...lead.honeypotProps} aria-hidden tabIndex={-1} className={styles.honeypot} />
                  </div>
                  {lead.errorMessage ? (
                    <p className={styles.error} role="alert">{lead.errorMessage}</p>
                  ) : null}
                  <button
                    type="submit"
                    className={`shr-btn-primary ${styles.submit}`}
                    disabled={lead.status === 'submitting'}
                  >
                    <Send size={16} strokeWidth={2.4} />
                    {lead.status === 'submitting' ? 'Sending...' : 'Send message'}
                  </button>
                  <p className={styles.formFootnote}>
                    By submitting, you agree to be contacted by our team about your enquiry.
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      </section>
    </article>
  )
}
