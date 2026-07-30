'use client'

import Link from 'next/link'
import { useBrand } from '../../context/BrandClientWrapper'
import { resolveText } from '../../lib/brand-text'
import VehicleCard from '../../components/VehicleCard'
import styles from './page.module.css'

/**
 * RecentlySoldClient — the showroom grid of sold-variant cards (design-language
 * §7: /recently-sold section on `bg`, wide container). Each car renders with
 * the shared VehicleCard `sold` variant (grayscale photo, SOLD stamp, muted
 * price, actions hidden) so buyers can still reach the detail page but never try
 * to reserve a retired car. Empty state and CTA route through `resolveText`.
 */

type RawVehicle = Record<string, any>

function toCardVehicle(v: RawVehicle) {
  const image =
    (Array.isArray(v.images) && v.images.find((x: unknown) => typeof x === 'string')) ||
    v.image ||
    ''
  return {
    id: v.id ?? v.slug ?? v.reg ?? v.registration,
    slug: v.slug,
    reg: v.reg ?? v.registration,
    title: v.title,
    year: v.year,
    price: v.price,
    mileage: v.mileage,
    fuel: v.fuel ?? v.fuel_type,
    transmission: v.transmission ?? v.trans,
    body: v.body ?? v.body_type,
    make: v.make,
    model: v.model,
    image,
  }
}

export default function RecentlySoldClient({ items }: { items: RawVehicle[] }) {
  const brand = useBrand()
  const list = Array.isArray(items) ? items : []

  if (list.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.empty} data-aos="fade-up">{resolveText(brand, 'sold.empty')}</p>
          <div className={styles.ctaRow} data-aos="fade-up" data-aos-delay="80">
            <Link href="/used-cars" className={styles.cta}>
              {resolveText(brand, 'sold.cta')}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <ul className={styles.grid}>
          {list.map((v, idx) => (
            <li key={v.id ?? v.slug ?? idx} data-aos="fade-up" data-aos-delay={Math.min(idx, 8) * 60}>
              <VehicleCard vehicle={toCardVehicle(v)} sold />
            </li>
          ))}
        </ul>
        <div className={styles.ctaRow}>
          <Link href="/used-cars" className={styles.cta}>
            {resolveText(brand, 'sold.cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
