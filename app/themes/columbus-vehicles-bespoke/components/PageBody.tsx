import type { ReactNode } from 'react'
import styles from './PageBody.module.css'

/**
 * Columbus Vehicles — generic page-body wrapper.
 * Provides the standard inner-page content container with responsive
 * padding, prose styling for headings/paragraphs, and constraints. Inner
 * pages compose `<PageHero>` + `<PageBody>` for a consistent look without
 * repeating CSS.
 *
 * Use `narrow` for legal copy / FAQ-style pages where reading-width matters.
 */
export default function PageBody({
  children,
  narrow = false,
}: {
  children: ReactNode
  narrow?: boolean
}) {
  return (
    <section className={`${styles.body} ${narrow ? styles.narrow : ''}`}>
      <div className={styles.inner}>{children}</div>
    </section>
  )
}
