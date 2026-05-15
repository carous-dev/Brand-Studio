'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RefreshCw, ArrowRight, CheckCircle2, Banknote, ClipboardList, Send } from 'lucide-react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'
import styles from './page.module.css'

type PxValues = {
  reg: string
  mileage: string
  condition: string
  name: string
  email: string
  phone: string
  notes: string
}

const STEPS = [
  { icon: ClipboardList, title: 'Tell us about your car', body: 'Reg, mileage and a quick condition note.' },
  { icon: RefreshCw, title: 'We do the research', body: 'Live market data + our buying network.' },
  { icon: Banknote, title: 'Same-day quote', body: 'Honest offer with no obligation.' },
]

export default function PartExchangeIsland() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const [submitted, setSubmitted] = useState(false)
  const lead = useLeadsForm<PxValues>({
    initialValues: { reg: '', mileage: '', condition: 'Good', name: '', email: '', phone: '', notes: '' },
    leadType: 'part-exchange',
    leadSource: 'part-exchange-page',
    fieldConfig: {
      reg: { required: true },
      mileage: { required: true },
      name: { required: true },
      email: { required: true },
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await lead.submit()
    if (result.success) setSubmitted(true)
  }

  return (
    <article>
      <section className="shr-page-hero shr-page-hero--part-exchange">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Part Exchange</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            Swap your car. Drive away with the upgrade.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Competitive part-exchange values across all makes and models. Get a fair number
            today, and we&apos;ll match it against your next car on the forecourt.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.howItWorks}`}>
        <div className="shr-container">
          <div className="shr-section-head" data-aos="fade-up">
            <span className="shr-eyebrow">How it works</span>
            <h2 className="shr-section-head__title">Three steps to a fair offer.</h2>
          </div>
          <ol className={styles.steps}>
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <li key={step.title} data-aos="fade-up" data-aos-delay={`${i * 100}`}>
                  <span className={styles.stepNum}>0{i + 1}</span>
                  <span className={styles.stepIcon}><Icon size={22} strokeWidth={2.2} /></span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className={`shr-section shr-section--dark ${styles.formSection}`}>
        <div className="shr-container">
          <div className={styles.formLayout}>
            <div className={styles.formCopy} data-aos="fade-right">
              <span className="shr-eyebrow">Get a valuation</span>
              <h2 className={styles.formTitle}>Tell us about your car.</h2>
              <p className={styles.formLead}>
                Drop the basics below — we&apos;ll come back within one working day with a firm,
                no-obligation offer.
              </p>
              <ul className={styles.formAssurances}>
                <li><CheckCircle2 size={16} strokeWidth={2.2} aria-hidden /> Outstanding finance settled</li>
                <li><CheckCircle2 size={16} strokeWidth={2.2} aria-hidden /> Honest market pricing</li>
                <li><CheckCircle2 size={16} strokeWidth={2.2} aria-hidden /> Same-day decision</li>
              </ul>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} data-aos="fade-left" noValidate>
              {submitted ? (
                <div className={styles.success} role="status">
                  <CheckCircle2 size={48} strokeWidth={1.6} />
                  <h3>Got it.</h3>
                  <p>We&apos;ll review your details and get back to you within one working day.</p>
                </div>
              ) : (
                <>
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span>Registration *</span>
                      <input type="text" {...lead.getFieldProps('reg')} required aria-required="true" placeholder="e.g. AB12 CDE" />
                    </label>
                    <label className={styles.field}>
                      <span>Mileage *</span>
                      <input type="number" {...lead.getFieldProps('mileage')} required aria-required="true" placeholder="e.g. 45000" />
                    </label>
                    <label className={styles.field}>
                      <span>Condition</span>
                      <select {...lead.getFieldProps('condition')}>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Needs work">Needs work</option>
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Name *</span>
                      <input type="text" {...lead.getFieldProps('name')} required aria-required="true" />
                    </label>
                    <label className={styles.field}>
                      <span>Email *</span>
                      <input type="email" {...lead.getFieldProps('email')} required aria-required="true" />
                    </label>
                    <label className={styles.field}>
                      <span>Phone</span>
                      <input type="tel" {...lead.getFieldProps('phone')} />
                    </label>
                    <label className={`${styles.field} ${styles.fieldFull}`}>
                      <span>Notes</span>
                      <textarea rows={3} {...lead.getFieldProps('notes')} placeholder="Service history, modifications, dents…" />
                    </label>
                    <input type="text" {...lead.honeypotProps} aria-hidden tabIndex={-1} className={styles.honeypot} />
                  </div>
                  {lead.errorMessage ? <p className={styles.error} role="alert">{lead.errorMessage}</p> : null}
                  <button type="submit" className={`shr-btn-primary ${styles.submit}`} disabled={lead.status === 'submitting'}>
                    <Send size={16} strokeWidth={2.4} />
                    {lead.status === 'submitting' ? 'Sending…' : 'Get my offer'}
                    <ArrowRight size={16} strokeWidth={2.4} />
                  </button>
                </>
              )}
            </form>
          </div>

          <div className={styles.altCta}>
            {contact.phoneDisplay ? (
              <p>Prefer to chat? Call us on <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a></p>
            ) : (
              <p>Prefer to chat? Send the team a message.</p>
            )}
            <Link href="/used-cars" className="shr-btn-ghost-dark">Browse what we&apos;ve got</Link>
          </div>
        </div>
      </section>
    </article>
  )
}
