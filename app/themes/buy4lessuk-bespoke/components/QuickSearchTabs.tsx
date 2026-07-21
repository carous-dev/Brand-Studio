'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import styles from './QuickSearchTabs.module.css'

type Mode = 'find' | 'sell'
type PriceMode = 'full' | 'monthly'

const PRICE_STEPS_FULL = [0, 2500, 5000, 7500, 10000, 15000, 20000, 30000, 50000, 75000, 100000]
const PRICE_STEPS_MONTH = [0, 100, 150, 200, 250, 300, 400, 500, 750, 1000]

export default function QuickSearchTabs({ makes = [] }: { makes?: string[] }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('find')
  const [priceMode, setPriceMode] = useState<PriceMode>('full')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [reg, setReg] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'sell') {
      const params = new URLSearchParams()
      const clean = reg.replace(/\s+/g, '').toUpperCase()
      if (clean) params.set('reg', clean)
      router.push(`/sell-my-car${params.toString() ? `?${params}` : ''}`)
      return
    }
    const params = new URLSearchParams()
    if (make) params.set('make', make)
    if (model) params.set('q', model)
    if (priceMode === 'monthly') {
      if (min) params.set('min_monthly', min)
      if (max) params.set('max_monthly', max)
    } else {
      if (min) params.set('min_price', min)
      if (max) params.set('max_price', max)
    }
    router.push(`/used-cars${params.toString() ? `?${params}` : ''}`)
  }

  const steps = priceMode === 'monthly' ? PRICE_STEPS_MONTH : PRICE_STEPS_FULL

  return (
    <section className={styles.section} aria-label="Quick search" data-aos="fade-up">
      <div className={styles.inner}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'find' ? styles.tabActive : ''}`}
            onClick={() => setMode('find')}
          >
            <Search size={14} strokeWidth={2.4} aria-hidden />
            Find a Car
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'sell' ? styles.tabActive : ''}`}
            onClick={() => setMode('sell')}
          >
            Sell Your Car
          </button>
        </div>

        <form className={styles.row} onSubmit={submit} aria-label={mode === 'find' ? 'Find a car' : 'Sell your car'}>
          {mode === 'find' ? (
            <>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Make</span>
                <select value={make} onChange={(e) => setMake(e.target.value)}>
                  <option value="">Make</option>
                  {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Model</span>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Model"
                />
              </label>
              <div className={`${styles.priceToggle} ${styles.field}`}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${priceMode === 'full' ? styles.toggleActive : ''}`}
                  onClick={() => setPriceMode('full')}
                >Full</button>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${priceMode === 'monthly' ? styles.toggleActive : ''}`}
                  onClick={() => setPriceMode('monthly')}
                >Monthly</button>
              </div>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Min</span>
                <select value={min} onChange={(e) => setMin(e.target.value)}>
                  <option value="">Min</option>
                  {steps.map((v) => <option key={`min${v}`} value={v}>£{v.toLocaleString('en-GB')}</option>)}
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Max</span>
                <select value={max} onChange={(e) => setMax(e.target.value)}>
                  <option value="">Max</option>
                  {steps.map((v) => <option key={`max${v}`} value={v}>£{v.toLocaleString('en-GB')}</option>)}
                </select>
              </label>
              <button type="submit" className={styles.submit}>Search</button>
            </>
          ) : (
            <>
              <label className={`${styles.field} ${styles.regField}`}>
                <span className={styles.fieldLabel}>Your reg</span>
                <input
                  type="text"
                  value={reg}
                  onChange={(e) => setReg(e.target.value.toUpperCase())}
                  placeholder="YOUR REG"
                  maxLength={10}
                />
              </label>
              <button type="submit" className={styles.submit}>Value My Car</button>
            </>
          )}
        </form>

        <div className={styles.advancedRow}>
          <Link href="/used-cars" className={styles.advancedLink}>Advanced Options</Link>
        </div>
      </div>
    </section>
  )
}
