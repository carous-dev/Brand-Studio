'use client'

import { useBrand } from '../context/BrandClientWrapper'
import { getBrandText, resolveText } from '../lib/brand-text'
import styles from './TrustBand.module.css'

const SLOTS = [1, 2, 3, 4] as const

export default function TrustBand() {
  const brand = useBrand()
  const text = getBrandText(brand)
  return (
    <section className={styles.band} aria-label={`Why buy from ${text.name}`} data-aos="fade-up">
      <div className={styles.inner}>
        {SLOTS.map((idx) => {
          const label = resolveText(brand, `trust${idx}Label`)
          const detail = resolveText(brand, `trust${idx}Detail`)
          if (!label && !detail) return null
          return (
            <div key={idx} className={styles.cell} data-aos="fade-up" data-aos-delay={String((idx - 1) * 80)}>
              <span className={styles.num}>0{idx}</span>
              <h3 className={styles.label}>{label}</h3>
              <p className={styles.detail}>{detail}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
