import type { BrandConfig } from '@/brands/types'
import { resolveText } from '../lib/brand-text'
import CanvasFX from '@/app/widgets/CanvasFX/CanvasFX'
import styles from './PxInvite.module.css'

/**
 * PxInvite — the single loudest conversion moment per route: the full-width
 * primary (claret) invitation band that turns "I have a car to get rid of"
 * into an easy next step. The warm-hospitality answer to a shouty CTA banner.
 *
 * Unique move (spec §"Unique move"): the band is a WRITTEN INVITATION, not a
 * billboard — a left-aligned, italic-leaning EB Garamond 500 display line
 * (sentence case, reads like a hand-written note), a one-line body, and an
 * OUTLINED on-primary CTA, plus a right-aligned oversized ornamental serif
 * closing quote-flourish (the `”` glyph at ~6–8rem, ~20% of the on-primary
 * token, aria-hidden, hidden ≤640) as the section's single ornament. Sibling
 * CTA bands are all centered bold-sans shouts — nothing here is centered.
 *
 * Surface grammar (design-language §5 + build-rules §2): the band is the
 * canonical "ribbon" recipe — `background: var(--color-primary)` paired with
 * `color: var(--color-on-primary)` in one rule. Every foreground (title, body,
 * flourish, CTA border/text) uses `--color-on-primary` (the flourish via a
 * `color-mix` with transparent — no white literal, no faded rgba). This makes
 * the band legible on the real claret palette AND on a light throwaway brand,
 * where the on-primary token flips automatically. It is the ONLY
 * `--color-primary`-background band on its route (design-language §9: the
 * vehicle-detail route uses its specs band for this slot and does NOT render
 * px-invite).
 *
 * Copy variants (spec §Copy keys): `default` (sell/PX invitation) and `sold`
 * (recently-sold valediction "yours could be next"). CTA label is shared.
 *
 * Server Component: takes `brand`, resolves every string through `resolveText`,
 * and needs no client boundary (hover/focus are pure CSS). If the title
 * resolves empty the section renders nothing (never a blank claret plate).
 */

type PxInviteVariant = 'default' | 'sold'

type PxInviteProps = {
  brand: BrandConfig | null | undefined
  /** `default` = sell/PX copy; `sold` = recently-sold valediction copy. */
  variant?: PxInviteVariant
}

export default function PxInvite({ brand, variant = 'default' }: PxInviteProps) {
  const isSold = variant === 'sold'

  const title = resolveText(brand, isSold ? 'px.title_sold' : 'px.title')
  const body = resolveText(brand, isSold ? 'px.body_sold' : 'px.body')
  const cta = resolveText(brand, 'px.cta')

  // Never render a blank claret plate — degrade to nothing if copy is missing.
  if (!title) return null

  return (
    <section className={styles.section} aria-labelledby="px-invite-title">
      {/* Furnishing (luxury→refined): soft brand-light canvas over the claret
          plate — its aurora reads --color-primary/accent, adding depth to the
          band. Self-guards (static token wash under reduced-motion / ≤640px,
          pauses off-screen). Decorative + aria-hidden. */}
      <CanvasFX variant="aurora-light" density={0.7} className={styles.aurora} />
      <div className={styles.inner}>
        <div className={styles.content}>
          <h2 id="px-invite-title" className={styles.title} data-aos="fade-up">
            {title}
          </h2>
          {body ? (
            <p className={styles.body} data-aos="fade-up" data-aos-delay="80">
              {body}
            </p>
          ) : null}
        </div>

        {cta ? (
          <a className={styles.cta} href="/sell-my-car" data-aos="fade-up" data-aos-delay="160">
            {cta}
          </a>
        ) : null}

        {/* Single ornament — the oversized closing quote-flourish. Decorative
            only (aria-hidden), hidden ≤640, and sits BEHIND the content/CTA
            (z-index below) at ≥1024. Tinted via the on-primary token, never a
            white literal. */}
        <span className={styles.flourish} aria-hidden="true">
          &rdquo;
        </span>
      </div>
    </section>
  )
}
