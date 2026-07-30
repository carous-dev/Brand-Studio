import type { BrandConfig } from '@/brands/types'
import { resolveText } from '../lib/brand-text'
import { themeImageCss } from '@/app/themes/lib/theme-images'
import imageRecipe from '../recipes/image-recipe.json'
import styles from './AboutStory.module.css'

/**
 * AboutStory — the /about story split (design-language §7: text + framed photo
 * reusing the hero mat treatment, on `bg`). Left column is the brand's story in
 * two warm paragraphs; right column is a claret-matted framed photo (the same
 * mat grammar as the hero and VisitLodge), resolved through the image contract
 * (recipes/image-recipe.json slot "about"): brand.images.about → theme default →
 * `none` (the framed surface fallback). No hardcoded image path.
 *
 * Server Component: resolves every string through `resolveText` with generic
 * fallbacks (no seed-dealer strings). Tokens only — the mat is
 * `color-mix(primary 12%, bg)`, so it reads on the claret palette AND a light
 * throwaway brand. If both story paragraphs resolve empty the section renders
 * nothing.
 */

type AboutStoryProps = {
  brand: BrandConfig | null | undefined
}

export default function AboutStory({ brand }: AboutStoryProps) {
  const eyebrow = resolveText(brand, 'about.eyebrow')
  const title = resolveText(brand, 'about.title')
  const body1 = resolveText(brand, 'about.body_1')
  const body2 = resolveText(brand, 'about.body_2')

  if (!body1 && !body2 && !title) return null

  const photoStyle = { backgroundImage: themeImageCss(imageRecipe, brand, 'about') }

  return (
    <section className={styles.section} aria-labelledby="about-story-title" data-aos="fade-up">
      <div className={styles.inner}>
        <div className={styles.text}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          {title ? (
            <h2 id="about-story-title" className={styles.title}>
              {title}
            </h2>
          ) : null}
          {body1 ? <p className={styles.body}>{body1}</p> : null}
          {body2 ? <p className={styles.body}>{body2}</p> : null}
        </div>

        <figure className={styles.figure}>
          <span className={styles.mat} aria-hidden="true" />
          <div className={styles.frame}>
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
      </div>
    </section>
  )
}
