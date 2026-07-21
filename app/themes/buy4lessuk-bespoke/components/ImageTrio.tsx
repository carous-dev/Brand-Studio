'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import styles from './ImageTrio.module.css'

const TILES = [
  { label: 'Showroom', href: '/used-cars', slot: 'hero' as const },
  { label: 'Finance', href: '/finance', slot: 'finance' as const },
  { label: 'Vehicle Sourcing', href: '/services', slot: 'services' as const },
]

export default function ImageTrio() {
  return (
    <section className={styles.section} aria-label="Key services" data-aos="fade-up">
      <div className={styles.grid}>
        {TILES.map((tile) => (
          <Link key={tile.href} href={tile.href} className={styles.card} data-slot={tile.slot}>
            <div className={styles.image} aria-hidden data-slot={tile.slot} />
            <div className={styles.label}>
              <span>{tile.label}</span>
              <span className={styles.arrow} aria-hidden>
                <ArrowRight size={16} strokeWidth={2.6} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
