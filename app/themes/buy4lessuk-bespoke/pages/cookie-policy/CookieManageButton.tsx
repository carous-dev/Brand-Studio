'use client'

import styles from './page.module.css'

function openCookieManager() {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent('carous:cookie-banner:open'))
  } catch {
    /* widget not mounted */
  }
}

export default function CookieManageButton() {
  return (
    <button type="button" className={styles.manageBtn} onClick={openCookieManager}>
      Manage cookie settings
    </button>
  )
}
