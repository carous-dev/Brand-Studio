import type { BrandConfig } from '@/brands/types'
import { resolveText, textRecipe } from '../lib/brand-text'
import CanvasFX from '@/app/widgets/CanvasFX/CanvasFX'
import styles from './PageRibbon.module.css'

/**
 * PageRibbon — the photo-free inner-page heading strip (design-language §7).
 *
 * Signature move: a quiet serif ribbon on `--color-surface` — letterspaced
 * eyebrow, sentence-case serif h1, and a 48px "wax seal" primary rule under the
 * title. Sibling themes open inner routes on photo/overlay heroes; this theme
 * opens on paper, so there is deliberately NO background-image or scrim here
 * (the theme is scrim-free and survives any brand palette).
 *
 * Two shapes:
 *   - default: eyebrow + title + seal + lead (lead hidden ≤480px).
 *   - slim (count line): eyebrow + title + seal + an inline result-count line
 *     whose numeral is set in EB Garamond primary (the ledger-numeral echo).
 *     While the count is loading it shows an en-dash — never "0".
 *
 * Server Component: takes `brand` as a prop (pages are Server Components) and
 * resolves every string through `resolveText` — no hardcoded copy.
 */

type PageRibbonProps = {
  brand: BrandConfig | null | undefined
  /** Recipe key for the page title (single <h1> for the route). */
  titleKey: string
  /** Recipe key for the eyebrow (letterspaced serif-caps). Omit to hide. */
  eyebrowKey?: string
  /** Recipe key for the warm one-line lead. Ignored when a count line shows. */
  leadKey?: string
  /** Tighter vertical rhythm for garage/legal routes (compare, wishlist, …). */
  slim?: boolean
  /** Recipe key for the count line (e.g. `ribbon.count_line`). Enables the
   *  slim count variant; the `{count}` numeral is styled separately. */
  countKey?: string
  /** Live result count. `null`/`undefined` = loading → renders an en-dash. */
  count?: number | null
}

// Zero-width-joiner sentinel — survives resolveText's {token} interpolation so
// we can split the resolved count line and drop the styled numeral back in.
const COUNT_SENTINEL = '⁣⁣'

function recipeDefault(key: string): string {
  for (const section of textRecipe.sections || []) {
    for (const field of section.fields || []) {
      if (field?.key === key && typeof field.default === 'string') return field.default
    }
  }
  return ''
}

export default function PageRibbon({
  brand,
  titleKey,
  eyebrowKey,
  leadKey,
  slim = false,
  countKey,
  count,
}: PageRibbonProps) {
  const eyebrow = eyebrowKey ? resolveText(brand, eyebrowKey) : ''
  const title = resolveText(brand, titleKey)
  const lead = leadKey ? resolveText(brand, leadKey) : ''

  // Count line: resolve brand {tokens} normally but keep the {count} slot so we
  // can render the numeral in serif primary. We seed a sentinel in place of
  // {count}, let resolveText interpolate the rest, then split on the sentinel.
  let countBefore = ''
  let countAfter = ''
  if (countKey) {
    const override =
      typeof (brand as any)?.text?.[countKey] === 'string'
        ? String((brand as any).text[countKey]).trim()
        : ''
    const base = override || recipeDefault(countKey)
    const seeded = {
      ...(brand as any),
      text: { ...((brand as any)?.text || {}), [countKey]: base.replace('{count}', COUNT_SENTINEL) },
    }
    const resolved = resolveText(seeded as BrandConfig, countKey)
    const parts = resolved.split(COUNT_SENTINEL)
    countBefore = parts[0] ?? ''
    countAfter = parts[1] ?? ''
  }

  const countDisplay =
    typeof count === 'number' && Number.isFinite(count) ? count.toLocaleString('en-GB') : '–'

  const showCount = Boolean(countKey)

  return (
    <section className={`${styles.ribbon}${slim ? ` ${styles.slim}` : ''}`} aria-labelledby="page-ribbon-title">
      {/* Furnishing (luxury→refined): the same soft brand-light canvas the home
          hero + visit lodge got, behind the ribbon — so every inner page opens
          with one shared atmosphere. Kept subtler than the hero (opacity 0.45,
          density 0.6) so the paper heading stays the focus. Self-guards (static
          token wash ≤640px / reduced-motion, pauses off-screen). Decorative +
          aria-hidden + pointer-events:none. */}
      <CanvasFX variant="aurora-light" density={0.6} className={styles.aurora} />
      <div className={styles.inner}>
        {eyebrow ? <p className={styles.eyebrow} data-aos="fade-up">{eyebrow}</p> : null}

        <h1 id="page-ribbon-title" className={styles.title} data-aos="fade-up" data-aos-delay="60">
          {title}
        </h1>

        <span className={styles.seal} aria-hidden="true" />

        {showCount ? (
          <p className={styles.countLine} aria-live="polite" data-aos="fade-up" data-aos-delay="120">
            {countBefore}
            <span className={styles.countNumeral}>{countDisplay}</span>
            {countAfter}
          </p>
        ) : lead ? (
          <p className={styles.lead} data-aos="fade-up" data-aos-delay="120">{lead}</p>
        ) : null}
      </div>
    </section>
  )
}
