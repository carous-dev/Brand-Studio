import type { BrandConfig } from '@/brands/types'
import { resolveText } from '../lib/brand-text'
import LedgerSteps, { type LedgerStep } from './LedgerSteps'
import styles from './HowItWorks.module.css'

/**
 * HowItWorks — a banded "how it works" / process section that recasts the
 * proof-ledger's numbered-serif motif as steps 01–03 (via the shared
 * LedgerSteps). Composes the /services how-it-works block (`surface`) and the
 * /finance intro + numbered steps block (`bg`) from design-language §7 without
 * either page importing the other's module.
 *
 * Do-not §5 (one numbered-ledger element per route) is respected: neither
 * /services nor /finance renders a proof-ledger, so this is the sole numbered
 * motif on those routes.
 *
 * Presentational Server Component: it resolves every string through
 * `resolveText` (eyebrow, title, optional intro body, and three step
 * title/body pairs read from `stepKeyPrefix`). A step whose title resolves empty
 * is dropped by LedgerSteps and the rest renumber; if all three are empty the
 * band still shows its header (the section never collapses mid-page). Tokens
 * only — legible on the claret palette AND a light throwaway brand.
 */

type HowItWorksProps = {
  brand: BrandConfig | null | undefined
  eyebrowKey?: string
  titleKey: string
  /** Optional lead paragraph under the title (used by /finance intro). */
  introKey?: string
  /** Recipe prefix for the 3 steps, e.g. `services.step` → `services.step_1_title`. */
  stepKeyPrefix: string
  /** Screen-reader heading for the ordered list. */
  stepsTitleSrKey: string
  /** Section background token (design-language §7 handoff). */
  background?: 'bg' | 'surface'
}

const STEP_SLOTS = [1, 2, 3] as const

export default function HowItWorks({
  brand,
  eyebrowKey,
  titleKey,
  introKey,
  stepKeyPrefix,
  stepsTitleSrKey,
  background = 'surface',
}: HowItWorksProps) {
  const eyebrow = eyebrowKey ? resolveText(brand, eyebrowKey) : ''
  const title = resolveText(brand, titleKey)
  const intro = introKey ? resolveText(brand, introKey) : ''
  const stepsTitleSr = resolveText(brand, stepsTitleSrKey)

  const steps: LedgerStep[] = STEP_SLOTS.map((n) => ({
    title: resolveText(brand, `${stepKeyPrefix}_${n}_title`),
    body: resolveText(brand, `${stepKeyPrefix}_${n}_body`),
  }))

  if (!title && steps.every((s) => s.title.trim().length === 0)) return null

  return (
    <section
      className={`${styles.section} ${background === 'bg' ? styles.bg : styles.surface}`}
      aria-labelledby="how-it-works-title"
      data-aos="fade-up"
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          {title ? (
            <h2 id="how-it-works-title" className={styles.title}>
              {title}
            </h2>
          ) : null}
          {intro ? <p className={styles.intro}>{intro}</p> : null}
        </header>

        <LedgerSteps titleSr={stepsTitleSr} steps={steps} className={styles.steps} />
      </div>
    </section>
  )
}
