import Link from 'next/link'
import { apiUrl } from '../lib/api'
import styles from './DirectorySection.module.css'

/**
 * Columbus Vehicles — Make directory (rugged archetype)
 * SEO + browse-by-make. Server-fetches the list of available makes from
 * /api/inventory (so the chips reflect actual stock, not a hardcoded list).
 * Renders as condensed-bold uppercase chips on a dark band that mirrors
 * the Services section.
 */
async function fetchMakes(brandSlug: string | undefined): Promise<string[]> {
  try {
    const url = apiUrl('/api/inventory')
    const search = new URLSearchParams()
    if (brandSlug) search.set('brand', brandSlug)
    search.set('limit', '120')
    const res = await fetch(`${url}?${search.toString()}`, { next: { revalidate: 600 } })
    if (!res.ok) return []
    const data = await res.json()
    const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
    const makes = new Set<string>()
    for (const item of list) {
      const m = String(item?.make || '').trim()
      if (m) makes.add(m)
    }
    return Array.from(makes).sort((a, b) => a.localeCompare(b))
  } catch {
    return []
  }
}

const RUGGED_FALLBACK_MAKES = [
  'Jeep', 'Land Rover', 'Toyota', 'Mitsubishi', 'Suzuki', 'Mercedes-Benz', 'Nissan', 'Subaru',
]

export default async function DirectorySection({ brandSlug }: { brandSlug?: string }) {
  const apiMakes = await fetchMakes(brandSlug)
  const makes = apiMakes.length > 0 ? apiMakes : RUGGED_FALLBACK_MAKES

  return (
    <section className={styles.section} aria-labelledby="directory-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Browse by make</p>
          <h2 id="directory-heading" className={styles.heading}>Specialists across every 4×4 marque</h2>
        </header>
        <ul className={styles.grid} role="list">
          {makes.map((make) => (
            <li key={make}>
              <Link
                href={`/used-cars?make=${encodeURIComponent(make)}`}
                className={styles.chip}
              >
                {make}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
