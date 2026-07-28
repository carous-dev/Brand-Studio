'use client'

import { useEffect, useMemo, useState } from 'react'
import { Cookie, Lock, Settings2, ShieldCheck } from 'lucide-react'
import styles from './CookieBanner.module.css'

/**
 * Brandstudio global widget — GDPR-style cookie consent banner.
 * =============================================================================
 *
 * Lives at `app/widgets/CookieBanner/` so every theme imports the same
 * implementation rather than re-rolling it. Theme-agnostic:
 *   - All colors use brand tokens (`var(--color-*)`) so the widget retints
 *     per dealer automatically.
 *   - localStorage key is namespaced by `brandSlug` so multiple brands
 *     bundled into the same preview don't collide.
 *   - Cookie policy link is configurable via `cookiePolicyHref`.
 *
 * Usage in a theme's Shell:
 *   import { CookieBanner } from '@/widgets/CookieBanner'
 *   <CookieBanner brandSlug={brand?.slug} />
 *
 * Three categories: essential (always on, locked), analytics (opt-in),
 * marketing (opt-in). Settings panel is a `role="dialog"` aside with its
 * own backdrop. Backdrop click closes the panel; the dialog has its own
 * close button + supports Escape via natural focus management.
 */

type CookiePrefs = {
  analytics: boolean
  marketing: boolean
}

const DEFAULT_PREFS: CookiePrefs = {
  analytics: false,
  marketing: false,
}

export type CookieBannerProps = {
  /** Brand slug for namespacing the localStorage key. Falls back to 'brand'. */
  brandSlug?: string
  /** Where the "Cookie policy" link points. Defaults to '/cookie-policy'. */
  cookiePolicyHref?: string
  /** Banner title text. Allows themes to swap voice. */
  title?: string
  /** Banner body summary. Allows themes to swap voice. */
  summary?: string
}

export default function CookieBanner({
  brandSlug,
  cookiePolicyHref = '/cookie-policy',
  title = 'Cookies',
  summary = 'We use cookies to keep the site running and improve your visit.',
}: CookieBannerProps) {
  const storageKey = `${brandSlug || 'brand'}_cookie_consent`

  const [visible, setVisible] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
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

  // Esc closes the panel.
  useEffect(() => {
    if (!panelOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanelOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen])

  const savePrefs = (nextPrefs: CookiePrefs) => {
    setPrefs(nextPrefs)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ prefs: nextPrefs, updatedAt: new Date().toISOString() }),
      )
    }
    setVisible(false)
    setPanelOpen(false)
  }

  const acceptAll = () => savePrefs({ analytics: true, marketing: true })
  const declineAll = () => savePrefs({ analytics: false, marketing: false })

  const togglePref = (key: keyof CookiePrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const memoSummary = useMemo(() => summary, [summary])

  if (!visible && !panelOpen) {
    return null
  }

  return (
    <>
      <div className={styles.cookieRoot} aria-live="polite">
        <div
          className={`${styles.cookieBanner} ${visible ? styles.isVisible : ''}`}
          role="region"
          aria-label="Cookie consent"
        >
          <div className={styles.cookieHeader}>
            <div className={styles.cookieIcon} aria-hidden="true">
              <Cookie size={20} strokeWidth={1.8} />
            </div>
            <p className={styles.cookieText}>
              <span className={styles.cookieTitle}>{title}</span>
              {memoSummary}{' '}
              <a
                className={styles.cookieLink}
                href={cookiePolicyHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cookie policy
              </a>
              .
            </p>
          </div>

          <div className={styles.cookieActions}>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={() => setPanelOpen(true)}
            >
              <Settings2 size={15} strokeWidth={2} />
              Settings
            </button>
            <button
              type="button"
              className={styles.buttonGhost}
              onClick={declineAll}
            >
              Decline
            </button>
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={acceptAll}
            >
              Accept all
            </button>
          </div>
        </div>
      </div>

      {/* audit-ignore: a11y-div-as-button — backdrop overlay; aside dialog has its own keyboard handlers (Escape closes via the useEffect above) */}
      <div
        className={`${styles.cookieOverlay} ${panelOpen ? styles.isOpen : ''}`}
        onClick={() => setPanelOpen(false)}
        aria-hidden={!panelOpen}
      />

      <aside
        className={`${styles.cookiePanel} ${panelOpen ? styles.isOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Cookie settings"
      >
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Cookie settings</h3>
          <button
            type="button"
            className={styles.buttonGhost}
            onClick={() => setPanelOpen(false)}
          >
            Close
          </button>
        </div>
        <div className={styles.panelBody}>
          <p className={styles.panelIntro}>
            Choose which cookies you want to allow. Essential cookies are always on to keep the website secure and working.
          </p>
          <div className={styles.prefItem}>
            <div className={styles.prefIcon} aria-hidden="true">
              <Lock size={18} strokeWidth={1.8} />
            </div>
            <div className={styles.prefContent}>
              <p className={styles.prefTitle}>Essential cookies</p>
              <p className={styles.prefDesc}>Required for core site features, security, and saving your preferences.</p>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${styles.isLocked} ${styles.isActive}`}
              aria-label="Essential cookies are always on"
              disabled
            />
          </div>
          <div className={styles.prefItem}>
            <div className={styles.prefIcon} aria-hidden="true">
              <ShieldCheck size={18} strokeWidth={1.8} />
            </div>
            <div className={styles.prefContent}>
              <p className={styles.prefTitle}>Analytics cookies</p>
              <p className={styles.prefDesc}>Help us understand traffic and improve the website experience.</p>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${prefs.analytics ? styles.isActive : ''}`}
              onClick={() => togglePref('analytics')}
              aria-pressed={prefs.analytics}
              aria-label="Toggle analytics cookies"
            />
          </div>
          <div className={styles.prefItem}>
            <div className={styles.prefIcon} aria-hidden="true">
              <Settings2 size={18} strokeWidth={1.8} />
            </div>
            <div className={styles.prefContent}>
              <p className={styles.prefTitle}>Marketing cookies</p>
              <p className={styles.prefDesc}>Used to personalize ads and measure campaign performance.</p>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${prefs.marketing ? styles.isActive : ''}`}
              onClick={() => togglePref('marketing')}
              aria-pressed={prefs.marketing}
              aria-label="Toggle marketing cookies"
            />
          </div>
        </div>
        <div className={styles.panelFooter}>
          <div className={styles.panelActions}>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={declineAll}
            >
              Reject all
            </button>
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={() => savePrefs(prefs)}
            >
              Save preferences
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
