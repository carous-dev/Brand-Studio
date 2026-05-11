import Link from 'next/link'
import styles from './CtaBanner.module.css'

type CtaBannerProps = {
  eyebrow?: string
  title: string
  body?: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
  imageSlot?: 'finance' | 'sellYourCar' | 'partExchange' | 'services' | 'hero'
}

const SLOT_VAR: Record<string, string> = {
  finance: 'var(--brand-image-finance, var(--brand-image-hero))',
  sellYourCar: 'var(--brand-image-sell-your-car, var(--brand-image-hero))',
  partExchange: 'var(--brand-image-part-exchange, var(--brand-image-hero))',
  services: 'var(--brand-image-services, var(--brand-image-hero))',
  hero: 'var(--brand-image-hero)',
}

export default function CtaBanner({
  eyebrow,
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  imageSlot = 'finance',
}: CtaBannerProps) {
  const bg = SLOT_VAR[imageSlot] || SLOT_VAR.hero
  return (
    <section className={styles.banner} aria-labelledby="ele-cta-title" data-aos="fade-up">
      <div
        className={styles.bg}
        aria-hidden="true"
        style={{ backgroundImage: bg } as any}
      />
      <div className={styles.gradient} aria-hidden="true" />
      <div className={styles.inner}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h2 id="ele-cta-title" className={styles.title}>{title}</h2>
        {body ? <p className={styles.body}>{body}</p> : null}
        <div className={styles.ctaRow}>
          <Link href={primaryHref} className={styles.primary}>
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link href={secondaryHref} className={styles.secondary}>
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
