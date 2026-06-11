import Link from 'next/link'
import { resolveText } from '../../lib/brand-text'
import { getBrandContactInfo } from '../../lib/contact'
import {
  cars,
  carToVehicle,
  makes as seedMakes,
  resolveTestimonials,
  heroImage as defaultHero,
  showroomImage as defaultShowroom,
} from '../../lib/cars'
import { loadHomeData } from '../../lib/home-data.server'
import { CarCard } from '../../components/CarCard'
import { SectionHeading } from '../../components/SectionHeading'
import HeroSearch from '../../components/HeroSearch'
import Testimonials from '../../components/Testimonials'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const partners = ['HANDLER PROTECT', "AA — You're in safe hands", 'AutoTrader', 'Zuto Car Finance', 'Feefo Verified']

export async function FbmHomePage({ brand }: ThemePageProps) {
  const { featured, makes: apiMakes } = await loadHomeData()
  const featuredVehicles = featured.length > 0
    ? featured.slice(0, 6)
    : cars.slice(0, 6).map(carToVehicle)
  const makes = apiMakes.length > 0 ? apiMakes : seedMakes
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
  const forecourtLead = resolveText(brand, 'forecourtLead')
  const forecourtStep1 = resolveText(brand, 'forecourtStep1')
  const forecourtStep2 = resolveText(brand, 'forecourtStep2')
  const forecourtStep3 = resolveText(brand, 'forecourtStep3')
  const forecourtCtaLabel = resolveText(brand, 'forecourtCtaLabel')
  const forecourtSteps = [forecourtStep1, forecourtStep2, forecourtStep3].filter(Boolean)

  const whyEyebrow = resolveText(brand, 'whyEyebrow')
  const whyTitle = resolveText(brand, 'whyTitle')
  const partnersEyebrow = resolveText(brand, 'partnersEyebrow')
  const partnersTitle = resolveText(brand, 'partnersTitle')
  const partnersLead = resolveText(brand, 'partnersLead')
  const testimonialsEyebrow = resolveText(brand, 'testimonialsEyebrow')
  const testimonialsTitle = resolveText(brand, 'testimonialsTitle')
  const browseEyebrow = resolveText(brand, 'browseEyebrow')
  const browseTitle = resolveText(brand, 'browseTitle')
  const browseLead = resolveText(brand, 'browseLead')
  const visitTitle = resolveText(brand, 'visitTitle')
  const visitFallbackLead = resolveText(brand, 'visitLead')

  const heroBg = brand.heroImage || brand.images?.hero || defaultHero
  // Forecourt band wants a workshop / inspection scene specifically. Only
  // take a custom upload when the dealer wired the dedicated `forecourt`
  // slot — falling back to `brand.images.about` here was making every
  // record reuse their About hero (a dealership car), which is what made
  // the band read as a third copy of the hero. Theme default is now a
  // workshop bay photo that carries the meaning of the band.
  const showroomBg =
    (brand.images as any)?.forecourt ||
    defaultShowroom
  const testimonialsBg =
    (brand.images as any)?.testimonials ||
    brand.images?.about ||
    brand.heroImage ||
    defaultShowroom

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

  // Resolve the live map src in this order:
  //  1. brand.mapEmbed — operator-pasted full embed URL (preferred)
  //  2. brand.location.mapEmbed — same field nested under location
  //  3. Google Maps free embed using the resolved address as the query
  //  4. None (renders the empty-state placeholder instead)
  const brandMapEmbed =
    (brand as any)?.mapEmbed ||
    (brand?.location as any)?.mapEmbed ||
    (brand as any)?.googleMapsEmbed ||
    ''
  const mapEmbedSrc =
    typeof brandMapEmbed === 'string' && brandMapEmbed.trim()
      ? brandMapEmbed.trim()
      : mapsQuery
        ? `https://www.google.com/maps?q=${mapsQuery}&output=embed`
        : ''

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
          {featuredVehicles.map((v) => <CarCard key={v.id} vehicle={v} />)}
        </div>
      </section>

      <section className={styles.forecourt}>
        <div className={styles.forecourtInner}>
          <div className={styles.forecourtCopy}>
            <p className={`fbm-eyebrow ${styles.forecourtEyebrow}`}>{forecourtEyebrow}</p>
            <h2 className={styles.forecourtTitle}>{forecourtTitle}</h2>
            {forecourtLead && <p className={styles.forecourtLead}>{forecourtLead}</p>}
            {forecourtSteps.length > 0 && (
              <ul className={styles.forecourtSteps}>
                {forecourtSteps.map((step) => (
                  <li key={step} className={styles.forecourtStep}>
                    <span className={styles.forecourtStepIcon} aria-hidden>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/about" className={`fbm-btn-primary ${styles.forecourtCta}`}>
              {forecourtCtaLabel}
            </Link>
          </div>
          <div className={styles.forecourtMedia}>
            {showroomBg && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={showroomBg} alt="" className={styles.forecourtImage} />
            )}
            <div className={styles.forecourtMediaBadge} aria-hidden>
              <span className={styles.forecourtMediaBadgeStat}>120<span className={styles.forecourtMediaBadgeStatSub}>pt</span></span>
              <span className={styles.forecourtMediaBadgeLabel}>Inspection checklist</span>
            </div>
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
        <div className={styles.partnersHeading}>
          <SectionHeading eyebrow={partnersEyebrow} title={partnersTitle} lead={partnersLead} />
        </div>
        <div className={styles.partnersTicker} aria-hidden="true">
          <div className={styles.partnersStrip}>
            {[...partners, ...partners, ...partners].map((p, i) => (
              <span key={`${p}-${i}`} className={styles.partnerChip}>
                <svg
                  className={styles.partnerChipIcon}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{p}</span>
              </span>
            ))}
          </div>
        </div>
        <ul className={styles.partnersList}>
          {partners.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className={styles.testimonialsSection}>
        {testimonialsBg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={testimonialsBg} alt="" className={styles.testimonialsBgImage} />
        )}
        <div className={styles.testimonialsOverlay} aria-hidden />
        <div className={styles.testimonialsAtmosphere} aria-hidden />
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
            {mapEmbedSrc ? (
              <>
                <iframe
                  src={mapEmbedSrc}
                  title={`${brand?.name || 'Showroom'} location map`}
                  className={styles.visitMapFrame}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                {mapsQuery && (
                  <a
                    href={`https://maps.google.com/?q=${mapsQuery}`}
                    className={`fbm-btn-primary ${styles.visitMapFloatingCta}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get directions →
                  </a>
                )}
              </>
            ) : (
              <div className={styles.visitMapInner}>
                <div>
                  <span className={styles.visitPin}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 21s-7-6-7-11a7 7 0 1114 0c0 5-7 11-7 11z" stroke="#ffffff" strokeWidth="1.6" />
                      <circle cx="12" cy="10" r="2.5" stroke="#ffffff" strokeWidth="1.6" />
                    </svg>
                  </span>
                  <p className={styles.visitMapHint}>Map appears here once you add the showroom address.</p>
                  {contact.phoneDisplay && (
                    <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={`fbm-btn-primary ${styles.visitMapCta}`}>
                      Call {contact.phoneDisplay}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default FbmHomePage
