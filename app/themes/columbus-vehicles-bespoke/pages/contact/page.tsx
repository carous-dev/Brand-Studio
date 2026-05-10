import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import { getBrandContactInfo } from '../../lib/contact'
import PageHero from '../../components/PageHero'
import ContactForm from '../../components/ContactForm'
import styles from './page.module.css'

/**
 * Columbus Vehicles — Contact (rugged archetype)
 *
 * SERVER COMPONENT. Renders showroom-info card grid server-side; the lead
 * form is a client island (`<ContactForm>`). Pure-function helpers like
 * `getBrandContactInfo` work fine in a server context.
 */

function fmtHours(hours?: Record<string, string>): string {
  if (!hours) return 'Mon–Sat: viewings by appointment'
  const weekday = hours.Monday || hours.monday
  const sun = hours.Sunday || hours.sunday
  const parts: string[] = []
  if (weekday && !/closed/i.test(weekday)) parts.push(`Mon–Sat: ${weekday}`)
  if (sun && !/closed/i.test(sun)) parts.push(`Sun: ${sun}`)
  return parts.length > 0 ? parts.join(' · ') : 'Mon–Sat: viewings by appointment'
}

export function ColumbusContactPage({ brand }: ThemePageProps) {
  const contact = getBrandContactInfo(brand)

  const showroom =
    (contact as any).showroomAddress ||
    [
      (brand as any)?.location?.address?.line1,
      (brand as any)?.location?.address?.city,
      (brand as any)?.location?.address?.postcode,
    ].filter(Boolean).join(', ') ||
    'Showroom location available on request'
  const phoneDisplay = contact.phoneDisplay || '+44 (0) 7000 000000'
  const phoneTel = contact.phoneTel || '+447000000000'
  const whatsappUrl = contact.whatsappUrl || 'https://wa.me/447000000000'
  const email = contact.email || 'enquiries@columbusvehicles.uk'
  const hoursLine = fmtHours((brand as any)?.openingHours)

  const CARDS = [
    { Icon: MapPin, title: 'Visit our showroom', body: showroom },
    { Icon: Phone, title: 'Call the team', body: phoneDisplay, href: `tel:${phoneTel}` },
    { Icon: MessageCircle, title: 'WhatsApp us', body: 'Quick replies for stock questions', href: whatsappUrl, external: true },
    { Icon: Mail, title: 'Email the team', body: email, href: `mailto:${email}` },
    { Icon: Clock, title: 'Opening hours', body: hoursLine },
  ]

  return (
    <main>
      <PageHero
        eyebrow="Get in touch"
        title="Speak to a 4×4 specialist"
        lead="Questions about a specific vehicle, finance check, or just looking for advice on what's right for you? The team's a phone call or short message away."
        imageSlot="hero"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <ul className={styles.cardGrid} role="list">
            {CARDS.map((card, i) => {
              const Icon = card.Icon
              const body = card.href ? (
                <a
                  href={card.href}
                  className={styles.cardLink}
                  {...(card.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {card.body}
                </a>
              ) : (
                <p className={styles.cardBody}>{card.body}</p>
              )
              return (
                <li key={i} className={styles.card}>
                  <span className={styles.iconWrap} aria-hidden="true">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  {body}
                </li>
              )
            })}
          </ul>

          <ContactForm />
        </div>
      </section>
    </main>
  )
}

export default ColumbusContactPage
