'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import styles from './CategoryBand.module.css'

type Tile = { label: string; href: string; caption: string; code: string }

const DEFAULT_TILES: Tile[] = [
  { label: 'Hatchback', href: '/used-cars?body=Hatchback', caption: 'City-ready & efficient', code: '01' },
  { label: 'SUV',       href: '/used-cars?body=SUV',       caption: 'Family-sized & capable',   code: '02' },
  { label: 'Saloon',    href: '/used-cars?body=Saloon',    caption: 'Comfortable & confident',  code: '03' },
]

export default function CategoryBand({ availableBodies }: { availableBodies?: string[] }) {
  const fromInventory = (availableBodies || [])
    .filter(Boolean)
    .slice(0, 3)
    .map((label, idx) => ({
      label,
      href: `/used-cars?body=${encodeURIComponent(label)}`,
      caption: ['Today\'s shortlist', 'Browse the lot', 'See what\'s in'][idx] || 'Browse the lot',
      code: String(idx + 1).padStart(2, '0'),
    }))

  const tiles = fromInventory.length === 3 ? fromInventory : DEFAULT_TILES

  return (
    <section className={`axis-section ${styles.section}`} aria-label="Shop by body type">
      <div className={styles.inner}>
        <header className={styles.header} data-aos="fade-up">
          <span className={styles.eyebrow}>{'> '}by-body-type</span>
          <h2 className={styles.title}>Pick the shape</h2>
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
              <span className={styles.tileCode}>{tile.code}</span>
              <span className={styles.tileLabel}>{tile.label}</span>
              <span className={styles.tileCaption}>{tile.caption}</span>
              <span className={styles.tileCta}>
                See {tile.label.toLowerCase()}s
                <ArrowRight size={14} strokeWidth={2} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
