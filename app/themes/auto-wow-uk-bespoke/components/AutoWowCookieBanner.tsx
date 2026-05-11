'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './AutoWowCookieBanner.module.css'

type ConsentPrefs = { analytics: boolean; marketing: boolean }
type ConsentRecord = { prefs: ConsentPrefs; updatedAt: string }

function storageKey(slug: string) {
  return `${slug || 'autowow'}_cookie_consent`
}

function readConsent(slug: string): ConsentRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey(slug))
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeConsent(slug: string, prefs: ConsentPrefs) {
  if (typeof window === 'undefined') return
  try {
    const record: ConsentRecord = { prefs, updatedAt: new Date().toISOString() }
    window.localStorage.setItem(storageKey(slug), JSON.stringify(record))
  } catch {
    // ignore
  }
}

export default function AutoWowCookieBanner() {
  const brand = useBrand()
  const slug = brand?.slug || 'autowow'
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const existing = readConsent(slug)
    if (!existing) {
      const t = window.setTimeout(() => setVisible(true), 600)
      return () => window.clearTimeout(t)
    }
    setAnalytics(existing.prefs?.analytics ?? true)
    setMarketing(existing.prefs?.marketing ?? false)
  }, [slug])

  if (!visible) return null

  function acceptAll() {
    writeConsent(slug, { analytics: true, marketing: true })
    setVisible(false)
  }

  function rejectAll() {
    writeConsent(slug, { analytics: false, marketing: false })
    setVisible(false)
  }

  function saveChoices() {
    writeConsent(slug, { analytics, marketing })
    setVisible(false)
  }

  return (
    <aside
      className={styles.dock}
      role="dialog"
      aria-modal="false"
      aria-labelledby="autowow-cookie-title"
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p id="autowow-cookie-title" className={styles.title}>
            <span className={styles.eyebrow}>Cookies</span>
            We use cookies to keep this site running and tune what we show you.
          </p>
          <p className={styles.lead}>
            Essential cookies always on. Pick the rest, or accept all.
            See our <Link href="/cookie-policy">cookie policy</Link>.
          </p>

          {expanded && (
            <fieldset className={styles.choices}>
              <legend className="sr-only">Cookie categories</legend>

              <label className={styles.choice}>
                <input type="checkbox" checked disabled aria-disabled="true" />
                <span>
                  <strong>Essential</strong>
                  <em>Required for the site to work. Always on.</em>
                </span>
              </label>

              <label className={styles.choice}>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                <span>
                  <strong>Analytics</strong>
                  <em>Anonymous usage stats so we improve the site.</em>
                </span>
              </label>

              <label className={styles.choice}>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                <span>
                  <strong>Marketing</strong>
                  <em>Retargeting and offer personalisation.</em>
                </span>
              </label>
            </fieldset>
          )}
        </div>

        <div className={styles.actions}>
          {!expanded && (
            <button
              type="button"
              className={`auto-btn auto-btn--ghost ${styles.choicesBtn}`}
              onClick={() => setExpanded(true)}
            >
              Choose
            </button>
          )}
          {expanded && (
            <button
              type="button"
              className={`auto-btn auto-btn--ghost ${styles.choicesBtn}`}
              onClick={saveChoices}
            >
              Save choices
            </button>
          )}
          <button
            type="button"
            className={`auto-btn auto-btn--ghost ${styles.rejectBtn}`}
            onClick={rejectAll}
          >
            Reject all
          </button>
          <button
            type="button"
            className={`auto-btn auto-btn--primary ${styles.acceptBtn}`}
            onClick={acceptAll}
          >
            Accept all
          </button>
        </div>
      </div>
    </aside>
  )
}
