import type { CSSProperties } from 'react'
import Link from 'next/link'
import AppIcon, { type AppIconName } from '../../components/AppIcon'
import type { ThemePageProps } from '../../../types'
import '../../styles/about.css'

type AboutBadge = {
  icon: AppIconName
  label: string
}

type AboutStoryPoint = {
  value: string
  label: string
}

type AboutValue = {
  icon: AppIconName
  title: string
  description: string
}

type AboutTimelineItem = {
  year: string
  title: string
  description: string
}

const ICON_ALIASES: Record<string, AppIconName> = {
  award: 'award',
  car: 'car-side',
  'car-side': 'car-side',
  check: 'circle-check',
  'check-circle': 'circle-check',
  'circle-check': 'circle-check',
  comments: 'comments',
  location: 'map-marker-alt',
  map: 'map-marker-alt',
  'map-marker-alt': 'map-marker-alt',
  phone: 'phone',
  rotate: 'arrows-rotate',
  'shield-alt': 'shield-alt',
  shield: 'shield-alt',
  users: 'users',
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asText(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function asFirstText(...candidates: unknown[]): string {
  for (const candidate of candidates) {
    const value = asText(candidate)
    if (value) return value
  }
  return ''
}

function normalizeIconName(value: unknown, fallback: AppIconName): AppIconName {
  const normalized = asText(value).toLowerCase()
  return ICON_ALIASES[normalized] || fallback
}

function escapeCssUrl(url: string): string {
  return String(url || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n|\r/g, '')
}

function toTelHref(phone: string): string {
  const numeric = String(phone || '').replace(/[^0-9+]/g, '')
  return numeric ? `tel:${numeric}` : ''
}

function mapBadges(value: unknown, fallback: AboutBadge[]): AboutBadge[] {
  const mapped = asArray(value)
    .map((item) => {
      if (typeof item === 'string') {
        const label = asText(item)
        return label ? ({ icon: 'check-circle', label } satisfies AboutBadge) : null
      }

      const row = asRecord(item)
      const label = asFirstText(row.label, row.text, row.title)
      if (!label) return null

      return {
        icon: normalizeIconName(row.icon, 'check-circle'),
        label,
      } satisfies AboutBadge
    })
    .filter((item): item is AboutBadge => Boolean(item))

  return mapped.length ? mapped : fallback
}

function mapStoryPoints(value: unknown, fallback: AboutStoryPoint[]): AboutStoryPoint[] {
  const mapped = asArray(value)
    .map((item) => {
      const row = asRecord(item)
      const point = {
        value: asFirstText(row.value, row.number, row.title),
        label: asFirstText(row.label, row.description, row.subtitle),
      }

      return point.value && point.label ? point : null
    })
    .filter((item): item is AboutStoryPoint => Boolean(item))

  return mapped.length ? mapped : fallback
}

function mapValues(value: unknown, fallback: AboutValue[]): AboutValue[] {
  const mapped = asArray(value)
    .map((item) => {
      const row = asRecord(item)
      const title = asFirstText(row.title, row.heading, row.name)
      const description = asFirstText(row.description, row.text, row.body)
      if (!title || !description) return null

      return {
        icon: normalizeIconName(row.icon, 'circle-check'),
        title,
        description,
      } satisfies AboutValue
    })
    .filter((item): item is AboutValue => Boolean(item))

  return mapped.length ? mapped : fallback
}

function mapTimeline(value: unknown, fallback: AboutTimelineItem[]): AboutTimelineItem[] {
  const mapped = asArray(value)
    .map((item) => {
      const row = asRecord(item)
      const year = asFirstText(row.year, row.kicker)
      const title = asFirstText(row.title, row.heading)
      const description = asFirstText(row.description, row.text, row.body)
      if (!year || !title || !description) return null

      return { year, title, description } satisfies AboutTimelineItem
    })
    .filter((item): item is AboutTimelineItem => Boolean(item))

  return mapped.length ? mapped : fallback
}

export function ClassicAboutPage({ brand }: ThemePageProps) {
  const aboutContent = asRecord((brand as any)?.pages?.about)
  const heroContent = asRecord(aboutContent.hero)
  const storyContent = asRecord(aboutContent.story)
  const valuesContent = asRecord(aboutContent.values)
  const timelineContent = asRecord(aboutContent.timeline)
  const ctaContent = asRecord(aboutContent.cta)
  const imageContent = asRecord(aboutContent.images)
  const ctaPrimary = asRecord(ctaContent.primary)
  const ctaSecondary = asRecord(ctaContent.secondary)
  const locationAddress = asRecord((brand as any)?.location?.address)

  const city = asText(locationAddress.city)
  const county = asText(locationAddress.county)
  const locationLabel = [city, county].filter(Boolean).join(', ') || 'your area'
  const establishedYear = asFirstText(storyContent.establishedYear, aboutContent.establishedYear, (brand as any)?.establishedYear, '2013')
  const phone = asText((brand as any)?.location?.phone)

  const heroImage = asFirstText(heroContent.image, imageContent.hero, (brand as any)?.heroImage, (brand as any)?.logo)
  const storyImage = asFirstText(storyContent.image, imageContent.story, heroImage, (brand as any)?.logo)

  const pageTitle = asFirstText(aboutContent.title, 'About Us')
  const heroKicker = asFirstText(heroContent.kicker, `${brand.name}${city ? `, ${city}` : ''}`)
  const heroTitle = asFirstText(heroContent.title, `Trusted Used Car Specialists in ${city || 'Your Area'}`)
  const heroSubtitle = asFirstText(
    heroContent.description,
    heroContent.subtitle,
    (brand as any)?.aboutUs?.description,
    `${brand.name} was built around honest advice, carefully selected stock and a friendly, hassle-free buying experience.`,
  )

  const defaultBadges: AboutBadge[] = [
    { icon: 'shield-alt', label: 'Dealer You Can Trust' },
    { icon: 'users', label: 'Customer-First Team' },
    { icon: 'map-marker-alt', label: locationLabel },
  ]
  const heroBadges = mapBadges(heroContent.badges, defaultBadges)

  const storyKicker = asFirstText(storyContent.kicker, 'Our Story')
  const storyTitle = asFirstText(storyContent.title, 'A Local Dealership With A Clear Standard')
  const storyParagraphs = asArray(storyContent.paragraphs)
    .map((item) => asText(item))
    .filter(Boolean)
  if (!storyParagraphs.length) {
    storyParagraphs.push(
      asFirstText(
        storyContent.description,
        (brand as any)?.aboutUs?.description,
        `${brand.name} started with a simple goal: offer carefully selected used vehicles backed by transparent guidance and genuine customer care.`,
      ),
      asFirstText(
        storyContent.secondaryDescription,
        `Customers across ${locationLabel} trust us for fair part exchange appraisals, practical finance support and a pressure-free approach.`,
      ),
    )
  }

  const defaultStoryPoints: AboutStoryPoint[] = [
    { value: asFirstText(storyContent.experience, 'Experienced'), label: 'Motor Trade Experience' },
    { value: establishedYear, label: `Established in ${city || 'your area'}` },
    { value: asFirstText(storyContent.rating, '5-star'), label: 'Verified Customer Feedback' },
  ]
  const storyPoints = mapStoryPoints(storyContent.points, defaultStoryPoints)

  const valuesTitle = asFirstText(valuesContent.title, 'What Drives Us')
  const valuesSubtitle = asFirstText(
    valuesContent.subtitle,
    'Our values shape every valuation, vehicle listing and customer interaction.',
  )
  const defaultValues: AboutValue[] = [
    {
      icon: 'circle-check',
      title: 'Honest Detail',
      description: 'Every vehicle is presented with clear information so you can decide with confidence.',
    },
    {
      icon: 'award',
      title: 'Quality First',
      description: 'We prioritise condition, provenance and preparation before any car reaches the forecourt.',
    },
    {
      icon: 'comments',
      title: 'Real Support',
      description: 'Friendly, no-pressure advice from first enquiry through handover and after-sales questions.',
    },
    {
      icon: 'arrows-rotate',
      title: 'Long-Term Trust',
      description: 'We focus on repeat relationships and recommendations, not short-term sales tactics.',
    },
  ]
  const valueCards = mapValues(valuesContent.items, defaultValues)

  const timelineTitle = asFirstText(timelineContent.title, 'Our Journey')
  const timelineSubtitle = asFirstText(
    timelineContent.subtitle,
    `Milestones that reflect how ${brand.name} has grown with local customers.`,
  )
  const defaultTimeline: AboutTimelineItem[] = [
    {
      year: establishedYear,
      title: `${brand.name} Launches`,
      description: `We opened in ${city || 'our local area'} focused on quality used stock and straightforward service.`,
    },
    {
      year: asFirstText(timelineContent.midYear, '2018'),
      title: 'Expanded Buyer Support',
      description: 'We strengthened finance, part exchange and sourcing support to make upgrades easier.',
    },
    {
      year: asFirstText(timelineContent.currentYear, 'Today'),
      title: 'Trusted Local Specialist',
      description: `Serving ${locationLabel} with a modern, customer-first dealership experience every day.`,
    },
  ]
  const timelineItems = mapTimeline(timelineContent.items, defaultTimeline)

  const ctaKicker = asFirstText(ctaContent.kicker, 'Ready to speak with us?')
  const ctaTitle = asFirstText(ctaContent.title, 'Visit, Call or Browse Our Latest Stock')
  const ctaDescription = asFirstText(
    ctaContent.description,
    `Our team is here to help you buy, sell, source or part exchange with confidence.`,
  )
  const ctaPrimaryLabel = asFirstText(ctaPrimary.label, ctaContent.primaryLabel, 'View Used Cars')
  const ctaPrimaryHref = asFirstText(ctaPrimary.href, ctaContent.primaryHref, '/used-cars')
  const ctaSecondaryLabel = asFirstText(ctaSecondary.label, ctaContent.secondaryLabel, phone || 'Contact Us')
  const ctaSecondaryHref = asFirstText(
    ctaSecondary.href,
    ctaContent.secondaryHref,
    phone ? toTelHref(phone) : '/contact',
    '/contact',
  )

  const heroStyle: CSSProperties | undefined = heroImage
    ? {
        backgroundImage: `linear-gradient(106deg, rgba(var(--brand-text-rgb), 0.86) 0%, rgba(var(--brand-text-rgb), 0.64) 44%, rgba(var(--brand-text-rgb), 0.45) 100%), url("${escapeCssUrl(heroImage)}")`,
      }
    : undefined

  return (
    <div className="about-page">
      <section className="about-page-hero" style={heroStyle}>
        <div className="about-page-shell about-page-hero-inner">
          <nav className="about-page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>{pageTitle}</span>
          </nav>

          <p className="about-page-kicker">{heroKicker}</p>
          <h1 className="about-page-title">{heroTitle}</h1>
          <p className="about-page-subtitle">{heroSubtitle}</p>

          <div className="about-page-badges">
            {heroBadges.map((badge) => (
              <span key={`${badge.icon}-${badge.label}`}>
                <AppIcon name={badge.icon} />
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="about-page-main">
        <div className="about-page-shell">
          <div className="about-page-story">
            <div className="about-page-story-copy">
              <p className="about-page-story-kicker">{storyKicker}</p>
              <h2>{storyTitle}</h2>
              {storyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              <div className="about-page-story-points">
                {storyPoints.map((point) => (
                  <div key={`${point.value}-${point.label}`}>
                    <strong>{point.value}</strong>
                    <span>{point.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="about-page-story-media">
              <img src={storyImage} alt={`${brand.name} team and showroom`} />
            </aside>
          </div>
        </div>
      </section>

      <section className="about-page-values">
        <div className="about-page-shell">
          <header className="about-page-section-head">
            <h2>{valuesTitle}</h2>
            <p>{valuesSubtitle}</p>
          </header>

          <div className="about-page-values-grid">
            {valueCards.map((card) => (
              <article className="about-page-value-card" key={`${card.title}-${card.icon}`}>
                <span>
                  <AppIcon name={card.icon} />
                </span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-page-timeline">
        <div className="about-page-shell">
          <header className="about-page-section-head">
            <h2>{timelineTitle}</h2>
            <p>{timelineSubtitle}</p>
          </header>

          <div className="about-page-timeline-grid">
            {timelineItems.map((item) => (
              <article className="about-page-timeline-card" key={`${item.year}-${item.title}`}>
                <span className="about-page-year">{item.year}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-page-cta">
        <div className="about-page-shell about-page-cta-inner">
          <div>
            <p className="about-page-cta-kicker">{ctaKicker}</p>
            <h3>{ctaTitle}</h3>
            <p>{ctaDescription}</p>
          </div>
          <div className="about-page-cta-actions">
            <Link href={ctaPrimaryHref}>
              <AppIcon name="car-side" />
              {ctaPrimaryLabel}
            </Link>
            <a href={ctaSecondaryHref}>
              <AppIcon name="phone" />
              {ctaSecondaryLabel}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ClassicAboutPage
