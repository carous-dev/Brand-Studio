'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './ValuationForm.module.css'

export default function ValuationForm({
  ctaLabel = 'Get valuation',
  leadType = 'sell-my-car',
}: {
  ctaLabel?: string
  leadType?: 'sell-my-car' | 'part-exchange'
}) {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const [reg, setReg] = useState('')
  const [mileage, setMileage] = useState('')
  const [contactValue, setContactValue] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!contact.email) return
    const subject = encodeURIComponent(`${leadType === 'part-exchange' ? 'Part-exchange' : 'Sell-my-car'} enquiry — ${reg}`)
    const body = encodeURIComponent(
      `Lead type: ${leadType}\nRegistration: ${reg}\nMileage: ${mileage}\nContact: ${contactValue}`
    )
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`
  }

  if (submitted) {
    return (
      <div className={styles.success}>
        <h3>Thanks — request received</h3>
        <p>We'll come back to you with a guide price as soon as we can.</p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={submit} aria-label={ctaLabel}>
      <label className={styles.regField}>
        <span>Your registration</span>
        <div className={styles.regWrap}>
          <span className={styles.regFlag} aria-hidden>GB</span>
          <input
            required
            value={reg}
            onChange={(e) => setReg(e.target.value.toUpperCase())}
            placeholder="YOUR REG"
            maxLength={10}
          />
        </div>
      </label>

      <label className={styles.field}>
        <span>Mileage</span>
        <input
          required
          type="number"
          inputMode="numeric"
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
          placeholder="e.g. 45,000"
          min={0}
        />
      </label>

      <label className={styles.field}>
        <span>Phone or email</span>
        <input
          required
          type="text"
          value={contactValue}
          onChange={(e) => setContactValue(e.target.value)}
          placeholder="So we can come back to you"
        />
      </label>

      <button type="submit" className={styles.submit}>
        {ctaLabel}
        <ArrowRight size={16} strokeWidth={2.4} aria-hidden />
      </button>
    </form>
  )
}
