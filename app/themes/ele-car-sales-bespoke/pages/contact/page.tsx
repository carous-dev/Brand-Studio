import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import { getBrandContactInfo } from '../../lib/contact'
import PageHero from '../../components/PageHero'
import ContactFormIsland from './ContactFormIsland'
import styles from './page.module.css'

function fmtHours(hours?: Record<string, string>): string {
  if (!hours) return 'Mon–Fri 9:00–18:00 · Sat 10:00–17:00 · Sun closed'
  const weekday = hours.Monday || hours.monday
  const sat = hours.Saturday || hours.saturday
  const sun = hours.Sunday || hours.sunday
  const parts: string[] = []
  if (weekday && !/closed/i.test(weekday)) parts.push(`Mon–Fri ${weekday}`)
  if (sat && !/closed/i.test(sat)) parts.push(`Sat ${sat}`)
  if (sun && !/closed/i.test(sun)) parts.push(`Sun ${sun}`)
  return parts.length > 0 ? parts.join(' · ') : 'Mon–Fri 9:00–18:00 · Sat 10:00–17:00 · Sun closed'
}

export function EleContactPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'ELE Car Sales'
  const contact = getBrandContactInfo(brand as any)

  const phoneDisplay = contact.phoneDisplay || '01501 000 000'
  const phoneTel = contact.phoneTel || '+441501000000'
  const email = contact.email || 'info@elecarsales.co.uk'
  const whatsappUrl = contact.whatsappUrl || 'https://wa.me/441501000000'
  const showroom = contact.showroomAddress || 'Shotts, North Lanarkshire, Scotland'
  const hoursLine = fmtHours((brand as any)?.openingHours)

  const CARDS = [
    { Icon: MapPin, title: 'Visit the showroom', body: showroom },
    { Icon: Phone, title: 'Call the team', body: phoneDisplay, href: `tel:${phoneTel}` },
    { Icon: MessageCircle, title: 'WhatsApp', body: 'Quick replies for stock questions', href: whatsappUrl, external: true },
    { Icon: Mail, title: 'Email', body: email, href: `mailto:${email}` },
    { Icon: Clock, title: 'Opening hours', body: hoursLine },
  ]

  return (
    <main>
      <PageHero
        eyebrow="Get in touch"
        title="Speak to a real person at the showroom."
        lead={`Questions about a specific car, finance check, part-exchange valuation, or delivery? The ${brandName} team's a phone call, WhatsApp message, or short form away.`}
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
                <li key={i} className={styles.card} data-aos="fade-up" data-aos-delay={String(60 * (i % 3))}>
                  <span className={styles.iconWrap} aria-hidden="true">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  {body}
                </li>
              )
            })}
          </ul>

          <ContactFormIsland />
        </div>
      </section>
    </main>
  )
}

export default EleContactPage
