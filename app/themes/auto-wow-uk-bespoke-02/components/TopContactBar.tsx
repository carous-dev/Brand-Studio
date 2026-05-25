'use client'

import { Facebook, Instagram, Linkedin, Youtube, MapPin, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
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
  const hours = useWorkingHours((brand as any)?.openingHours)
  const address = (brand as any)?.location?.address || {}
  const locationLabel = [address.city, address.county].filter(Boolean).join(', ')
  const socials: Record<string, string | undefined> = ((brand as any)?.socialLinks) || {}

  return (
    <div className={styles.bar} role="complementary" aria-label="Showroom contact">
      <div className={styles.inner}>
        {locationLabel ? (
          <div className={styles.chip}>
            <MapPin size={14} strokeWidth={2} />
            <span>{locationLabel}</span>
          </div>
        ) : null}

        <div className={styles.chip}>
          <span
            className={`mfx-pulse-dot ${styles.statusDot} ${hours?.isOnline ? styles.statusOpen : styles.statusClosed}`}
            aria-hidden="true"
          />
          <span>{hours?.isOnline ? 'Live stock · open now' : 'Browse stock 24/7'}</span>
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

        {contact.phoneTel ? (
          <a
            href={`tel:${contact.phoneTel}`}
            className={`${styles.chip} ${styles.phoneCta}`}
            aria-label={`Call ${contact.phoneDisplay}`}
          >
            <Phone size={14} strokeWidth={2} />
            <span>{contact.phoneDisplay}</span>
          </a>
        ) : null}
      </div>
    </div>
  )
}
