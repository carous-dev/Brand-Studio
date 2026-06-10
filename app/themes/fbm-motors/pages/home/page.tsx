import Link from 'next/link'
import { resolveText } from '../../lib/brand-text'
import { getBrandContactInfo } from '../../lib/contact'
import {
  cars,
  makes,
  resolveTestimonials,
  heroImage as defaultHero,
  showroomImage as defaultShowroom,
} from '../../lib/cars'
import { CarCard } from '../../components/CarCard'
import { SectionHeading } from '../../components/SectionHeading'
import HeroSearch from '../../components/HeroSearch'
import Testimonials from '../../components/Testimonials'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const partners = ['HANDLER PROTECT', "AA — You're in safe hands", 'AutoTrader', 'Zuto Car Finance', 'Feefo Verified']

export function FbmHomePage({ brand }: ThemePageProps) {
  const testimonials = resolveTestimonials(brand)
  const contact = getBrandContactInfo(brand)

  const heroEyebrow = resolveText(brand, 'heroEyebrow')
  const heroTitleLead = resolveText(brand, 'heroTitleLead')
  const heroTitleAccent = resolveText(brand, 'heroTitleAccent')
  const heroTitleTrail = resolveText(brand, 'heroTitleTrail')
  const heroLead = resolveText(brand, 'heroLead')

  const stockEyebrow = resolveText(brand, 'stockEyebrow')
  const stockTitle = resolveText(brand, 'stockTitle')
  const stockViewAllLabel = resolveText(brand, 'stockViewAllLabel')

  const forecourtEyebrow = resolveText(brand, 'forecourtEyebrow')
  const forecourtTitle = resolveText(brand, 'forecourtTitle')
  const forecourtCtaLabel = resolveText(brand, 'forecourtCtaLabel')

  const whyEyebrow = resolveText(brand, 'whyEyebrow')
  const whyTitle = resolveText(brand, 'whyTitle')
  const partnersTitle = resolveText(brand, 'partnersTitle')
  const testimonialsEyebrow = resolveText(brand, 'testimonialsEyebrow')
  const testimonialsTitle = resolveText(brand, 'testimonialsTitle')
  const browseEyebrow = resolveText(brand, 'browseEyebrow')
  const browseTitle = resolveText(brand, 'browseTitle')
  const browseLead = resolveText(brand, 'browseLead')
  const visitTitle = resolveText(brand, 'visitTitle')
  const visitFallbackLead = resolveText(brand, 'visitLead')

  const heroBg = brand.heroImage || brand.images?.hero || defaultHero
  const showroomBg = brand.images?.about || brand.heroImage || defaultShowroom

  const visitAddress =
    (brand.location as any)?.fullAddress ||
    [brand.location?.address?.line1, brand.location?.address?.line2, brand.location?.address?.city, brand.location?.address?.county, brand.location?.address?.postcode]
      .filter(Boolean)
      .join(', ')

  const whyItems: Array<{ title: string; body: string; iconPath: string }> = [
    {
      title: resolveText(brand, 'why1Title'),
      body: resolveText(brand, 'why1Body'),
      iconPath: 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z',
    },
    {
      title: resolveText(brand, 'why2Title'),
      body: resolveText(brand, 'why2Body'),
      iconPath: 'M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3z',
    },
    {
      title: resolveText(brand, 'why3Title'),
      body: resolveText(brand, 'why3Body'),
      iconPath: 'M4 17l5-5 4 4 7-8M16 8h4v4',
    },
  ]

  const mapsQuery = visitAddress ? encodeURIComponent(visitAddress) : ''

  return (
    <>
      <section className={styles.hero}>
        {heroBg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroBg} alt="" className={styles.heroImage} />
        )}
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroAtmosphere} aria-hidden />
        <div className={styles.heroInner}>
          {heroEyebrow && heroEyebrow !== 'the showroom' && (
            <p className={`fbm-eyebrow ${styles.heroEyebrow} fbm-animate-rise`}>{heroEyebrow}</p>
          )}
          <h1 className={`${styles.heroTitle} fbm-animate-rise`} style={{ animationDelay: '100ms' }}>
            {heroTitleLead}{' '}
            <span className={styles.heroAccent}>{heroTitleAccent}</span>{' '}
            {heroTitleTrail}
          </h1>
          {heroLead && (
            <p className={`${styles.heroLead} fbm-animate-rise`} style={{ animationDelay: '180ms' }}>{heroLead}</p>
          )}
          <HeroSearch makes={makes} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className="fbm-eyebrow">{stockEyebrow}</p>
            <h2 className={styles.sectionHeadingTitle}>{stockTitle}</h2>
          </div>
          <Link href="/used-cars" className="fbm-btn-ghost">{stockViewAllLabel}</Link>
        </div>
        <div className={styles.stockGrid}>
          {cars.slice(0, 6).map((car) => <CarCard key={car.id} car={car} />)}
        </div>
      </section>

      <section className={styles.showroom}>
        {showroomBg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={showroomBg} alt="" className={styles.showroomImage} />
        )}
        <div className={styles.showroomOverlay} aria-hidden />
        <div className={styles.showroomBody}>
          <div className={styles.showroomInner}>
            <p className={`fbm-eyebrow ${styles.showroomEyebrow}`}>{forecourtEyebrow}</p>
            <h2 className={styles.showroomTitle}>{forecourtTitle}</h2>
            <Link href="/about" className={`fbm-btn-ghost-dark ${styles.showroomCta}`}>{forecourtCtaLabel}</Link>
          </div>
        </div>
      </section>

      <section className={styles.whyUsSection}>
        <div className={styles.whyUsInner}>
          <SectionHeading eyebrow={whyEyebrow} title={whyTitle} />
          <div className={styles.whyGrid}>
            {whyItems.map((f) => (
              <div key={f.title} className={styles.whyCard}>
                <span className={styles.whyIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                    <path d={f.iconPath} stroke="currentColor" strokeWidth="1.6" fill="none" />
                  </svg>
                </span>
                <h3 className={styles.whyCardTitle}>{f.title}</h3>
                <p className={styles.whyCardBody}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.partners} aria-label="Our partners">
        <SectionHeading title={partnersTitle} />
        <div className={styles.partnersTicker}>
          <div className={styles.partnersStrip}>
            {[...partners, ...partners].map((p, i) => (
              <span key={`${p}-${i}`} className={styles.partnerName}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.testimonialsSection}>
        <div className={styles.testimonialsInner}>
          <SectionHeading dark eyebrow={testimonialsEyebrow} title={testimonialsTitle} />
          <Testimonials items={testimonials} />
        </div>
      </section>

      <section className={styles.section}>
        <SectionHeading eyebrow={browseEyebrow} title={browseTitle} lead={browseLead} />
        <div className={styles.browseGrid}>
          {makes.map((m) => (
            <Link key={m.name} href="/used-cars" className={styles.makeCard}>
              <div>
                <p className={styles.makeName}>{m.name}</p>
                <p className={styles.makeCount}>{m.count} cars</p>
              </div>
              <span className={styles.makeArrow}>→</span>
            </Link>
          ))}
        </div>
        <div className={styles.browseCtaWrap}>
          <Link href="/used-cars" className="fbm-btn-primary">View all stock →</Link>
        </div>
      </section>

      <section className={styles.visitSection}>
        <div className={styles.visitInner}>
          <SectionHeading title={visitTitle} lead={visitAddress || visitFallbackLead} />
          <div className={styles.visitMap}>
            <div className={styles.visitMapInner}>
              <div>
                <span className={styles.visitPin}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 21s-7-6-7-11a7 7 0 1114 0c0 5-7 11-7 11z" stroke="#ffffff" strokeWidth="1.6" />
                    <circle cx="12" cy="10" r="2.5" stroke="#ffffff" strokeWidth="1.6" />
                  </svg>
                </span>
                <p className={styles.visitMapHint}>Interactive map — drop in your Google Maps embed here</p>
                {mapsQuery && (
                  <a
                    href={`https://maps.google.com/?q=${mapsQuery}`}
                    className={`fbm-btn-primary ${styles.visitMapCta}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get directions
                  </a>
                )}
                {!mapsQuery && contact.phoneDisplay && (
                  <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={`fbm-btn-primary ${styles.visitMapCta}`}>
                    Call {contact.phoneDisplay}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default FbmHomePage
