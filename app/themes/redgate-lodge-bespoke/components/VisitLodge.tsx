import type { BrandConfig } from '@/brands/types'
import { getBrandContactInfo } from '../lib/contact'
import { resolveText } from '../lib/brand-text'
import { themeImageCss } from '@/app/themes/lib/theme-images'
import imageRecipe from '../recipes/image-recipe.json'
import CanvasFX from '@/app/widgets/CanvasFX/CanvasFX'
import styles from './VisitLodge.module.css'

/**
 * Visit lodge — the homepage closer (design-language §7: last route section on
 * `/`, on `surface`, before the shell BrowseByMake band). Answers the practical
 * questions an older buyer wants on paper: where you are, when you're open, how
 * to reach you — plus the hospitality promise for buyers travelling a distance.
 *
 * Unique move (spec §"Unique move"): an "arrival card" laid out like a hotel
 * welcome sheet. Left column is a hairline-ruled details list (Address / Phone /
 * Email / Hours as label-value rows in a real <dl>); right column reuses the
 * hero's claret-mat framed-photo treatment at a smaller 12px offset over a
 * short, italic-leaning "travelling far?" hospitality note. Typography and rules
 * only — no map embed (AC1), no icon grid.
 *
 * Data plumbing (build-rules §12): all contact data flows through
 * `getBrandContactInfo` — never the raw address object (AC4). Every string
 * routes through `resolveText` with generic recipe fallbacks. The photo
 * resolves through the image contract (recipes/image-recipe.json slot
 * "visitLocation"): brand.images.visitLocation → theme default → `none` (the
 * framed surface fallback). No hardcoded image path.
 *
 * Hours guard (spec §Adjacency "hours guarded", AC5): `brand.openingHours` has
 * many shapes and is usually "Appointment Only"/empty. `buildHoursRows` accepts
 * ONLY non-empty string day→value entries and NEVER synthesises a "Closed" line
 * for absent days. When nothing legible survives, the Hours row renders
 * `visit.hours_fallback` ("Call us to arrange a time that suits you") — a warm
 * line, never a false "Closed".
 *
 * Tokens (spec §Tokens): section is `surface`/`text`; labels `muted`
 * (serif-caps caption); values `text`; links `primary`; every row hairline +
 * the closing full-width hairline are `border`; the photo mat is
 * `color-mix(primary 12%, bg)`. Zero literals, so it reads on the claret palette
 * AND a light throwaway brand.
 *
 * Reuse (spec §Adjacency): `variant="bare"` renders the details list + note in a
 * transparent wrapper with no photo and no band — for the /contact split's right
 * column. `variant="section"` (default) is the banded homepage closer whose
 * bottom hairline is the same-token separator before BrowseByMake (also
 * `surface`), satisfying design-language §7 (AC3).
 *
 * Pure Server Component: no interactivity (tel:/mailto:/maps are plain anchors),
 * and hours are parsed server-side, so `home/page.tsx` stays a Server Component.
 */

type VisitLodgeProps = {
  brand: BrandConfig | null | undefined
  /** `section` = banded homepage closer (default); `bare` = /contact right column. */
  variant?: 'section' | 'bare'
}

type HoursRow = { label: string; value: string; order: number }

// Canonical week order + display labels for the common day-key spellings. Any
// unrecognised key falls back to a title-cased version of the raw key and sorts
// to the end (stable) — we never invent a day that isn't in the record.
const DAY_META: Record<string, { label: string; order: number }> = {
  monday: { label: 'Monday', order: 1 },
  mon: { label: 'Monday', order: 1 },
  tuesday: { label: 'Tuesday', order: 2 },
  tue: { label: 'Tuesday', order: 2 },
  tues: { label: 'Tuesday', order: 2 },
  wednesday: { label: 'Wednesday', order: 3 },
  wed: { label: 'Wednesday', order: 3 },
  thursday: { label: 'Thursday', order: 4 },
  thu: { label: 'Thursday', order: 4 },
  thur: { label: 'Thursday', order: 4 },
  thurs: { label: 'Thursday', order: 4 },
  friday: { label: 'Friday', order: 5 },
  fri: { label: 'Friday', order: 5 },
  saturday: { label: 'Saturday', order: 6 },
  sat: { label: 'Saturday', order: 6 },
  sunday: { label: 'Sunday', order: 7 },
  sun: { label: 'Sunday', order: 7 },
  weekdays: { label: 'Weekdays', order: 8 },
  weekend: { label: 'Weekend', order: 9 },
  weekends: { label: 'Weekend', order: 9 },
}

