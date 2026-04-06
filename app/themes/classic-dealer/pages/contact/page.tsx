import type { CSSProperties } from 'react'
import Link from 'next/link'
import AppIcon, { type AppIconName } from '../../components/AppIcon'
import type { ThemePageProps } from '../../../types'
import '../../styles/contact.css'

type ContactBadge = {
  icon: AppIconName
  label: string
}

type ContactInfoCard = {
  icon: AppIconName
  title: string
  lines: string[]
  ctaLabel: string
  ctaHref: string
}

const ICON_ALIASES: Record<string, AppIconName> = {
  clock: 'clock',
  email: 'envelope',
  envelope: 'envelope',
  location: 'location-dot',
  'location-dot': 'location-dot',
  map: 'map-marker-alt',
  'map-marker-alt': 'map-marker-alt',
  phone: 'phone',
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

function splitLines(value: unknown): string[] {
  const text = asText(value)
  if (!text) return []
  return text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function escapeCssUrl(url: string): string {
  return String(url || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n|\r/g, '')
}

function normalizeIconName(value: unknown, fallback: AppIconName): AppIconName {
  const normalized = asText(value).toLowerCase()
  return ICON_ALIASES[normalized] || fallback
}

function toTelHref(phone: string): string {
  const numeric = String(phone || '').replace(/[^0-9+]/g, '')
  return numeric ? `tel:${numeric}` : ''
}

function isExternalLink(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

function buildAddressLine(locationAddress: Record<string, unknown>, fallbackAddress: string): string {
  const line1 = asText(locationAddress.line1)
  const line2 = asText(locationAddress.line2)
  const city = asText(locationAddress.city)
  const county = asText(locationAddress.county)
  const postcode = asText(locationAddress.postcode)
  const composed = [line1, line2, city, county, postcode].filter(Boolean).join(', ')
  return composed || fallbackAddress
}

function getOpeningHourLines(contentHours: unknown, openingHours: unknown): string[] {
  const explicitLines = splitLines(contentHours)
  if (explicitLines.length) return explicitLines

  const source = asRecord(openingHours)
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const lines = days
    .map((day) => {
      const value = asText(source[day])
      if (!value) return ''
      return `${day.charAt(0).toUpperCase()}${day.slice(1)}: ${value}`
    })
    .filter(Boolean)

  return lines.length ? lines : ['Mon-Sat: 09:00-17:00', 'Viewings by appointment only']
}

function mapBadges(value: unknown, fallback: ContactBadge[]): ContactBadge[] {
  const mapped = asArray(value)
    .map((item) => {
      if (typeof item === 'string') {
        const label = asText(item)
        return label ? ({ icon: 'check-circle', label } satisfies ContactBadge) : null
      }

      const row = asRecord(item)
      const label = asFirstText(row.label, row.text, row.title)
      if (!label) return null

      return {
        icon: normalizeIconName(row.icon, 'check-circle'),
        label,
      } satisfies ContactBadge
    })
    .filter((item): item is ContactBadge => Boolean(item))

  return mapped.length ? mapped : fallback
}

function mapInfoCards(value: unknown, fallback: ContactInfoCard[]): ContactInfoCard[] {
  const mapped = asArray(value)
    .map((item) => {
      const row = asRecord(item)
      const title = asFirstText(row.title, row.heading)
      if (!title) return null

      const lines = [
        ...splitLines(row.description),
        ...splitLines(row.details),
      ]
      const ctaLabel = asFirstText(row.ctaLabel, row.linkLabel, row.actionLabel)
      const ctaHref = asFirstText(row.ctaHref, row.linkHref, row.href)

      return {
        icon: normalizeIconName(row.icon, 'check-circle'),
        title,
        lines: lines.length ? lines : ['Get in touch with our team.'],
        ctaLabel,
        ctaHref,
      } satisfies ContactInfoCard
    })
    .filter((item): item is ContactInfoCard => Boolean(item))

  return mapped.length ? mapped : fallback
}

export function ClassicContactPage({ brand }: ThemePageProps) {
  const contactContent = asRecord((brand as any)?.pages?.contact)
  const heroContent = asRecord(contactContent.hero)
  const infoContent = asRecord(contactContent.info)
  const mapContent = asRecord(contactContent.map)
  const formContent = asRecord(contactContent.form)
  const location = asRecord((brand as any)?.location)
  const locationAddress = asRecord(location.address)

  const brandName = asFirstText((brand as any)?.name, 'Our Dealership')
  const primaryPhone = asFirstText(infoContent.phone, location.phone)
  const secondaryPhone = asFirstText(infoContent.secondaryPhone, (location as any)?.phoneSecondary, (location as any)?.phone2)
  const phoneHref = toTelHref(primaryPhone)
  const email = asFirstText(infoContent.email, location.email, 'info@example.com')
  const address = asFirstText(
    infoContent.address,
    location.fullAddress,
    buildAddressLine(locationAddress, ''),
    'Address available on request',
  )

  const openingHourLines = getOpeningHourLines(infoContent.hours, (brand as any)?.openingHours)
  const hoursSummary = openingHourLines[0] || 'Viewings by appointment only'
  const phoneBadgeLabel = primaryPhone || 'Call our team'
  const emailBadgeLabel = email || 'Email us'

  const heroImage = asFirstText(heroContent.image, (contactContent as any)?.heroImage, (brand as any)?.heroImage, (brand as any)?.logo)
  const heroStyle: CSSProperties | undefined = heroImage
    ? {
        backgroundImage: `linear-gradient(106deg, rgba(var(--brand-text-rgb), 0.86) 0%, rgba(var(--brand-text-rgb), 0.64) 44%, rgba(var(--brand-text-rgb), 0.46) 100%), url(\"${escapeCssUrl(heroImage)}\")`,
      }
    : undefined

  const pageTitle = asFirstText(contactContent.title, 'Contact Us')
  const heroKicker = asFirstText(heroContent.kicker, `${brandName} Team`)
  const heroTitle = asFirstText(heroContent.title, 'Contact Us')
  const heroSubtitle = asFirstText(
    heroContent.description,
    heroContent.subtitle,
    `Speak with our team about stock availability, finance options, part exchange, vehicle sourcing or selling your car.`,
  )

  const badgeFallback: ContactBadge[] = [
    { icon: 'phone', label: phoneBadgeLabel },
    { icon: 'envelope', label: emailBadgeLabel },
    { icon: 'clock', label: `${hoursSummary} (Appointment only)` },
  ]
  const heroBadges = mapBadges(heroContent.badges, badgeFallback)

  const infoHeading = asFirstText(infoContent.title, 'Get In Touch')
  const infoDescription = asFirstText(
    infoContent.description,
    `Reach us directly by phone, email or visit. For detailed requests, submit the enquiry form and we will respond with the right next step.`,
  )

  const visitMapHref = `https://maps.google.com/?q=${encodeURIComponent(address)}`
  const bookAppointmentHref = email ? `mailto:${email}?subject=${encodeURIComponent('Appointment Request')}` : '/contact'
  const defaultInfoCards: ContactInfoCard[] = [
    {
      icon: 'phone',
      title: 'Call Us',
      lines: ['Speak to our team for immediate assistance.', ...(secondaryPhone ? [`Alt: ${secondaryPhone}`] : [])],
      ctaLabel: primaryPhone || 'Call now',
      ctaHref: phoneHref || '/contact',
    },
    {
      icon: 'envelope',
      title: 'Email',
      lines: ['Send us your details and requirements.'],
      ctaLabel: email,
      ctaHref: email ? `mailto:${email}` : '/contact',
    },
    {
      icon: 'location-dot',
      title: 'Visit Us',
      lines: splitLines(address).length ? splitLines(address) : [address],
      ctaLabel: 'Open in Maps',
      ctaHref: visitMapHref,
    },
    {
      icon: 'clock',
      title: 'Opening Hours',
      lines: [...openingHourLines, 'Viewings by appointment only'],
      ctaLabel: 'Book Appointment',
      ctaHref: bookAppointmentHref,
    },
  ]
  const infoCards = mapInfoCards(infoContent.cards, defaultInfoCards)

  const mapQuery = asFirstText(mapContent.query, mapContent.address, address)
  const mapEmbed = asFirstText(mapContent.embedUrl)
  const mapSrc = mapEmbed || `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
  const mapTitle = asFirstText(mapContent.title, `${brandName} map location`)

  const formKicker = asFirstText(formContent.kicker, 'Quick Enquiry')
  const formTitle = asFirstText(formContent.title, 'Send A Message')
  const formDescription = asFirstText(formContent.description, 'We will direct your enquiry to the right team member.')
  const enquiryTypes = asArray(formContent.enquiryTypes)
    .map((item) => asText(item))
    .filter(Boolean)
  const enquiryOptions = enquiryTypes.length
    ? enquiryTypes
    : ['Used Car Enquiry', 'Finance Enquiry', 'Part Exchange', 'Sell Your Car', 'General Enquiry']
  const preferredContactValues = asArray(formContent.preferredContactOptions)
    .map((item) => asText(item))
    .filter(Boolean)
  const preferredContactOptions = preferredContactValues.length ? preferredContactValues : ['Phone', 'Email', 'WhatsApp']
  const submitLabel = asFirstText(formContent.submitLabel, 'Send Enquiry')
  const formAction = email ? `mailto:${email}` : 'mailto:'

  return (
    <div className="contact-page">
      <section className="contact-page-hero" style={heroStyle}>
        <div className="contact-page-shell contact-page-hero-inner">
          <nav className="contact-page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>{pageTitle}</span>
          </nav>

          <p className="contact-page-kicker">{heroKicker}</p>
          <h1 className="contact-page-title">{heroTitle}</h1>
          <p className="contact-page-subtitle">{heroSubtitle}</p>

          <div className="contact-page-badges">
            {heroBadges.map((badge) => (
              <span key={`${badge.icon}-${badge.label}`}>
                <AppIcon name={badge.icon} />
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-page-main">
        <div className="contact-page-shell contact-page-grid">
          <div className="contact-page-info">
            <header className="contact-page-section-head">
              <h2>{infoHeading}</h2>
              <p>{infoDescription}</p>
            </header>

            <div className="contact-page-info-cards">
              {infoCards.map((card) => {
                const external = isExternalLink(card.ctaHref)
                return (
                  <article className="contact-page-info-card" key={`${card.title}-${card.icon}`}>
                    <span className="contact-page-icon">
                      <AppIcon name={card.icon} />
                    </span>
                    <h3>{card.title}</h3>
                    <p>
                      {card.lines.map((line, index) => (
                        <span key={`${card.title}-line-${index}`}>
                          {line}
                          {index < card.lines.length - 1 ? <br /> : null}
                        </span>
                      ))}
                    </p>
                    {card.ctaLabel && card.ctaHref ? (
                      <a
                        href={card.ctaHref}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                      >
                        {card.ctaLabel}
                      </a>
                    ) : null}
                  </article>
                )
              })}
            </div>

            <div className="contact-page-map-card">
              <iframe
                title={mapTitle}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <aside className="contact-page-form-wrap">
            <div className="contact-page-form-card">
              <header>
                <p className="contact-page-form-kicker">{formKicker}</p>
                <h3>{formTitle}</h3>
                <p>{formDescription}</p>
              </header>

              <form className="contact-page-form" action={formAction} method="post" encType="text/plain">
                <div className="contact-page-form-grid">
                  <label>
                    <span>Full Name *</span>
                    <input type="text" name="name" autoComplete="name" required />
                  </label>
                  <label>
                    <span>Email Address *</span>
                    <input type="email" name="email" autoComplete="email" required />
                  </label>
                  <label>
                    <span>Phone Number *</span>
                    <input type="tel" name="phone" autoComplete="tel" required />
                  </label>
                  <label>
                    <span>Enquiry Type *</span>
                    <select name="enquiry_type" required defaultValue="">
                      <option value="" disabled>
                        Select type
                      </option>
                      {enquiryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Preferred Contact</span>
                    <select name="preferred_contact" defaultValue={preferredContactOptions[0]}>
                      {preferredContactOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Vehicle of Interest (Optional)</span>
                    <input type="text" name="vehicle" />
                  </label>
                  <label className="contact-page-form-message">
                    <span>Message *</span>
                    <textarea
                      name="message"
                      rows={3}
                      required
                      placeholder="Tell us what you need help with."
                    ></textarea>
                  </label>
                </div>

                <button type="submit">
                  <AppIcon name="paper-plane" /> {submitLabel}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

export default ClassicContactPage
