import type { BrandConfig } from '@/brands/types'
import { resolveText } from '../lib/brand-text'
import CanvasFX from '@/app/widgets/CanvasFX/CanvasFX'
import styles from './AftercareSuite.module.css'

/**
 * AftercareSuite — the theme's differentiator section. Sells the dealer's
 * "full house" of aftercare (workshop, bodyshop, valeting, and more on
 * /services) so buyers understand they're buying a relationship, not just a
 * car. Hospitality-toned copy ("The workshop", "The bodyshop", "The car spa").
 *
 * Unique move (spec §"Unique move"): cards behave like house departments —
 * each card's top edge carries a short 32px-wide primary "bookmark" bar
 * (3px tall) instead of an icon-in-a-circle; on hover (≥1024) that bar slides
 * to the full card width (240ms; reduced-motion collapses it to none). No
 * sibling theme marks cards with an animated top tab.
 *
 * Two variants (spec §Layout / design-language §7):
 *  - `home` (default): 3 cards on a `--color-surface` band, with the shared
 *    connecting-rule title line ("See all services →", same motif as
 *    featured-stock). Wired as the homepage's fourth section.
 *  - `services`: 6 cards on a `--color-bg` band, no "see all" link (the page
 *    ribbon already owns the page heading). Cards invert to `--color-surface`.
 *
 * Surface grammar (design-language §5): cards are `bg`-on-`surface` (home) /
 * `surface`-on-`bg` (services) plates — the inversion of the vehicle card —
 * so the page never feels striped. Hairlines only; no shadows, no gradients.
 * Every colour is a token / color-mix so the section reads on the claret
 * palette AND a light throwaway brand.
 *
 * Server Component: takes `brand` as a prop and resolves every string through
 * `resolveText`. Hover is pure CSS, so no client boundary is needed. Content
 * is recipe-static — a card whose title resolves empty is dropped (never a
 * blank plate); if none resolve, the section renders nothing.
 */

type AftercareVariant = 'home' | 'services'

type AftercareSuiteProps = {
  brand: BrandConfig | null | undefined
  /** `home` = 3 cards + "see all" link on `surface`; `services` = 6 cards on `bg`. */
  variant?: AftercareVariant
}

const HOME_SLOTS = [1, 2, 3] as const
const SERVICES_SLOTS = [1, 2, 3, 4, 5, 6] as const

export default function AftercareSuite({ brand, variant = 'home' }: AftercareSuiteProps) {
  const isServices = variant === 'services'
  const slots = isServices ? SERVICES_SLOTS : HOME_SLOTS

  const eyebrow = resolveText(brand, 'aftercare.eyebrow')
  const title = resolveText(brand, 'aftercare.title')
  const viewAll = resolveText(brand, 'aftercare.view_all')
  const cardLink = resolveText(brand, 'aftercare.card_link')

  const cards = slots
    .map((n) => ({
      title: resolveText(brand, `aftercare.${n}_title`),
      body: resolveText(brand, `aftercare.${n}_body`),
    }))
    // Never render a blank plate — degrade gracefully if a slot resolves empty.
    .filter((card) => card.title.length > 0)

  if (cards.length === 0) return null

  return (
    <section
      className={`${styles.section} ${isServices ? styles.services : styles.home}`}
      aria-labelledby="aftercare-suite-title"
    >
      {/* Furnishing (luxury→refined): the same soft brand-light canvas the hero
          and visit-lodge carry, held fainter here so the bookmark-tab cards stay
          the focus. Self-guards (static token wash ≤640px / reduced-motion,
          pauses off-screen) so no *-decor-mobile-hide is needed. */}
      <CanvasFX variant="aurora-light" density={0.4} className={styles.aurora} />
      <div className={styles.inner}>
        <header className={styles.head}>
          {eyebrow ? (
            <p className={styles.eyebrow} data-aos="fade-up">
              {eyebrow}
            </p>
          ) : null}
          <div className={styles.titleRow}>
            <h2
              id="aftercare-suite-title"
              className={styles.title}
              data-aos="fade-up"
              data-aos-delay="60"
            >
              {title}
            </h2>
            {/* Home only: the connecting rule + "See all services →" link
                (the featured-stock header motif). /services omits it — the
                page ribbon already carries the heading and there is no larger
                services index to link to. */}
            {!isServices && viewAll ? (
              <>
                <span className={styles.rule} aria-hidden="true" />
                <a className={styles.viewAll} href="/services">
                  {viewAll}
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </a>
              </>
            ) : null}
          </div>
        </header>

        <div className={styles.grid}>
          {cards.map((card, index) => (
            <article
              className={styles.card}
              key={card.title}
              data-aos="fade-up"
              data-aos-delay={120 + index * 60}
            >
              <span className={styles.tab} aria-hidden="true" />
              <h3 className={styles.cardTitle}>{card.title}</h3>
              {card.body ? <p className={styles.cardBody}>{card.body}</p> : null}
              <a
                className={styles.cardLink}
                href="/services"
                aria-label={cardLink ? `${card.title} — ${cardLink}` : card.title}
              >
                {cardLink}
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
