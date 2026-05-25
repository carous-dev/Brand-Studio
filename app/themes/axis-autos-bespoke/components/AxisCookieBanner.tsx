'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './AxisCookieBanner.module.css'

type Consent = { necessary: boolean; analytics: boolean; marketing: boolean }
const DEFAULT: Consent = { necessary: true, analytics: false, marketing: false }

const key = (slug?: string) => `${slug || 'default'}_cookie_consent`

function read(slug?: string): Consent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key(slug))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.prefs) return null
    return {
      necessary: true,
      analytics: Boolean(parsed.prefs.analytics),
      marketing: Boolean(parsed.prefs.marketing),
    }
  } catch { return null }
}

function persist(slug: string | undefined, prefs: Consent) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key(slug), JSON.stringify({
      prefs: { necessary: true, analytics: prefs.analytics, marketing: prefs.marketing },
      updatedAt: new Date().toISOString(),
    }))
  } catch { /* localStorage blocked */ }
}

/**
 * AxisCookieBanner — industrial archetype variant: full-width bottom dock,
 * dark mode (matches rail). Inline category toggles, monospace labels.
 */
export default function AxisCookieBanner({ brandSlug }: { brandSlug?: string }) {
  const [open, setOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [prefs, setPrefs] = useState<Consent>(DEFAULT)

  useEffect(() => {
    const stored = read(brandSlug)
    if (stored) {
      setPrefs(stored)
      setOpen(false)
    } else {
      const timer = window.setTimeout(() => setOpen(true), 280)
      return () => window.clearTimeout(timer)
    }
  }, [brandSlug])

  const acceptAll = () => {
    const next = { necessary: true, analytics: true, marketing: true }
    setPrefs(next); persist(brandSlug, next); setOpen(false)
  }
  const acceptNecessary = () => {
    const next = { necessary: true, analytics: false, marketing: false }
    setPrefs(next); persist(brandSlug, next); setOpen(false)
  }
  const savePrefs = () => { persist(brandSlug, prefs); setOpen(false) }

  if (!open) return null

  return (
    <div className={styles.dock} role="dialog" aria-modal="false" aria-labelledby="axis-cookie-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span id="axis-cookie-title" className={styles.title}>
            <span className={styles.titlePrefix}>{'> '}</span>cookie-consent.config
          </span>
          <p className={styles.body}>
            Necessary cookies keep the site running. Optional analytics + marketing
            help us improve. Read the <Link href="/cookie-policy" className={styles.link}>cookie policy</Link>.
          </p>
        </div>

        {showDetails ? (
          <div className={styles.prefsRow}>
            <label className={styles.pref}>
              <input type="checkbox" checked disabled aria-label="Necessary cookies (always on)" />
              <span>necessary <span className={styles.lock}>[locked]</span></span>
            </label>
            <label className={styles.pref}>
              <input type="checkbox" checked={prefs.analytics} onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))} />
              <span>analytics</span>
            </label>
            <label className={styles.pref}>
              <input type="checkbox" checked={prefs.marketing} onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))} />
              <span>marketing</span>
            </label>
          </div>
        ) : null}

        <div className={styles.actions}>
          {!showDetails ? (
            <button type="button" className={styles.btnGhost} onClick={() => setShowDetails(true)}>Configure</button>
          ) : (
            <button type="button" className={styles.btnGhost} onClick={savePrefs}>Save</button>
          )}
          <button type="button" className={styles.btnGhost} onClick={acceptNecessary}>Necessary only</button>
          <button type="button" className={styles.btnPrimary} onClick={acceptAll}>Accept all</button>
        </div>
      </div>
    </div>
  )
}
