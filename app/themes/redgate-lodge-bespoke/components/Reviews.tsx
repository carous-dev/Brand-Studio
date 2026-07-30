import type { BrandConfig } from '@/brands/types'
import { resolveText } from '../lib/brand-text'
import CanvasFX from '@/app/widgets/CanvasFX/CanvasFX'
import styles from './Reviews.module.css'

/**
 * Reviews — social proof for cautious buyers, styled as a guest-book spread
 * rather than a testimonial carousel. One memorable customer voice is given
 * real typographic weight; two quieter voices flank it; an aggregate score
 * line closes the featured column.
 *
 * Unique move (spec §"Unique move"): the featured quote is set in EB Garamond
 * at TITLE size (sentence case, weight 500 — a softer, "spoken" voice than the
 * 600 section heading) with a hanging open-quote glyph in `--color-primary`,
 * attributed with a small-caps serif name. On desktop it sits centred in a 2fr
 * middle column, flanked by two body-size supporting quotes with vertical
 * hairline rules between the three columns — a guest-book page, not a widget.
 * There are NO cards, star-row widgets, or carousel controls (AC1).
 *
 * Ratings without colour-only signalling (build-rules §2, no color-only signal):
 * the aggregate is carried by the TEXT score line ("Rated excellent by …"); the
 * five ★ glyphs beside it are decorative (`aria-hidden`) shapes tinted in the
 * primary "score accent". Meaning survives with colour removed (text) and with
 * the text removed (star shapes) — never colour alone.
 *
 * Tokens (spec §Tokens + AC3): section is `bg`/`text`. Primary appears ONLY on
 * the open-quote glyph and the score-accent stars — the eyebrow is `muted`, not
 * primary, so the palette screenshot shows primary in exactly two places.
 * Featured quote is `text`; supporting quotes + all attributions are `muted`;
 * hairlines are `border`. Every colour is a token — zero literals — so the
 * section reads on the claret palette AND a light throwaway brand.
 *
 * Type scale (AC5): the featured quote reuses the `title` slot clamp; the module
 * introduces no font-size beyond the theme's caption / subtitle / title / body
 * values (4 distinct sizes).
 *
 * Motion (spec §States + Furnishing, luxury→refined): a gentle staggered
 * `fade-up` cascade — eyebrow/heading, then the featured quote, then the two
 * supporting voices (60ms steps, ≤16px travel per design-language §6). The
 * primary open-quote glyph carries ONE quiet living touch: a very slow
 * `mfx-float` drift (duration slowed + reduced-motion collapsed to none). A
 * faint `aurora-light` CanvasFX washes the band for warm continuity with the
 * hero + visit-lodge (self-guards: static token wash ≤640px / reduced-motion).
 * Supporting blocks warm their quote colour on hover — colour-only, no layout
 * shift. Still a Server Component (CanvasFX is the only client island).
 *
 * Content is recipe-static (spec §Adjacency "no API"). A supporting quote whose
 * text resolves empty is dropped (never a blank cell); if the featured quote AND
 * both supports resolve empty, the section renders nothing.
 */

type ReviewsProps = {
  brand: BrandConfig | null | undefined
}

const SUPPORT_SLOTS = [2, 3] as const

export default function Reviews({ brand }: ReviewsProps) {
  const eyebrow = resolveText(brand, 'reviews.eyebrow')
  const title = resolveText(brand, 'reviews.title')
  const scoreLine = resolveText(brand, 'reviews.score_line')
  const featuredQuote = resolveText(brand, 'reviews.featured_quote')
  const featuredName = resolveText(brand, 'reviews.featured_name')

  const supports = SUPPORT_SLOTS.map((n) => ({
    quote: resolveText(brand, `reviews.quote_${n}`),
    name: resolveText(brand, `reviews.quote_${n}_name`),
  })).filter((s) => s.quote.length > 0)

  // Never render an empty guest-book spread.
  if (!featuredQuote && supports.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="reviews-title" data-aos="fade-up">
      {/* Furnishing (luxury→refined): a faint aurora-light wash for warm
          continuity with the hero + visit-lodge. Dialled low via .aurora; it
          self-guards (static token wash ≤640px / reduced-motion, pauses
          off-screen) and is decorative (aria-hidden, pointer-events:none). */}
      <CanvasFX variant="aurora-light" density={0.4} className={styles.aurora} />
      <div className={styles.inner}>
        <header className={styles.head}>
          {eyebrow ? (
            <p className={styles.eyebrow} data-aos="fade-up">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 id="reviews-title" className={styles.title} data-aos="fade-up" data-aos-delay="60">
              {title}
            </h2>
          ) : null}
        </header>

        <div className={styles.spread}>
          {featuredQuote ? (
            <figure className={styles.featured} data-aos="fade-up" data-aos-delay="120">
              <blockquote className={styles.featuredQuote}>
                <span className={`${styles.mark} mfx-float`} aria-hidden="true">
                  &ldquo;
                </span>
                {featuredQuote}
              </blockquote>
              {featuredName ? (
                <figcaption className={styles.featuredCite}>{featuredName}</figcaption>
              ) : null}
              {scoreLine ? (
                <div className={styles.score}>
                  <span className={styles.stars} aria-hidden="true">
                    ★★★★★
                  </span>
                  <span className={styles.scoreText}>{scoreLine}</span>
                </div>
              ) : null}
            </figure>
          ) : null}

          {supports.map((s, i) => (
            <figure
              className={styles.support}
              key={s.quote}
              data-slot={i === 0 ? 'left' : 'right'}
              data-aos="fade-up"
              data-aos-delay={180 + i * 60}
            >
              <blockquote className={styles.supportQuote}>{s.quote}</blockquote>
              {s.name ? <figcaption className={styles.supportCite}>{s.name}</figcaption> : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
