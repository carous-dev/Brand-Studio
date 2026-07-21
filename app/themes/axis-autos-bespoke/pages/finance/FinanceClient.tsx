'use client'

import { useState, FormEvent, useMemo } from 'react'
import { ArrowRight, Calculator } from 'lucide-react'
import { useBrand } from '../../context/BrandClientWrapper'
import { apiUrl } from '../../lib/api'
import styles from './page.module.css'

const fmtGbp = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

export default function FinanceClient() {
  const brand = useBrand()

  const [price, setPrice] = useState(15000)
  const [deposit, setDeposit] = useState(2000)
  const [term, setTerm] = useState(48)
  const [apr, setApr] = useState(11.9)

  const { monthly, totalPayable } = useMemo(() => {
    const principal = Math.max(0, price - deposit)
    const monthlyRate = apr / 100 / 12
    const denom = 1 - Math.pow(1 + monthlyRate, -term)
    const m = monthlyRate > 0 && denom > 0 ? (principal * monthlyRate) / denom : principal / Math.max(term, 1)
    return {
      monthly: Math.round(m),
      totalPayable: Math.round(m * term + deposit),
    }
  }, [price, deposit, term, apr])

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setStatus('sending')
    try {
      const payload = {
        name: String(fd.get('name') || ''),
        email: String(fd.get('email') || ''),
        phone: String(fd.get('phone') || ''),
        message: String(fd.get('message') || ''),
        leadType: 'finance',
        finance: { price, deposit, term, apr, monthly },
        brandSlug: brand?.slug || '',
      }
      const res = await fetch(apiUrl('/leads'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <section className="axis-page-hero axis-page-hero--finance">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">Finance</span>
          <h1 className="axis-page-hero-title">Spread the cost. Without the small print.</h1>
          <p className="axis-page-hero-lead">
            We work with a panel of independent lenders to find the right plan for your budget. Hire purchase or PCP,
            from 24 to 60 months. No setup fees. No surprises.
          </p>
        </div>
      </section>

      <section className="axis-section">
        <div className="axis-shell">
          <div className={styles.grid}>
            <div className={styles.calc} data-aos="fade-up">
              <header className={styles.calcHeader}>
                <span className={styles.iconBox} aria-hidden="true"><Calculator size={20} strokeWidth={1.6} /></span>
                <div>
                  <span className="axis-eyebrow">Calculator</span>
                  <h2 className={styles.h2}>Estimate your monthly payment.</h2>
                </div>
              </header>

              <div className={styles.field}>
                <label className="axis-label" htmlFor="price">Car price <span className={styles.fieldValue}>{fmtGbp(price)}</span></label>
                <input id="price" type="range" min={2000} max={60000} step={500} value={price} onChange={(e) => setPrice(Number(e.target.value))} className={styles.range} />
              </div>
              <div className={styles.field}>
                <label className="axis-label" htmlFor="deposit">Deposit <span className={styles.fieldValue}>{fmtGbp(deposit)}</span></label>
                <input id="deposit" type="range" min={0} max={Math.min(price, 30000)} step={250} value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} className={styles.range} />
              </div>
              <div className={styles.field}>
                <label className="axis-label" htmlFor="term">Term <span className={styles.fieldValue}>{term} months</span></label>
                <input id="term" type="range" min={24} max={60} step={6} value={term} onChange={(e) => setTerm(Number(e.target.value))} className={styles.range} />
              </div>
              <div className={styles.field}>
                <label className="axis-label" htmlFor="apr">Representative APR <span className={styles.fieldValue}>{apr.toFixed(1)}%</span></label>
                <input id="apr" type="range" min={4.9} max={24.9} step={0.5} value={apr} onChange={(e) => setApr(Number(e.target.value))} className={styles.range} />
              </div>

              <div className={styles.result}>
                <div>
                  <span className={styles.resultLabel}>Estimated monthly</span>
                  <span className={styles.resultValue}>{fmtGbp(monthly)}<small>/mo</small></span>
                </div>
                <div>
                  <span className={styles.resultLabel}>Total payable</span>
                  <span className={styles.resultValueSmall}>{fmtGbp(totalPayable)}</span>
                </div>
              </div>
              <p className={styles.disclaimer}>
                For illustration only. Subject to status and lender criteria. {brand?.name || 'We'} is a credit broker, not a lender.
              </p>
            </div>

            <form className={styles.lead} onSubmit={onSubmit} aria-label="Finance enquiry form" data-aos="fade-up" data-aos-delay="80">
              <h2 className={styles.h2}>Get a personal quote.</h2>
              <p className={styles.leadIntro}>Fill in your details and we'll be in touch within one working hour with a tailored quote.</p>
              <div className={styles.formField}>
                <label className="axis-label" htmlFor="fname">Name</label>
                <input className="axis-input" id="fname" name="name" required autoComplete="name" />
              </div>
              <div className={styles.formField}>
                <label className="axis-label" htmlFor="femail">Email</label>
                <input className="axis-input" type="email" id="femail" name="email" required autoComplete="email" />
              </div>
              <div className={styles.formField}>
                <label className="axis-label" htmlFor="fphone">Phone</label>
                <input className="axis-input" type="tel" id="fphone" name="phone" required autoComplete="tel" />
              </div>
              <div className={styles.formField}>
                <label className="axis-label" htmlFor="fmessage">Anything we should know?</label>
                <textarea className="axis-input" id="fmessage" name="message" rows={3} />
              </div>
              <button type="submit" className="axis-btn axis-btn--primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Request a quote'}
                <ArrowRight size={16} strokeWidth={1.8} />
              </button>
              {status === 'sent' ? <p className={styles.success} role="status">Thanks — we'll be in touch shortly with your tailored quote.</p> : null}
              {status === 'error' ? <p className={styles.error} role="alert">Sorry, that didn't send. Please try again or call us directly.</p> : null}
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
