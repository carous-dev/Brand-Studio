'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './NcrCookieBanner.module.css'

type Prefs = { analytics: boolean; marketing: boolean }
type Consent = { prefs: Prefs; updatedAt: string }

const storageKey = (slug: string) => `${slug || 'default'}_cookie_consent`

export default function NcrCookieBanner() {
  const brand = useBrand()
  const slug = brand?.slug || 'default'
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, marketing: false })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(storageKey(slug))
      if (!raw) {
        setVisible(true)
        return
      }
      const parsed = JSON.parse(raw) as Consent
      if (parsed?.prefs) setPrefs(parsed.prefs)
    } catch {
      setVisible(true)
    }
  }, [slug])

  function save(next: Prefs) {
    if (typeof window === 'undefined') return
    const payload: Consent = { prefs: next, updatedAt: new Date().toISOString() }
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(payload))
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  function acceptAll() {
    const next: Prefs = { analytics: true, marketing: true }
    setPrefs(next)
    save(next)
  }

  function rejectAll() {
    const next: Prefs = { analytics: false, marketing: false }
    setPrefs(next)
    save(next)
  }

  if (!visible) return null

  return (
    <aside className={styles.banner} role="region" aria-label="Cookie preferences" aria-live="polite">
      <div className={styles.accentBar} aria-hidden="true" />
      <button
        type="button"
        className={styles.close}
        aria-label="Reject non-essential cookies and close"
        onClick={rejectAll}
      >
        <X size={18} strokeWidth={2.4} />
      </button>

      <div className={styles.body}>
        <span className={styles.iconWrap} aria-hidden="true">
          <Cookie size={20} strokeWidth={2} />
        </span>
        <div className={styles.copy}>
          <p className={styles.title}>Cookies on this site</p>
          <p className={styles.lead}>
            We use essential cookies to make the site work. With your permission we'll also set analytics and marketing cookies so we can see how the forecourt is being used and tailor finance offers to your trade.
            {' '}
            <Link href="/cookie-policy" className={styles.policyLink}>Read our cookie policy</Link>.
          </p>

          {expanded ? (
            <fieldset className={styles.toggleGroup}>
              <legend className={styles.toggleLegend}>Choose what to allow</legend>
              <label className={styles.toggleRow}>
                <span>
                  <strong>Essential</strong>
                  <em>Required for the site to function — always on.</em>
                </span>
                <input type="checkbox" checked disabled aria-label="Essential cookies (always on)" />
              </label>
              <label className={styles.toggleRow}>
                <span>
                  <strong>Analytics</strong>
                  <em>Anonymous traffic stats so we can improve the site.</em>
                </span>
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                  aria-label="Toggle analytics cookies"
                />
              </label>
              <label className={styles.toggleRow}>
                <span>
                  <strong>Marketing</strong>
                  <em>Targeted finance offers and remarketing across the web.</em>
                </span>
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                  aria-label="Toggle marketing cookies"
                />
              </label>
            </fieldset>
          ) : null}
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btnGhost} onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
          {expanded ? 'Hide preferences' : 'Manage preferences'}
        </button>
        <button type="button" className={styles.btnOutline} onClick={rejectAll}>
          Reject non-essential
        </button>
        {expanded ? (
          <button type="button" className={`${styles.btnPrimary} mfx-shimmer`} onClick={() => save(prefs)}>
            Save my choices
          </button>
        ) : (
          <button type="button" className={`${styles.btnPrimary} mfx-shimmer`} onClick={acceptAll}>
            Accept all
          </button>
        )}
      </div>
    </aside>
  )
}
