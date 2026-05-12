import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './PageHero.module.css'

type Crumb = { label: string; href?: string }

type Props = {
  eyebrow?: string
  title: string
  lead?: string
  variant?: 'about' | 'services' | 'finance' | 'part-exchange' | 'sell-your-car' | 'recently-sold' | 'contact'
  breadcrumbs?: Crumb[]
  actions?: ReactNode
}

const VARIANT_CLASS: Record<string, string> = {
  about: 'kain-page-hero--about',
  services: 'kain-page-hero--services',
  finance: 'kain-page-hero--finance',
  'part-exchange': 'kain-page-hero--part-exchange',
  'sell-your-car': 'kain-page-hero--sell-your-car',
  'recently-sold': 'kain-page-hero--recently-sold',
  contact: 'kain-page-hero--contact',
}

export default function PageHero({ eyebrow, title, lead, variant = 'about', breadcrumbs, actions }: Props) {
  return (
    <section className={`kain-page-hero ${VARIANT_CLASS[variant] || 'kain-page-hero--about'}`} aria-label={title}>
      <div className="kain-page-hero-inner">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            {breadcrumbs.map((c, i) => (
              <span key={i} className={styles.crumb}>
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                {i < breadcrumbs.length - 1 && <span aria-hidden="true" className={styles.sep}>·</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="kain-page-hero-eyebrow">{eyebrow}</p>}
        <h1 className="kain-page-hero-title">{title}</h1>
        {lead && <p className="kain-page-hero-lead">{lead}</p>}
        {actions && <div className={styles.actionRow}>{actions}</div>}
      </div>
    </section>
  )
}
