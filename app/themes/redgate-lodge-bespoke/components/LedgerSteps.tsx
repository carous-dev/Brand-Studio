import styles from './LedgerSteps.module.css'

/**
 * LedgerSteps — the proof-ledger's numbered-serif motif recast as a "how it
 * works" rail (steps 01–03). Presentational: the parent resolves every string
 * through `resolveText` and passes the resolved steps, so this component stays
 * copy-agnostic and reusable across the sell/PX form rail (and, later, the
 * /services + /finance how-it-works sections) without importing another page's
 * module.
 *
 * Motif reuse (spec §"Unique move" / design-language §5): each step is a
 * hairline row with an oversized oldstyle EB Garamond numeral in a fixed left
 * column (`--color-primary`), a Lato-700 subtitle (`--color-text`) and a Lato
 * body (`--color-muted`) — the same guest-ledger grammar as ProofLedger, so
 * design-language do-not §5 is satisfied (this REPLACES a proof-ledger on the
 * route, never joins one).
 *
 * Layout: base stacks as hairline rows (numeral left); 768 becomes a 3-up row
 * beneath the form card; 1024 returns to a vertical rail beside the form. A step
 * whose title resolves empty is dropped and the rest renumber, so the rail never
 * shows a blank numbered row.
 *
 * Tokens only (build-rules §2): numerals `--color-primary`, titles
 * `--color-text`, bodies `--color-muted`, hairlines `--color-border`. Legible on
 * the claret palette AND a light throwaway brand — no rule assumes primary is
 * dark.
 */

export type LedgerStep = {
  title: string
  body: string
}

type LedgerStepsProps = {
  /** Screen-reader heading for the ordered list (visually hidden). */
  titleSr: string
  steps: LedgerStep[]
  className?: string
}

export default function LedgerSteps({ titleSr, steps, className }: LedgerStepsProps) {
  // Never render an empty numbered row — degrade gracefully if a slot is blank.
  const entries = steps.filter((step) => step.title.trim().length > 0)
  if (entries.length === 0) return null

  return (
    <div className={className ? `${styles.steps} ${className}` : styles.steps}>
      <h2 className={styles.srTitle}>{titleSr}</h2>
      <ol className={styles.list}>
        {entries.map((step, index) => {
          const numeral = String(index + 1).padStart(2, '0')
          return (
            <li
              key={numeral}
              className={styles.step}
              data-aos="fade"
              data-aos-delay={index * 80}
            >
              <span className={styles.numeral} aria-hidden="true">
                {numeral}
              </span>
              <div className={styles.body}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                {step.body ? <p className={styles.stepBody}>{step.body}</p> : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
