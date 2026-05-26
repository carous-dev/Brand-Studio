'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './QueensburyCookieBanner.module.css'

type ConsentPrefs = { analytics: boolean; marketing: boolean }
type ConsentPayload = { prefs: ConsentPrefs; updatedAt: string }

const storageKeyFor = (slug: string) => `${slug || 'queensbury'}_cookie_consent`

export default function QueensburyCookieBanner() {
  const brand = useBrand()
  const slug = brand?.slug || 'queensbury'
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [prefs, setPrefs] = useState<ConsentPrefs>({ analytics: true, marketing: false })

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKeyFor(slug))
      if (!stored) {
        setOpen(true)
      }
    } catch {
      // localStorage may be blocked — keep banner open
      setOpen(true)
    }
  }, [slug])

  const persist = useCallback(
    (next: ConsentPrefs) => {
      try {
        const payload: ConsentPayload = { prefs: next, updatedAt: new Date().toISOString() }
        window.localStorage.setItem(storageKeyFor(slug), JSON.stringify(payload))
      } catch {
        // ignore — best-effort
      }
      setOpen(false)
    },
    [slug],
  )

  const acceptAll = useCallback(() => persist({ analytics: true, marketing: true }), [persist])
  const rejectAll = useCallback(() => persist({ analytics: false, marketing: false }), [persist])
  const savePrefs = useCallback(() => persist(prefs), [persist, prefs])

  if (!open) return null

  return (
    <div className={styles.wrapper} role="region" aria-label="Cookie consent">
      <div className={styles.strip}>
        <div className={styles.body}>
          <span className={styles.dot} aria-hidden="true" />
          <p className={styles.copy}>
            We use cookies to keep the site working, see how you use it, and personalise content.{' '}
            <Link href="/cookie-policy" className={styles.policyLink}>
              Read the cookie policy
            </Link>
            .
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide options' : 'Customise'}
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={rejectAll}>
            Reject non-essential
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={acceptAll}>
            Accept all
          </button>
        </div>
      </div>
      {expanded && (
        <div className={styles.options} role="group" aria-label="Cookie preferences">
          <label className={styles.option}>
            <input type="checkbox" checked disabled aria-readonly="true" />
            <span>
              <strong>Essential</strong> — needed for the site to work (always on)
            </span>
          </label>
          <label className={styles.option}>
            <input
              type="checkbox"
              checked={prefs.analytics}
              onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
            />
            <span>
              <strong>Analytics</strong> — usage statistics (no personal data shared)
            </span>
          </label>
          <label className={styles.option}>
            <input
              type="checkbox"
              checked={prefs.marketing}
              onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
            />
            <span>
              <strong>Marketing</strong> — personalised offers from us and select partners
            </span>
          </label>
          <div className={styles.optionsActions}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={savePrefs}>
              Save preferences
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
