import type { BrandConfig } from '@/brands/types'
import { resolveText } from '../lib/brand-text'
import CanvasFX from '@/app/widgets/CanvasFX/CanvasFX'
import styles from './ProofLedger.module.css'

/**
 * ProofLedger — THE signature band of the redgate-lodge-bespoke theme.
 *
 * The page's second impression: the dealer's credibility rendered as a
 * full-width numbered "proof ledger" rather than badge clutter. Four entries,
 * each crowned by an oversized oldstyle EB Garamond numeral (title size,
 * `--color-primary`) over a serif-caps letterspaced label and a one-line Lato
 * detail. Structure carries trust here — no icons, no badges, no cards, no
 * links (the band is deliberately non-interactive to keep the page calm).
 *
 * Surface grammar (design-language §5/§7): the band opens with the theme's
 * ONLY double-hairline (two 1px `--color-border` rules 4px apart, full-bleed)
 * — the deliberate hero→ledger handoff — and closes with a single hairline
 * that hands off to featured-stock on `bg`.
 *
 * Layout: mobile stacks as full-width hairline-separated rows with the numeral
 * in a fixed left column (reading like lines in a guest ledger); 768 becomes a
 * 2×2 grid with collapsed internal hairlines both directions; 1024 a single
 * row of four columns separated by vertical hairlines.
 *
 * Server Component: takes `brand` as a prop (pages are Server Components) and
 * resolves every string through `resolveText`. Entries are the four fixed
 * ledger slots; an entry whose label resolves empty is dropped (never a blank
 * numbered row) and the remaining entries renumber sequentially so the ledger
 * never shows a gap.
 */

type ProofLedgerProps = {
  brand: BrandConfig | null | undefined
}

const ENTRY_SLOTS = [1, 2, 3, 4] as const

export default function ProofLedger({ brand }: ProofLedgerProps) {
  const titleSr = resolveText(brand, 'ledger.title_sr')

  const entries = ENTRY_SLOTS.map((n) => ({
    label: resolveText(brand, `ledger.${n}_label`),
    detail: resolveText(brand, `ledger.${n}_detail`),
  }))
    // Never render an empty numbered row — degrade gracefully if a slot is blank.
    .filter((entry) => entry.label.length > 0)

  if (entries.length === 0) return null

  return (
    <section className={styles.ledger} aria-labelledby="proof-ledger-title">
      {/* Furnishing (luxury→refined): the same soft brand-light canvas the hero
          and visit-lodge carry, dialled fainter here so the ruled numerals stay
          the focus and the double-hairline reads crisp. Self-guards — static
          token wash ≤640px / reduced-motion, pauses off-screen. Decorative +
          aria-hidden + pointer-events:none via the widget. */}
      <CanvasFX variant="aurora-light" density={0.5} className={styles.aurora} />

      <h2 id="proof-ledger-title" className={styles.srTitle}>
        {titleSr}
      </h2>

      <div className={styles.inner}>
        <ol className={styles.list}>
          {entries.map((entry, index) => {
            // Renumber by rendered position so a dropped slot never leaves a gap.
            const numeral = String(index + 1).padStart(2, '0')
            return (
              <li
                key={numeral}
                className={styles.entry}
                data-aos="fade-up"
                data-aos-delay={index * 80}
              >
                <span className={styles.numeral} aria-hidden="true">
                  {numeral}
                </span>
                <div className={styles.body}>
                  <h3 className={styles.label}>{entry.label}</h3>
                  {entry.detail ? <p className={styles.detail}>{entry.detail}</p> : null}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
