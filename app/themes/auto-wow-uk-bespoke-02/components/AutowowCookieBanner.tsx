'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './AutowowCookieBanner.module.css'

type Consent = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const DEFAULT_CONSENT: Consent = { necessary: true, analytics: false, marketing: false }

function storageKey(slug?: string) {
  return `${slug || 'default'}_cookie_consent`
}

function readStored(slug?: string): Consent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey(slug))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.prefs) return null
    return {
      necessary: true,
      analytics: Boolean(parsed.prefs.analytics),
      marketing: Boolean(parsed.prefs.marketing),
    }
  } catch {
    return null
  }
}

function persist(slug: string | undefined, prefs: Consent) {
  if (typeof window === 'undefined') return
  try {
    const payload = {
      prefs: { necessary: true, analytics: prefs.analytics, marketing: prefs.marketing },
      updatedAt: new Date().toISOString(),
    }
    window.localStorage.setItem(storageKey(slug), JSON.stringify(payload))
  } catch {
    // localStorage might be blocked; consent state degrades but UI continues.
  }
}

export default function AutowowCookieBanner({ brandSlug }: { brandSlug?: string }) {
  const [open, setOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [prefs, setPrefs] = useState<Consent>(DEFAULT_CONSENT)

  useEffect(() => {
    const stored = readStored(brandSlug)
    if (stored) {
      setPrefs(stored)
      setOpen(false)
    } else {
      // Defer one frame so the slide-up animation reads.
      const timer = window.setTimeout(() => setOpen(true), 280)
      return () => window.clearTimeout(timer)
    }
  }, [brandSlug])

  const acceptAll = () => {
    const next = { necessary: true, analytics: true, marketing: true }
    setPrefs(next)
    persist(brandSlug, next)
    setOpen(false)
  }

  const acceptNecessary = () => {
    const next = { necessary: true, analytics: false, marketing: false }
    setPrefs(next)
    persist(brandSlug, next)
    setOpen(false)
  }

  const savePrefs = () => {
    persist(brandSlug, prefs)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className={styles.strip}
      role="dialog"
      aria-modal="false"
      aria-labelledby="autowow-cookie-title"
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.accent} aria-hidden="true">[ COOKIES ]</span>
          <p id="autowow-cookie-title" className={styles.title}>
            We use cookies to keep stock fresh, finance offers relevant, and the
            site running.
          </p>
          <p className={styles.body}>
            Necessary cookies always run. Optional analytics + marketing help us
            improve. <Link href="/cookie-policy" className={styles.link}>Cookie policy</Link>.
          </p>
        </div>

        {showDetails ? (
          <div className={styles.prefsRow}>
            <label className={styles.pref}>
              <input type="checkbox" checked disabled aria-label="Necessary cookies (always on)" />
              <span>Necessary</span>
            </label>
            <label className={styles.pref}>
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
              />
              <span>Analytics</span>
            </label>
            <label className={styles.pref}>
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
              />
              <span>Marketing</span>
            </label>
          </div>
        ) : null}

        <div className={styles.actions}>
          {!showDetails ? (
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => setShowDetails(true)}
            >
              Customise
            </button>
          ) : (
            <button
              type="button"
              className={styles.btnGhost}
              onClick={savePrefs}
            >
              Save preferences
            </button>
          )}
          <button type="button" className={styles.btnGhost} onClick={acceptNecessary}>
            Necessary only
          </button>
          <button type="button" className={styles.btnPrimary} onClick={acceptAll}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
