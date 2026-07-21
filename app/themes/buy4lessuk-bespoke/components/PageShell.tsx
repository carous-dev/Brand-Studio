'use client'

import { ReactNode } from 'react'
import styles from './PageShell.module.css'

export default function PageShell({
  children,
  narrow = false,
}: {
  children: ReactNode
  narrow?: boolean
}) {
  return (
    <section className={styles.section}>
      <div className={narrow ? styles.innerNarrow : styles.inner}>{children}</div>
    </section>
  )
}