function titleCase(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

/**
 * Normalise `brand.openingHours` (shape is unreliable — Record<string,string>,
 * but often empty / non-string / grouped) into readable rows. ONLY non-empty
 * string values are kept; absent days are simply omitted — we never fabricate a
 * "Closed" row (build-rules §12). Returns [] when nothing legible remains, which
 * the caller renders as `visit.hours_fallback`.
 */
function buildHoursRows(openingHours: unknown): HoursRow[] {
  if (!openingHours || typeof openingHours !== 'object' || Array.isArray(openingHours)) return []
  const rows: HoursRow[] = []
  let insertion = 20
  for (const [rawKey, rawVal] of Object.entries(openingHours as Record<string, unknown>)) {
    const value = typeof rawVal === 'string' ? rawVal.trim() : ''
    if (!value) continue // skip empty / non-string — never invent a value
    const meta = DAY_META[String(rawKey).trim().toLowerCase()]
    rows.push({
      label: meta ? meta.label : titleCase(rawKey),
      value,
      order: meta ? meta.order : insertion++,
    })
  }
  rows.sort((a, b) => a.order - b.order)
  return rows
}

export default function VisitLodge({ brand, variant = 'section' }: VisitLodgeProps) {
  const contact = getBrandContactInfo(brand)

  const eyebrow = resolveText(brand, 'visit.eyebrow')
  const title = resolveText(brand, 'visit.title')
  const labelAddress = resolveText(brand, 'visit.label_address')
  const labelPhone = resolveText(brand, 'visit.label_phone')
  const labelEmail = resolveText(brand, 'visit.label_email')
  const labelHours = resolveText(brand, 'visit.label_hours')
  const hoursFallback = resolveText(brand, 'visit.hours_fallback')
  const note = resolveText(brand, 'visit.note')
  const directions = resolveText(brand, 'visit.directions')

  const address = contact.showroomAddress
  const hoursRows = buildHoursRows((brand as any)?.openingHours)
  const directionsHref = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : ''

  const isSection = variant !== 'bare'

  // Photo via the image contract (recipes/image-recipe.json slot
  // "visitLocation"): brand.images.visitLocation → theme default → `none`.
  const photoStyle = { backgroundImage: themeImageCss(imageRecipe, brand, 'visitLocation') }

  const details = (
    <dl className={styles.details}>
      {address ? (
        <div className={styles.row} data-aos="fade-up">
          <dt className={styles.label}>{labelAddress}</dt>
          <dd className={styles.value}>
            <span className={styles.addressText}>{address}</span>
            {directionsHref && directions ? (
              <a
                className={styles.directions}
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {directions}
              </a>
            ) : null}
          </dd>
        </div>
      ) : null}

      {contact.phoneTel ? (
        <div className={styles.row} data-aos="fade-up" data-aos-delay="60">
          <dt className={styles.label}>{labelPhone}</dt>
          <dd className={styles.value}>
            <a className={styles.link} href={`tel:${contact.phoneTel}`}>
              {contact.phoneDisplay || contact.phoneTel}
            </a>
          </dd>
        </div>
      ) : null}

      {contact.email ? (
        <div className={styles.row} data-aos="fade-up" data-aos-delay="120">
          <dt className={styles.label}>{labelEmail}</dt>
          <dd className={styles.value}>
            <a className={styles.link} href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </dd>
        </div>
      ) : null}

      {/* Hours row ALWAYS renders — the fallback guarantees content and guards
          against a false "Closed" when openingHours is empty/unknown (AC5). */}
      <div className={styles.row} data-aos="fade-up" data-aos-delay="180">
        <dt className={styles.label}>{labelHours}</dt>
        <dd className={styles.value}>
          {hoursRows.length > 0 ? (
            <ul className={styles.hoursList}>
              {hoursRows.map((h) => (
                <li className={styles.hoursItem} key={h.label}>
                  <span className={styles.hoursDay}>{h.label}</span>
                  <span className={styles.hoursValue}>{h.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className={styles.hoursFallback}>{hoursFallback}</span>
          )}
        </dd>
      </div>
    </dl>
  )

  const header =
    eyebrow || title ? (
      <header className={styles.head}>
        {eyebrow ? (
          <p className={styles.eyebrow} data-aos="fade-up">
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h2 id="visit-title" className={styles.title} data-aos="fade-up" data-aos-delay="60">
            {title}
          </h2>
        ) : null}
      </header>
    ) : null

  const body = (
    <div className={styles.inner}>
      {header}
      <div className={styles.layout}>
        <div className={styles.detailsCol}>{details}</div>
        <div className={styles.aside}>
          {isSection ? (
            <figure className={styles.figure} data-aos="fade-up" data-aos-delay="120">
              <span className={styles.mat} aria-hidden="true" />
              <div className={`${styles.frame} mfx-spotlight`}>
                <span className={styles.placeholder} aria-hidden="true">
                  {eyebrow || title}
                </span>
                <div
                  className={styles.photo}
                  role="img"
                  aria-label={title || eyebrow}
                  style={photoStyle}
                />
              </div>
            </figure>
          ) : null}
          {note ? (
            <p className={styles.note} data-aos="fade-up" data-aos-delay="200">
              {note}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )

  if (!isSection) {
    return (
      <div className={styles.bare} aria-labelledby="visit-title">
        {body}
      </div>
    )
  }

  return (
    <section className={styles.section} aria-labelledby="visit-title" data-aos="fade-up">
      {/* Furnishing (luxury→refined): the same soft brand-light canvas the hero
          got, behind the arrival card. Self-guards — static token wash under
          reduced-motion / ≤640px, pauses off-screen. Decorative + aria-hidden. */}
      <CanvasFX variant="aurora-light" density={0.7} className={styles.aurora} />
      {body}
    </section>
  )
}
