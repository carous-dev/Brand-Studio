'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import styles from './CategoryBand.module.css'

type Tile = {
  label: string
  href: string
  caption: string
  icon: string
}

const DEFAULT_TILES: Tile[] = [
  { label: 'Hatchback', href: '/used-cars?body=Hatchback', caption: 'City-ready & efficient', icon: '01' },
  { label: 'SUV', href: '/used-cars?body=SUV', caption: 'Family-sized & capable', icon: '02' },
  { label: 'Saloon', href: '/used-cars?body=Saloon', caption: 'Comfortable & confident', icon: '03' },
]

export default function CategoryBand({ availableBodies }: { availableBodies?: string[] }) {
  // If the dealer's inventory exposes specific body types, pick the top 3.
  // Otherwise show the default tiles so the section still has presence.
  const fromInventory = (availableBodies || [])
    .filter(Boolean)
    .slice(0, 3)
    .map((label, idx) => ({
      label,
      href: `/used-cars?body=${encodeURIComponent(label)}`,
      caption: ['Today\'s shortlist', 'Browse the lot', 'See what\'s in'][idx] || 'Browse the lot',
      icon: String(idx + 1).padStart(2, '0'),
    }))

  const tiles = fromInventory.length === 3 ? fromInventory : DEFAULT_TILES

  return (
    <section className={`auto-section ${styles.section}`} aria-label="Shop by category">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <span className={styles.eyebrow}>[ Pick your shape ]</span>
          <h2 className={styles.title}>Browse by body type</h2>
          <p className={styles.lead}>
            Hatchbacks for the school run, SUVs for the weekend, saloons for the
            motorway. Cut the shortlist in two taps.
          </p>
        </header>

        <div className={styles.grid}>
          {tiles.map((tile, idx) => (
            <Link
              key={tile.label}
              href={tile.href}
              className={styles.tile}
              data-aos="fade-up"
              data-aos-delay={idx * 80}
            >
              <span className={styles.tileIcon} aria-hidden="true">{tile.icon}</span>
              <span className={styles.tileLabel}>{tile.label}</span>
              <span className={styles.tileCaption}>{tile.caption}</span>
              <span className={styles.tileCta}>
                See {tile.label.toLowerCase()}s
                <ArrowRight size={16} strokeWidth={2} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
