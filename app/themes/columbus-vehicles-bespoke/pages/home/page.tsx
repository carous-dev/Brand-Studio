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

      <section className={styles.specsBar} aria-labelledby="specs-headline">
        <div className={styles.specsInner}>
          <h2 id="specs-headline" className={styles.specsHeadline}>
            Why {dealerName}
          </h2>
          <ul className={styles.specsList} role="list">
            {SPECS.map((spec) => (
              <li key={spec.label} className={styles.specCard}>
                <span className={styles.specValue}>{spec.value}</span>
                <span className={styles.specLabel}>{spec.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <LatestArrivalsSection brandSlug={brandSlug} />
      <ServicesSection />
      <RecentlySoldPreview brandSlug={brandSlug} />
      <CtaSection />
      <ReviewsSection testimonials={(brand as any)?.testimonials} />
      <DirectorySection brandSlug={brandSlug} />
    </>
  )
}

export default ColumbusHomePage
