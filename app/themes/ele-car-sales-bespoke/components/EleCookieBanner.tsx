'use client'

import { useEffect, useRef, useState } from 'react'
import { Cookie, X } from 'lucide-react'
import styles from './EleCookieBanner.module.css'

/**
 * ELE Car Sales — bespoke cookie consent.
 *
 * Diverges from the shared `app/widgets/CookieBanner` deliberately:
 *  - Slide-up corner card on desktop (not full-width sticky bar).
 *  - Inline chip-style toggles (analytics / marketing); no separate settings
 *    modal — every choice surfaces on the card.
 *  - Brand-token-driven, ELE-themed.
 *
 * The consent payload shape is compatible with the shared widget so a future
 * "consolidated consent log" reads either source.
 */

type CookiePrefs = {
  analytics: boolean
  marketing: boolean
}

type EleCookieBannerProps = {
  brandSlug?: string
  cookiePolicyHref?: string
}

const DEFAULT_PREFS: CookiePrefs = { analytics: false, marketing: false }

export default function EleCookieBanner({
  brandSlug,
  cookiePolicyHref = '/cookie-policy',
}: EleCookieBannerProps) {
  const storageKey = `${brandSlug || 'brand'}_cookie_consent`
  const [visible, setVisible] = useState(false)
  const [prefs, setPrefs] = useState<CookiePrefs>(DEFAULT_PREFS)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) {
      setVisible(true)
      return
    }
    try {
      const parsed = JSON.parse(stored) as { prefs?: CookiePrefs }
      if (parsed?.prefs) {
        setPrefs({ ...DEFAULT_PREFS, ...parsed.prefs })
      }
    } catch {
      setVisible(true)
    }
  }, [storageKey])

  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible])

  const savePrefs = (next: CookiePrefs) => {
    setPrefs(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ prefs: next, updatedAt: new Date().toISOString() }),
      )
    }
    setVisible(false)
  }

  const acceptAll = () => savePrefs({ analytics: true, marketing: true })
  const declineAll = () => savePrefs({ analytics: false, marketing: false })
  const togglePref = (key: keyof CookiePrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!visible) return null

  return (
    <div
      className={styles.root}
      role="dialog"
      aria-modal="false"
      aria-labelledby="ele-cookie-title"
    >
      <div className={styles.card}>
        <div className={styles.glow} aria-hidden="true" />
        <button
          ref={closeBtnRef}
          type="button"
          className={styles.close}
          aria-label="Dismiss cookie banner"
          onClick={declineAll}
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div className={styles.headerRow}>
          <span className={styles.icon} aria-hidden="true">
            <Cookie size={18} strokeWidth={1.8} />
          </span>
          <h2 id="ele-cookie-title" className={styles.title}>
            We use cookies on this site
          </h2>
        </div>

        <p className={styles.body}>
          Essential cookies keep the site running. Optional cookies help us
          improve it. Choose what you&apos;re happy with — you can change this
          any time on the{' '}
          <a href={cookiePolicyHref} className={styles.link}>cookie policy</a>{' '}
          page.
        </p>

        <div className={styles.chipRow} role="group" aria-label="Optional cookies">
          <button
            type="button"
            className={`${styles.chip} ${styles.chipLocked}`}
            disabled
            aria-pressed="true"
          >
            <span className={styles.chipDot} aria-hidden="true" />
            Essential
          </button>
          <button
            type="button"
            className={`${styles.chip} ${prefs.analytics ? styles.chipActive : ''}`}
            aria-pressed={prefs.analytics}
            onClick={() => togglePref('analytics')}
          >
            <span className={styles.chipDot} aria-hidden="true" />
            Analytics
          </button>
          <button
            type="button"
            className={`${styles.chip} ${prefs.marketing ? styles.chipActive : ''}`}
            aria-pressed={prefs.marketing}
            onClick={() => togglePref('marketing')}
          >
            <span className={styles.chipDot} aria-hidden="true" />
            Marketing
          </button>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnGhost} onClick={declineAll}>
            Decline
          </button>
          <button type="button" className={styles.btnSecondary} onClick={() => savePrefs(prefs)}>
            Save choices
          </button>
          <button type="button" className={styles.btnPrimary} onClick={acceptAll}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
