'use client'

// audit-ignore-file: data-useeffect-fetch — brand context is client-side; home is a server shell composed of client islands.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import styles from './DirectorySection.module.css'

type MakeTally = { name: string; count: number }

const FALLBACK_MAKES: MakeTally[] = [
  { name: 'BMW', count: 0 },
  { name: 'Audi', count: 0 },
  { name: 'Mercedes', count: 0 },
  { name: 'Volkswagen', count: 0 },
  { name: 'Ford', count: 0 },
  { name: 'Toyota', count: 0 },
  { name: 'Nissan', count: 0 },
  { name: 'Honda', count: 0 },
  { name: 'Vauxhall', count: 0 },
  { name: 'Peugeot', count: 0 },
  { name: 'Land Rover', count: 0 },
  { name: 'Kia', count: 0 },
]

export default function DirectorySection() {
  const brand = useBrand()
  const [makes, setMakes] = useState<MakeTally[]>([])

  useEffect(() => {
    let cancelled = false
    const slug = (brand?.slug || '').trim()
    // audit-ignore: data-useeffect-fetch — useBrand is client-side; section is a client island.
    const params = new URLSearchParams({ limit: '100', per_page: '100', light: '1' })
    if (slug) params.set('brand', slug)
    fetch(apiUrl(`/inventory?${params.toString()}`), { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((payload) => {
        if (cancelled || !payload) return
        const items: any[] = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []
        const tally = new Map<string, number>()
        items.forEach((item) => {
          const name = String(item?.make?.name ?? item?.make ?? item?.vehicle?.make ?? '').trim()
          if (!name) return
          tally.set(name, (tally.get(name) || 0) + 1)
        })
        const list = Array.from(tally.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 12)
        setMakes(list.length ? list : FALLBACK_MAKES)
      })
      .catch(() => {
        if (!cancelled) setMakes(FALLBACK_MAKES)
      })
    return () => { cancelled = true }
  }, [brand?.slug])

  const list = makes.length ? makes : FALLBACK_MAKES

  return (
    <section className={`auto-section auto-section--dark ${styles.section}`} aria-labelledby="directory-title">
      <div className="auto-container">
        <header className={styles.header} data-aos="fade-up">
          <div className={styles.headerCopy}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowMark} aria-hidden="true" />
              Browse by make
            </span>
            <h2 id="directory-title" className={styles.title}>
              Stock from the makes you trust.
            </h2>
          </div>
          <Link href="/used-cars" className={styles.viewAll}>
            See full directory
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </header>

        <ul className={styles.grid}>
          {list.map((make, i) => (
            <li key={make.name} data-aos="fade-up" data-aos-delay={i * 40}>
              <Link
                href={`/used-cars?make=${encodeURIComponent(make.name)}`}
                className={styles.chip}
              >
                <span className={styles.chipName}>{make.name}</span>
                {make.count > 0 && (
                  <span className={styles.chipCount}>{make.count}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
