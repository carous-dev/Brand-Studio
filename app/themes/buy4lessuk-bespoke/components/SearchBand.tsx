'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import styles from './SearchBand.module.css'

const PRICE_STEPS = [5000, 10000, 15000, 20000, 30000, 50000]

const gbp = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

export default function SearchBand({ makes, bodies }: { makes: string[]; bodies: string[] }) {
  const router = useRouter()
  const [make, setMake] = useState('')
  const [body, setBody] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (make) params.set('make', make)
    if (body) params.set('body', body)
    if (maxPrice) params.set('max_price', maxPrice)
    const qs = params.toString()
    router.push(qs ? `/used-cars?${qs}` : '/used-cars')
  }

  return (
    <section className={styles.band} aria-label="Vehicle search">
      <form className={styles.inner} onSubmit={onSubmit}>
        <h2 className={styles.title}>Find Your Next Vehicle</h2>

        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Make</span>
            <span className={styles.selectWrap}>
              <select
                className={styles.select}
                value={make}
                onChange={(e) => setMake(e.target.value)}
              >
                <option value="">Any Make</option>
                {makes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown size={14} strokeWidth={2.4} aria-hidden className={styles.chevron} />
            </span>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Body Style</span>
            <span className={styles.selectWrap}>
              <select
                className={styles.select}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              >
                <option value="">Any Body Style</option>
                {bodies.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown size={14} strokeWidth={2.4} aria-hidden className={styles.chevron} />
            </span>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Max Price</span>
            <span className={styles.selectWrap}>
              <select
                className={styles.select}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              >
                <option value="">Any Price</option>
                {PRICE_STEPS.map((p) => (
                  <option key={p} value={p}>Up to {gbp(p)}</option>
                ))}
              </select>
              <ChevronDown size={14} strokeWidth={2.4} aria-hidden className={styles.chevron} />
            </span>
          </label>

          <button type="submit" className={styles.submit}>
            <Search size={15} strokeWidth={2.6} aria-hidden />
            <span>Search</span>
          </button>
        </div>
      </form>
    </section>
  )
}
