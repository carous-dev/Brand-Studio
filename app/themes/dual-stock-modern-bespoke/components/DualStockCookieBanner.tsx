'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './DualStockCookieBanner.module.css'

type ConsentPrefs = { analytics: boolean; marketing: boolean }
type ConsentPayload = { prefs: ConsentPrefs; updatedAt: number }

function storageKey(slug: string) {
  return `${slug || 'default'}_cookie_consent`
}

function readConsent(slug: string): ConsentPayload | null {
  try {
    const raw = window.localStorage.getItem(storageKey(slug))
    return raw ? (JSON.parse(raw) as ConsentPayload) : null
  } catch {
    return null
  }
}

function writeConsent(slug: string, prefs: ConsentPrefs) {
  try {
    const payload: ConsentPayload = { prefs, updatedAt: Date.now() }
    window.localStorage.setItem(storageKey(slug), JSON.stringify(payload))
  } catch { /* storage full / disabled — silently fall through */ }
}

interface DualStockCookieBannerProps {
  brandSlug?: string
  cookiePolicyHref?: string
}

/**
 * Bespoke modern cookie consent — slim full-width bottom strip on desktop,
 * full-width bottom dock on mobile. Compatible consent payload with the
 * shared widget at app/widgets/CookieBanner so consolidated reporting reads
 * either source. (SKILL Quality Bar §"Cookie banners must NOT be one-size-fits-all".)
 */
export default function DualStockCookieBanner({
  brandSlug = 'default',
  cookiePolicyHref = '/cookie-policy',
}: DualStockCookieBannerProps) {
  const [visible, setVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [prefs, setPrefs] = useState<ConsentPrefs>({ analytics: false, marketing: false })

  useEffect(() => {
    const existing = readConsent(brandSlug)
    if (!existing) setVisible(true)
  }, [brandSlug])

  if (!visible) return null

  const acceptAll = () => {
    writeConsent(brandSlug, { analytics: true, marketing: true })
    setVisible(false)
  }
  const rejectAll = () => {
    writeConsent(brandSlug, { analytics: false, marketing: false })
    setVisible(false)
  }
  const savePrefs = () => {
    writeConsent(brandSlug, prefs)
    setVisible(false)
  }

  return (
    <div
      className={styles.dock}
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      data-aos="slide-up"
    >
      <div className={styles.dockInner}>
        {!showSettings ? (
          <>
            <p className={styles.copyText}>
              We use cookies to improve your experience.{' '}
              <Link href={cookiePolicyHref}>Cookie policy</Link>
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setShowSettings(true)}>
                Settings
              </button>
              <button type="button" className={styles.outlineBtn} onClick={rejectAll}>
                Reject
              </button>
              <button type="button" className={styles.primaryBtn} onClick={acceptAll}>
                Accept all
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.copy}>
              <ul className={styles.prefList}>
                <li>
                  <label>
                    <input type="checkbox" checked disabled aria-label="Essential cookies (always on)" />
                    <span><strong>Essential</strong> — required for site to work.</span>
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="checkbox"
                      checked={prefs.analytics}
                      onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                      aria-label="Analytics cookies"
                    />
                    <span><strong>Analytics</strong> — anonymous traffic + stock-view data.</span>
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="checkbox"
                      checked={prefs.marketing}
                      onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                      aria-label="Marketing cookies"
                    />
                    <span><strong>Marketing</strong> — remarketing for vehicles you viewed.</span>
                  </label>
                </li>
              </ul>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setShowSettings(false)}>
                Back
              </button>
              <button type="button" className={styles.primaryBtn} onClick={savePrefs}>
                Save preferences
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
