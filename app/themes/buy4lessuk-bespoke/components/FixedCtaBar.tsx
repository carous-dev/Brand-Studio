'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import styles from './FixedCtaBar.module.css'

const STORAGE_KEY = 'b4l-fixed-cta-dismissed-v1'

export default function FixedCtaBar() {
  const [hidden, setHidden] = useState(true)
  const [show, setShow] = useState(false)

  useEffect(() => {
    let dismissed = false
    try {
      dismissed = sessionStorage.getItem(STORAGE_KEY) === '1'
    } catch { /* sessionStorage unavailable */ }
    setHidden(dismissed)
    if (dismissed) return
    const t = window.setTimeout(() => setShow(true), 400)
    return () => window.clearTimeout(t)
  }, [])

  if (hidden) return null

  const dismiss = () => {
    try { sessionStorage.setItem(STORAGE_KEY, '1') } catch { /* noop */ }
    setHidden(true)
  }

  return (
    <div className={`${styles.bar} ${show ? styles.barShow : ''}`} role="complementary" aria-label="Finance application">
      <div className={styles.inner}>
        <span className={styles.label}>Car Finance in 60 Seconds</span>
        <Link href="/finance" className={styles.apply}>Apply for free</Link>
        <button
          type="button"
          onClick={dismiss}
          className={styles.close}
          aria-label="Dismiss finance bar"
        >
          <X size={14} strokeWidth={2.4} aria-hidden />
        </button>
      </div>
    </div>
  )
}
