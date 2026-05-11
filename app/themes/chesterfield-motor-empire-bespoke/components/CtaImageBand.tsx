'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './CtaImageBand.module.css'

type CtaImageBandProps = {
  variant?: 'finance' | 'sell' | 'contact'
}

const COPY = {
  finance: {
    eyebrow: 'Finance ready in minutes',
    title: 'Get on the road with finance built around you.',
    body: 'Transparent monthly figures, dealer-backed options, no pressure.',
    primary: { href: '/finance', label: 'Apply for finance' },
    secondary: { href: '/contact', label: 'Talk to finance team' },
    image: 'var(--brand-image-finance)',
  },
  sell: {
    eyebrow: 'Want to sell your car?',
    title: 'Fair dealer valuation. Quick decision. Same-day handover.',
    body: 'Drop in your registration. We&rsquo;ll give you a guide trade price and confirm an offer within 24 hours.',
    primary: { href: '/sell-my-car', label: 'Start valuation' },
    secondary: { href: '/part-exchange', label: 'Part exchange options' },
    image: 'var(--brand-image-sell-your-car)',
  },
  contact: {
    eyebrow: 'Need help finding the right car?',
    title: 'Chat to the team — we&rsquo;re here Mon–Sat 9 to 4:30.',
    body: 'Tell us what you&rsquo;re after and we&rsquo;ll point you at the right car.',
    primary: { href: '/contact', label: 'Book appointment' },
    secondary: { href: '/used-cars', label: 'Browse stock' },
    image: 'var(--brand-image-services)',
  },
} as const

export default function CtaImageBand({ variant = 'finance' }: CtaImageBandProps) {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const copy = COPY[variant]
  return (
    <section className={styles.band} aria-labelledby={`cta-band-${variant}`}>
      <div
        className={styles.bg}
        style={{ backgroundImage: copy.image }}
        aria-hidden="true"
      />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true">
        <span className="mfx-glow-pulse" />
      </div>
      <div className={styles.inner}>
        <p className={styles.eyebrow} data-aos="fade-up">
          {copy.eyebrow}
        </p>
        <h2
          id={`cta-band-${variant}`}
          className={styles.title}
          data-aos="fade-up"
          data-aos-delay="80"
          dangerouslySetInnerHTML={{ __html: copy.title }}
        />
        <p
          className={styles.body}
          data-aos="fade-up"
          data-aos-delay="160"
          dangerouslySetInnerHTML={{ __html: copy.body }}
        />
        <div className={styles.actions} data-aos="fade-up" data-aos-delay="220">
          <Link href={copy.primary.href} className={`${styles.primary} mfx-shimmer`}>
            {copy.primary.label}
            <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </Link>
          <Link href={copy.secondary.href} className={styles.secondary}>
            {copy.secondary.label}
          </Link>
          {contact.whatsappUrl ? (
            <a
              className={styles.whatsapp}
              href={contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} strokeWidth={2.4} aria-hidden="true" />
              WhatsApp us
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
