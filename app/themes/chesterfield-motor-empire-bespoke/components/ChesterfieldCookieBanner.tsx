'use client'

import { useEffect, useState } from 'react'
import { Cookie, Shield, X } from 'lucide-react'
import styles from './ChesterfieldCookieBanner.module.css'

type CookiePrefs = {
  analytics: boolean
  marketing: boolean
}

const DEFAULT_PREFS: CookiePrefs = {
  analytics: false,
  marketing: false,
}

type Props = {
  brandSlug?: string
  cookiePolicyHref?: string
}

export default function ChesterfieldCookieBanner({
  brandSlug,
  cookiePolicyHref = '/cookie-policy',
}: Props) {
  const storageKey = `${brandSlug || 'brand'}_cookie_consent`

  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [prefs, setPrefs] = useState<CookiePrefs>(DEFAULT_PREFS)

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

  const persist = (next: CookiePrefs) => {
    setPrefs(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ prefs: next, updatedAt: new Date().toISOString() }),
      )
    }
    setVisible(false)
    setExpanded(false)
  }

  const acceptAll = () => persist({ analytics: true, marketing: true })
  const declineAll = () => persist({ analytics: false, marketing: false })
  const saveCustom = () => persist(prefs)

  if (!visible) return null

  return (
    <aside
      className={styles.dock}
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
    >
      <div className={styles.bracket} aria-hidden="true">
        <span className={styles.bracketCorner} data-pos="tl" />
        <span className={styles.bracketCorner} data-pos="tr" />
      </div>

      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.icon} aria-hidden="true">
            <Cookie size={22} strokeWidth={1.7} />
          </div>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>Cookies</p>
            <h2 className={styles.title}>Heads up — we use cookies</h2>
            <p className={styles.body}>
              Essentials keep the showroom site running. Analytics &amp; marketing cookies are
              optional and help us tune what we show you. Read the{' '}
              <a className={styles.link} href={cookiePolicyHref} target="_blank" rel="noopener noreferrer">
                cookie policy
              </a>
              .
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={declineAll}
            aria-label="Decline all optional cookies"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        {expanded ? (
          <div className={styles.toggles}>
            <div className={styles.toggleRow}>
              <div className={styles.toggleMeta}>
                <Shield size={16} strokeWidth={1.8} />
                <span className={styles.toggleName}>Essential</span>
                <span className={styles.toggleHint}>Always on</span>
              </div>
              <span className={`${styles.chip} ${styles.chipLocked}`}>On</span>
            </div>
            <button
              type="button"
              className={styles.toggleRow}
              onClick={() => setPrefs((prev) => ({ ...prev, analytics: !prev.analytics }))}
              aria-pressed={prefs.analytics}
            >
              <div className={styles.toggleMeta}>
                <span className={styles.toggleName}>Analytics</span>
                <span className={styles.toggleHint}>Anonymous traffic stats</span>
              </div>
              <span className={`${styles.chip} ${prefs.analytics ? styles.chipActive : ''}`}>
                {prefs.analytics ? 'On' : 'Off'}
              </span>
            </button>
            <button
              type="button"
              className={styles.toggleRow}
              onClick={() => setPrefs((prev) => ({ ...prev, marketing: !prev.marketing }))}
              aria-pressed={prefs.marketing}
            >
              <div className={styles.toggleMeta}>
                <span className={styles.toggleName}>Marketing</span>
                <span className={styles.toggleHint}>Personalised stock suggestions</span>
              </div>
              <span className={`${styles.chip} ${prefs.marketing ? styles.chipActive : ''}`}>
                {prefs.marketing ? 'On' : 'Off'}
              </span>
            </button>
          </div>
        ) : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide options' : 'Choose what to allow'}
          </button>
          {expanded ? (
            <button type="button" className={styles.btnSecondary} onClick={saveCustom}>
              Save my choice
            </button>
          ) : null}
          <button type="button" className={styles.btnSecondary} onClick={declineAll}>
            Essentials only
          </button>
          <button type="button" className={styles.btnPrimary} onClick={acceptAll}>
            Accept all
          </button>
        </div>
      </div>
    </aside>
  )
}
