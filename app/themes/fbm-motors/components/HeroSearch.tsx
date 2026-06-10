'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './HeroSearch.module.css'

const tabs = ['All', 'New', 'Used'] as const

export type HeroSearchProps = {
  makes: { name: string; count: number }[]
}

export default function HeroSearch({ makes }: HeroSearchProps) {
  const router = useRouter()
  const [tab, setTab] = useState<(typeof tabs)[number]>('All')
  const [make, setMake] = useState('')
  const [price, setPrice] = useState('')

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setTab(t)}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className={styles.card}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="hero-make">Make</label>
          <select id="hero-make" className="fbm-field" value={make} onChange={(e) => setMake(e.target.value)}>
            <option value="">All makes</option>
            {makes.map((m) => <option key={m.name}>{m.name}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="hero-model">Model</label>
          <input id="hero-model" className="fbm-field" placeholder="Select make first" />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="hero-price">Max price</label>
          <select id="hero-price" className="fbm-field" value={price} onChange={(e) => setPrice(e.target.value)}>
            <option value="">Any price</option>
            {['£2,000', '£5,000', '£10,000', '£20,000'].map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={() => router.push('/used-cars')}
          className={`fbm-btn-primary ${styles.submit}`}
        >
          Search
        </button>
      </div>
    </div>
  )
}
