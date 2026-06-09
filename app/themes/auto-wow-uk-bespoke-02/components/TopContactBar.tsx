'use client'

import { Facebook, Instagram, Linkedin, Youtube, Mail, MapPin, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './TopContactBar.module.css'

const SOCIALS: Array<{ key: string; label: string; Icon: typeof Facebook }> = [
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'youtube', label: 'YouTube', Icon: Youtube },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
]

export default function TopContactBar() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const socials: Record<string, string | undefined> = ((brand as any)?.socialLinks) || {}
  const address = contact.showroomAddress

  return (
    <div className={styles.bar} role="complementary" aria-label="Showroom contact">
      <div className={styles.inner}>
        <div className={styles.contacts}>
          {contact.phoneTel ? (
            <a href={`tel:${contact.phoneTel}`} className={styles.item} aria-label={`Call ${contact.phoneDisplay}`}>
              <Phone size={14} strokeWidth={2} />
              <span>{contact.phoneDisplay}</span>
            </a>
          ) : null}

          {contact.email ? (
            <a href={`mailto:${contact.email}`} className={styles.item} aria-label={`Email ${contact.email}`}>
              <Mail size={14} strokeWidth={2} />
              <span>{contact.email}</span>
            </a>
          ) : null}

          {address ? (
            <span className={styles.item}>
              <MapPin size={14} strokeWidth={2} />
              <span>{address}</span>
            </span>
          ) : null}
        </div>

        <div className={styles.socials} aria-label="Social media">
          {SOCIALS.map(({ key, label, Icon }) => {
            const url = (socials[key] || '').trim()
            if (url) {
              return (
                <a
                  key={key}
                  href={url}
                  className={styles.socialLink}
                  aria-label={`${label} (opens in new tab)`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={14} strokeWidth={2} />
                </a>
              )
            }
            return (
              <span
                key={key}
                className={styles.socialLink}
                aria-label={`${label} — coming soon`}
                role="presentation"
              >
                <Icon size={14} strokeWidth={2} />
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
