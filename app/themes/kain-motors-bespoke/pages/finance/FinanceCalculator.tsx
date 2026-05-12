'use client'

import { useMemo, useState } from 'react'
import styles from './page.module.css'

function fmtGBP(n: number) {
  if (!Number.isFinite(n) || n <= 0) return '£0'
  return `£${Math.round(n).toLocaleString('en-GB')}`
}

export default function FinanceCalculator() {
  const [price, setPrice] = useState(18000)
  const [deposit, setDeposit] = useState(2000)
  const [term, setTerm] = useState(48)
  const [apr, setApr] = useState(9.9)

  const monthly = useMemo(() => {
    const principal = Math.max(0, price - deposit)
    const r = apr / 100 / 12
    if (r === 0) return principal / term
    const factor = Math.pow(1 + r, term)
    return (principal * r * factor) / (factor - 1)
  }, [price, deposit, term, apr])

  const totalPayable = monthly * term + deposit
  const totalInterest = totalPayable - price

  return (
    <div className={styles.calc} aria-live="polite">
      <div className={styles.calcRow}>
        <label className={styles.calcField}>
          <span className={styles.calcLabel}>Vehicle price</span>
          <span className={styles.calcValue}>{fmtGBP(price)}</span>
          <input
            type="range"
            min={3000}
            max={75000}
            step={500}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            aria-label="Vehicle price"
          />
        </label>
        <label className={styles.calcField}>
          <span className={styles.calcLabel}>Deposit</span>
          <span className={styles.calcValue}>{fmtGBP(deposit)}</span>
          <input
            type="range"
            min={0}
            max={Math.max(500, price / 2)}
            step={250}
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
            aria-label="Deposit"
          />
        </label>
        <label className={styles.calcField}>
          <span className={styles.calcLabel}>Term</span>
          <span className={styles.calcValue}>{term} months</span>
          <input
            type="range"
            min={12}
            max={72}
            step={6}
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            aria-label="Term in months"
          />
        </label>
        <label className={styles.calcField}>
          <span className={styles.calcLabel}>Indicative APR</span>
          <span className={styles.calcValue}>{apr.toFixed(1)}%</span>
          <input
            type="range"
            min={4.9}
            max={19.9}
            step={0.1}
            value={apr}
            onChange={(e) => setApr(Number(e.target.value))}
            aria-label="APR"
          />
        </label>
      </div>

      <div className={styles.calcReadout}>
        <div className={styles.calcReadoutCell}>
          <span className={styles.calcReadoutLabel}>Estimated monthly</span>
          <span className={styles.calcReadoutValue}>{fmtGBP(monthly)}</span>
        </div>
        <div className={styles.calcReadoutCell}>
          <span className={styles.calcReadoutLabel}>Total interest</span>
          <span className={styles.calcReadoutValueSm}>{fmtGBP(totalInterest)}</span>
        </div>
        <div className={styles.calcReadoutCell}>
          <span className={styles.calcReadoutLabel}>Total payable</span>
          <span className={styles.calcReadoutValueSm}>{fmtGBP(totalPayable)}</span>
        </div>
      </div>
    </div>
  )
}
