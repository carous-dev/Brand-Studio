import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import LatestArrivalsSection from '../../components/LatestArrivalsSection'
import ServicesSection from '../../components/ServicesSection'
import RecentlySoldPreview from '../../components/RecentlySoldPreview'
import CtaSection from '../../components/CtaSection'
import ReviewsSection from '../../components/ReviewsSection'
import DirectorySection from '../../components/DirectorySection'
import styles from './page.module.css'

/**
 * Columbus Vehicles — Homepage (rugged archetype)
 *
 * Section composition per docs/theme-archetype-specs.md → rugged:
 *   Hero → SpecsBar → LatestArrivals (4-up) → Services (dark band)
 *   → RecentlySold preview (SOLD-banner cards) → CTA (full-bleed)
 *   → Reviews (3-up testimonials) → Directory (chip-style dark)
 *
 * LatestArrivals + RecentlySoldPreview + Directory are server components
 * that fetch their own data (next: { revalidate }) — no client-side
 * waterfall, page renders complete on first paint.
 */
export async function ColumbusHomePage({ brand }: ThemePageProps) {
  const dealerName = brand?.name || 'Columbus Vehicles'
  const brandSlug = (brand as any)?.slug

  const SPECS = [
    { value: '#1', label: '4×4 dealer in the UK' },
    { value: '5', label: 'years running' },
    { value: '4×4', label: 'specialists only' },
    { value: 'UK', label: 'nationwide delivery' },
  ]

  return (
    <>
      <Hero />

      <section
        className={styles.specsBar}
        aria-labelledby="specs-headline"
        data-aos="fade-up"
      >
        <div className={styles.specsInner}>
          <h2 id="specs-headline" className={styles.specsHeadline}>
            Why {dealerName}
          </h2>
          <ul className={styles.specsList} role="list">
            {SPECS.map((spec, i) => (
              <li
                key={spec.label}
                className={styles.specCard}
                data-aos="fade-up"
                data-aos-delay={String(80 + i * 80)}
              >
                <span className={styles.specValue}>{spec.value}</span>
                <span className={styles.specLabel}>{spec.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div data-aos="fade-up"><LatestArrivalsSection brandSlug={brandSlug} /></div>
      <div data-aos="fade-up"><ServicesSection /></div>
      <div data-aos="fade-up"><RecentlySoldPreview brandSlug={brandSlug} /></div>
      <div data-aos="zoom-in"><CtaSection /></div>
      <div data-aos="fade-up"><ReviewsSection testimonials={(brand as any)?.testimonials} /></div>
      <div data-aos="fade"><DirectorySection brandSlug={brandSlug} /></div>
    </>
  )
}

export default ColumbusHomePage
