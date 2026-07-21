'use client'

import { useBrand } from '../context/BrandClientWrapper'
import styles from './BrandLogo.module.css'

type Variant = 'header' | 'mobile' | 'footer'

export default function BrandLogo({ variant = 'header' }: { variant?: Variant }) {
  const brand = useBrand()
  const name = (brand?.name || 'Buy4Less UK').trim()
  const tagline = (brand?.tagline || 'Quality Used Cars').trim()
  const logoUrl = (brand as any)?.logo as string | undefined
  const parts = splitName(name)

  if (logoUrl) {
    return (
      <span className={`${styles.wrap} ${styles[variant]}`}>
        <img src={logoUrl} alt={name} className={styles.logoImg} />
      </span>
    )
  }

  return (
    <span className={`${styles.wrap} ${styles[variant]}`} aria-label={name}>
      <span className={styles.diamond} aria-hidden>
        <span className={styles.diamondInner} />
      </span>
      <span className={styles.lockup}>
        <span className={styles.wordmark}>
          {parts.map((p, i) => (
            <span key={i} className={i === 1 ? styles.wordEmph : styles.word}>{p}</span>
          ))}
        </span>
        {tagline ? <span className={styles.tagline}>{tagline}</span> : null}
      </span>
    </span>
  )
}

function splitName(name: string): string[] {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return [parts[0]]
  if (parts.length === 2) return parts
  return [parts.slice(0, -1).join(' '), parts[parts.length - 1]]
}
