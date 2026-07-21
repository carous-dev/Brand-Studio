'use client'

import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { getBrandText } from '../lib/brand-text'
import styles from './EditionStrip.module.css'

export default function EditionStrip() {
  const brand = useBrand()
  const text = getBrandText(brand)
  const contact = getBrandContactInfo(brand)
  const year = new Date().getFullYear()
  const right = contact.postcode ? `${year} · ${contact.postcode}` : String(year)
  return (
    <div className={styles.strip} role="presentation" aria-hidden="true" data-aos="fade-up">
      <div className={styles.inner}>
        <span className={styles.left}>{text.editionLine(3)}</span>
        <span className={styles.mid}>{text.curationLabel}</span>
        <span className={styles.right}>{right}</span>
      </div>
    </div>
  )
}
