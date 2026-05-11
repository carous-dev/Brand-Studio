'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cookie, Shield, BarChart3, Megaphone, X } from 'lucide-react'
import useCookieConsent from '@/app/hooks/useCookieConsent'
import styles from './ShowroomCookieBanner.module.css'

export default function ShowroomCookieBanner() {
  const { visible, acceptAll, declineAll, savePreferences, dismiss } = useCookieConsent()
  const [details, setDetails] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(false)

  if (!visible) return null

  return (
    <div className={styles.cookieDock} role="dialog" aria-modal="false" aria-label="Cookie consent">
      <button
        type="button"
        className={styles.dockClose}
        aria-label="Dismiss cookie notice"
        onClick={dismiss}
      >
        <X size={16} strokeWidth={2.4} aria-hidden />
      </button>

      <div className={styles.dockHead}>
        <span className={styles.dockIcon} aria-hidden>
          <Cookie size={20} strokeWidth={2} />
        </span>
        <div className={styles.dockHeadText}>
          <p className={styles.dockTitle}>Garage cookies</p>
          <p className={styles.dockLead}>
            We use essential cookies to run the site. Analytics and marketing cookies
            help us improve your visit — pick what you&apos;re happy with.
          </p>
        </div>
      </div>

      {details ? (
        <div className={styles.toggles}>
          <label className={`${styles.toggleRow} ${styles.toggleRowLocked}`}>
            <Shield size={16} strokeWidth={2} aria-hidden />
            <span className={styles.toggleBody}>
              <span className={styles.toggleTitle}>Essential</span>
              <span className={styles.toggleHelp}>Required for the site to function. Always on.</span>
            </span>
            <span className={styles.toggleLocked}>Always</span>
          </label>
          <label className={styles.toggleRow}>
            <BarChart3 size={16} strokeWidth={2} aria-hidden />
            <span className={styles.toggleBody}>
              <span className={styles.toggleTitle}>Analytics</span>
              <span className={styles.toggleHelp}>Helps us understand what stock buyers look at.</span>
            </span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              aria-label="Allow analytics cookies"
              className={styles.toggleInput}
            />
          </label>
          <label className={styles.toggleRow}>
            <Megaphone size={16} strokeWidth={2} aria-hidden />
            <span className={styles.toggleBody}>
              <span className={styles.toggleTitle}>Marketing</span>
              <span className={styles.toggleHelp}>Lets us tailor offers and remarketing across the web.</span>
            </span>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              aria-label="Allow marketing cookies"
              className={styles.toggleInput}
            />
          </label>
        </div>
      ) : null}

      <div className={styles.dockActions}>
        {details ? (
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => savePreferences({ analytics, marketing })}
          >
            Save preferences
          </button>
        ) : (
          <button type="button" className={styles.btnPrimary} onClick={acceptAll}>
            Accept all
          </button>
        )}
        <button type="button" className={styles.btnSecondary} onClick={declineAll}>
          Reject all
        </button>
        <button
          type="button"
          className={styles.btnLink}
          onClick={() => setDetails((d) => !d)}
          aria-expanded={details}
        >
          {details ? 'Hide options' : 'Customise'}
        </button>
      </div>

      <p className={styles.dockFootnote}>
        See our <Link href="/cookie-policy">cookie policy</Link> for the full list.
      </p>
    </div>
  )
}
