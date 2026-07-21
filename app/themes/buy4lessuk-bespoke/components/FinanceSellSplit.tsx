'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './FinanceSellSplit.module.css'

const MIN_BUDGET = 70
const MAX_BUDGET = 800

export default function FinanceSellSplit() {
  const router = useRouter()
  const [budget, setBudget] = useState(640)
  const [reg, setReg] = useState('')

  const handleFinanceSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('max_monthly', String(budget))
    router.push(`/used-cars?${params.toString()}`)
  }

  const handleSell = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    const clean = reg.replace(/\s+/g, '').toUpperCase()
    if (clean) params.set('reg', clean)
    router.push(`/sell-my-car${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <section className={styles.section} aria-label="Finance and sell your car" data-aos="fade-up">
      <div className={styles.grid}>
        <form className={`${styles.card} ${styles.financeCard}`} onSubmit={handleFinanceSearch}>
          <h2 className={styles.cardTitle}>
            Explore the finance<br />
            options we have for you
          </h2>
          <p className={styles.cardBody}>
            Easily narrow down your choices with our useful budget search.
          </p>
          <div className={styles.budgetRow}>
            <span className={styles.budgetLabel}>Monthly budget</span>
            <div className={styles.budgetValues} aria-hidden>
              <span>£{MIN_BUDGET}</span>
              <span className={styles.budgetMax}>£{budget}</span>
            </div>
          </div>
          <input
            className={styles.budgetSlider}
            type="range"
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step={10}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            aria-label="Maximum monthly payment"
          />
          <button type="submit" className={styles.financeSubmit}>Search</button>
        </form>

        <form className={`${styles.card} ${styles.sellCard}`} onSubmit={handleSell}>
          <h2 className={styles.cardTitle}>
            Sell your car for what<br />
            it's really worth
          </h2>
          <p className={styles.cardBody}>
            Start by entering your registration to receive your vehicle valuation.
          </p>
          <label className={styles.regLabel}>Your vehicle registration</label>
          <div className={styles.regRow}>
            <div className={styles.regInputWrap}>
              <span className={styles.regFlag} aria-hidden>
                <span className={styles.regFlagText}>GB</span>
              </span>
              <input
                className={styles.regInput}
                type="text"
                value={reg}
                onChange={(e) => setReg(e.target.value.toUpperCase())}
                placeholder="YOUR REG"
                aria-label="Vehicle registration"
                maxLength={10}
              />
            </div>
            <button type="submit" className={styles.sellSubmit}>Sell My Car</button>
          </div>
        </form>
      </div>
    </section>
  )
}
