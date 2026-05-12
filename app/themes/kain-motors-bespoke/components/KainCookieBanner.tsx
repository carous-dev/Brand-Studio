'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './KainCookieBanner.module.css'

type Prefs = { analytics: boolean; marketing: boolean }
type Stored = { prefs: Prefs; updatedAt: string }

const VERSION_KEY = '_cookie_consent'

type Props = {
  brandSlug?: string
  cookiePolicyHref?: string
}

export default function KainCookieBanner({ brandSlug = 'default', cookiePolicyHref = '/cookie-policy' }: Props) {
  const storageKey = `${brandSlug}${VERSION_KEY}`
  const [open, setOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, marketing: false })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) {
        const t = setTimeout(() => setOpen(true), 700)
        return () => clearTimeout(t)
      }
      const parsed = JSON.parse(raw) as Stored
      setPrefs(parsed.prefs || { analytics: false, marketing: false })
    } catch {
      setOpen(true)
    }
  }, [storageKey])

  function persist(next: Prefs) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ prefs: next, updatedAt: new Date().toISOString() } satisfies Stored))
    } catch {}
    setPrefs(next)
    setOpen(false)
  }

  function acceptAll() { persist({ analytics: true, marketing: true }) }
  function rejectAll() { persist({ analytics: false, marketing: false }) }
  function saveChoices() { persist(prefs) }

  if (!open) return null

  return (
    <div className={styles.wrap} role="dialog" aria-modal="false" aria-label="Cookie preferences">
      <div className={styles.rule} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.text}>
          <span className={styles.eyebrow} aria-hidden="true">Cookies</span>
          <p className={styles.lead}>
            We use cookies to keep the site running and improve your visit.
            See our <Link href={cookiePolicyHref}>cookie policy</Link>.
          </p>
        </div>

        {showDetails && (
          <div className={styles.toggleGroup}>
            <label className={styles.toggleRow}>
              <span className={styles.toggleTitle}>Essential</span>
              <span className={styles.fixedPill}>Always on</span>
            </label>
            <label className={styles.toggleRow}>
              <span className={styles.toggleTitle}>Analytics</span>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={prefs.analytics}
                onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                aria-label="Allow analytics cookies"
              />
            </label>
            <label className={styles.toggleRow}>
              <span className={styles.toggleTitle}>Marketing</span>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={prefs.marketing}
                onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                aria-label="Allow marketing cookies"
              />
            </label>
          </div>
        )}

        <div className={styles.actions}>
          {!showDetails && (
            <button type="button" className={styles.linkBtn} onClick={() => setShowDetails(true)}>
              Manage
            </button>
          )}
          {showDetails && (
            <button type="button" className={styles.linkBtn} onClick={saveChoices}>
              Save
            </button>
          )}
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={rejectAll}>
            Reject
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnGold}`} onClick={acceptAll}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
