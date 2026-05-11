'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './AutowowCookieBanner.module.css'

type ConsentPrefs = {
  analytics: boolean
  marketing: boolean
}

type ConsentRecord = {
  prefs: ConsentPrefs
  updatedAt: string
}

type Props = {
  brandSlug?: string
  cookiePolicyHref?: string
}

const STORAGE_KEY = (slug: string) => `${slug || 'default'}_cookie_consent`

function readConsent(slug: string): ConsentRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY(slug))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentRecord
    if (!parsed || typeof parsed !== 'object' || !parsed.prefs) return null
    return parsed
  } catch {
    return null
  }
}

function writeConsent(slug: string, record: ConsentRecord) {
  try {
    window.localStorage.setItem(STORAGE_KEY(slug), JSON.stringify(record))
  } catch {
    // localStorage may fail in private mode; intentional swallow
  }
}

export default function AutowowCookieBanner({ brandSlug = 'autowow', cookiePolicyHref = '/cookie-policy' }: Props) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const existing = readConsent(brandSlug)
    if (!existing) setVisible(true)
    else {
      setAnalytics(Boolean(existing.prefs.analytics))
      setMarketing(Boolean(existing.prefs.marketing))
    }
  }, [brandSlug])

  if (!visible) return null

  const submit = (overrides?: Partial<ConsentPrefs>) => {
    const prefs: ConsentPrefs = {
      analytics: overrides?.analytics ?? analytics,
      marketing: overrides?.marketing ?? marketing,
    }
    writeConsent(brandSlug, { prefs, updatedAt: new Date().toISOString() })
    setVisible(false)
  }

  return (
    <div className={styles.dock} role="dialog" aria-modal="false" aria-labelledby="autowow-cookie-title">
      <div className={styles.edge} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden="true" />
            Cookies
          </span>
          <h2 id="autowow-cookie-title" className={styles.title}>
            We use cookies to make this site work.
          </h2>
          <p className={styles.body}>
            Essential cookies always run so the site stays usable. Optional
            cookies help us understand which cars get attention and how to
            improve the buying journey. Manage your choice below or accept all.
            Read our{' '}
            <Link href={cookiePolicyHref} className={styles.bodyLink}>cookie policy</Link>.
          </p>
        </div>

        <div className={styles.right}>
          {expanded ? (
            <div className={styles.toggles}>
              <label className={styles.toggle}>
                <span className={styles.toggleLabel}>Essential</span>
                <span className={styles.toggleControl}>
                  <input type="checkbox" checked readOnly />
                  <span className={styles.toggleTrack} aria-hidden="true">
                    <span className={styles.toggleKnob} />
                  </span>
                  <span className={styles.toggleHint}>Always on</span>
                </span>
              </label>
              <label className={styles.toggle}>
                <span className={styles.toggleLabel}>Analytics</span>
                <span className={styles.toggleControl}>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                  />
                  <span className={styles.toggleTrack} aria-hidden="true">
                    <span className={styles.toggleKnob} />
                  </span>
                  <span className={styles.toggleHint}>{analytics ? 'On' : 'Off'}</span>
                </span>
              </label>
              <label className={styles.toggle}>
                <span className={styles.toggleLabel}>Marketing</span>
                <span className={styles.toggleControl}>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                  />
                  <span className={styles.toggleTrack} aria-hidden="true">
                    <span className={styles.toggleKnob} />
                  </span>
                  <span className={styles.toggleHint}>{marketing ? 'On' : 'Off'}</span>
                </span>
              </label>
            </div>
          ) : null}

          <div className={styles.actions}>
            {expanded ? (
              <button type="button" className={styles.ghostBtn} onClick={() => submit()}>
                Save choices
              </button>
            ) : (
              <button type="button" className={styles.ghostBtn} onClick={() => setExpanded(true)}>
                Choose
              </button>
            )}
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => submit({ analytics: true, marketing: true })}
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
