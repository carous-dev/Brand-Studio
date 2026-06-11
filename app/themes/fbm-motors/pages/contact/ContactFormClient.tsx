'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import styles from './page.module.css'

export default function ContactFormClient() {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div className={styles.formCard}>
        <div className={styles.sent}>
          <span className={styles.sentIcon} aria-hidden>
            <Mail size={26} strokeWidth={1.6} />
          </span>
          <h2 className={styles.sentTitle}>Message sent</h2>
          <p className={styles.sentBody}>Thanks — we&apos;ve got it. Expect a reply within one working day.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.formCard}>
      <form
        className={styles.formGrid}
        onSubmit={(e) => {
          e.preventDefault()
          setSent(true)
        }}
      >
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="c-name">Full name</label>
            <input id="c-name" className="fbm-field" placeholder="Your name" />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="c-phone">Phone</label>
            <input id="c-phone" type="tel" className="fbm-field" placeholder="07…" />
          </div>
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="c-email">Email</label>
          <input id="c-email" type="email" className="fbm-field" placeholder="you@example.com" />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="c-subject">I&apos;m interested in</label>
          <select id="c-subject" className="fbm-field">
            {['Buying a car', 'Selling my car', 'Part exchange', 'Finance', 'Something else'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="c-message">Message</label>
          <textarea id="c-message" rows={5} className={`fbm-field ${styles.formResize}`} placeholder="Tell us what you're after…" />
        </div>
        <button type="submit" className={`fbm-btn-primary ${styles.formSubmit}`}>
          Send message
        </button>
      </form>
    </div>
  )
}
