'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Car,
  ThumbsUp,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './AboutUs.module.css'

type Feature = {
  title: string
  description: string
  Icon: LucideIcon
}

const ICON_ROTATION: LucideIcon[] = [ThumbsUp, Target, Users]

const DEFAULT_FEATURES: Feature[] = [
  {
    title: 'Over 50 Years Combined Experience',
    description:
      'We welcome all customers and strive to help them through the used car buying process.',
    Icon: ThumbsUp,
  },
  {
    title: 'Great Savings On Quality Used Cars',
    description:
      'We are proud to offer a first class customer service and very competitive pricing.',
    Icon: Target,
  },
  {
    title: 'A Range To Suit All Budgets & Lifestyles',
    description:
      'We are sure to have the right car for you, available to view and test drive.',
    Icon: Users,
  },
]

export default function AboutUs() {
  const brand = useBrand()
  const brandName = brand?.name?.trim() || 'Warwick Hall Cars'

  const customFeatures: Feature[] = Array.isArray(brand?.whyChooseUs?.features)
    ? brand!.whyChooseUs!.features!
        .map((f, i) => ({
          title: typeof f?.title === 'string' ? f.title.trim() : '',
          description: typeof f?.description === 'string' ? f.description.trim() : '',
          Icon: ICON_ROTATION[i % ICON_ROTATION.length],
        }))
        .filter((f) => f.title || f.description)
        .slice(0, 3)
    : []

  const features: Feature[] = customFeatures.length === 3 ? customFeatures : DEFAULT_FEATURES

  return (
    <section className={styles.section} aria-labelledby="warwick-about-title">
      <div className={styles.inner}>
        <header className={styles.intro}>
          <span className={styles.carGlyph} aria-hidden="true">
            <Car size={36} strokeWidth={1.6} />
          </span>
          <p className={styles.eyebrow}>About Us</p>
          <h2 id="warwick-about-title" className={styles.title} data-aos="fade-up">
            Welcome To {titleCase(brandName)}
          </h2>
        </header>

        <div className={styles.cards}>
          {features.map((feature, i) => (
            <FeatureCard key={`${feature.title}-${i}`} feature={feature} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, delay }: { feature: Feature; delay: number }) {
  const { Icon } = feature
  return (
    <article className={styles.card} data-aos="fade-up" data-aos-delay={delay}>
      <div className={styles.cardIcon} aria-hidden="true">
        <Icon size={28} strokeWidth={2} />
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{feature.title}</h3>
        <p className={styles.cardDesc}>{feature.description}</p>
        <div className={styles.cardBodyWatermark} aria-hidden="true">
          <Icon strokeWidth={1.3} />
        </div>
      </div>

      <div className={styles.cardFoot}>
        <div className={styles.cardFootSilhouettes} aria-hidden="true">
          <Icon strokeWidth={1.4} />
          <Icon strokeWidth={1.4} />
        </div>

        <Link href="/used-cars" className={styles.cardCta}>
          View Showroom
          <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

/** Title-case a brand name when it arrives lowercased ("warwick hall cars"). */
function titleCase(value: string): string {
  return value.replace(/\b([a-z])/g, (m) => m.toUpperCase())
}
