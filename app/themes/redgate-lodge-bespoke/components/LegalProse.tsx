import type { BrandConfig } from '@/brands/types'
import { resolveText } from '../lib/brand-text'
import styles from './LegalProse.module.css'

/**
 * LegalProse — the 720px prose measure for /privacy-policy and /cookie-policy
 * (design-language §7: prose container on `bg`; h2s use the subtitle size with
 * hairline underlines). One presentational Server Component drives both routes
 * via a `keyPrefix` (`privacy` | `cookie`): it renders an intro paragraph then a
 * fixed set of numbered sections, dropping any whose heading resolves empty (the
 * same graceful-degrade pattern as ProofLedger) so an operator can shorten the
 * policy without leaving blank headings.
 *
 * Every string routes through `resolveText` with generic, legally-neutral
 * fallbacks — no seed-dealer strings (do-not §10). Tokens only, hairlines only.
 */

type LegalProseProps = {
  brand: BrandConfig | null | undefined
  /** Recipe section prefix, e.g. `privacy` → `privacy.intro`, `privacy.1_title`. */
  keyPrefix: string
}

const SECTION_SLOTS = [1, 2, 3, 4, 5, 6] as const

export default function LegalProse({ brand, keyPrefix }: LegalProseProps) {
  const intro = resolveText(brand, `${keyPrefix}.intro`)
  const updated = resolveText(brand, `${keyPrefix}.updated`)

  const sections = SECTION_SLOTS.map((n) => ({
    title: resolveText(brand, `${keyPrefix}.${n}_title`),
    body: resolveText(brand, `${keyPrefix}.${n}_body`),
  })).filter((s) => s.title.length > 0)

  return (
    <section className={styles.section} aria-label="Policy">
      <div className={styles.inner}>
        {intro ? <p className={styles.intro}>{intro}</p> : null}

        {sections.map((s, index) => (
          <section className={styles.block} key={`${index}-${s.title}`}>
            <h2 className={styles.heading}>{s.title}</h2>
            {s.body
              ? s.body
                  .split('\n')
                  .map((para) => para.trim())
                  .filter(Boolean)
                  .map((para, i) => (
                    <p className={styles.body} key={i}>
                      {para}
                    </p>
                  ))
              : null}
          </section>
        ))}

        {updated ? <p className={styles.updated}>{updated}</p> : null}
      </div>
    </section>
  )
}
