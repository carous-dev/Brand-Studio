'use client'

import { useMemo, useState } from 'react'
import styles from './page.module.css'

const formatGBP = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

export default function FinanceCalculator() {
  const [price, setPrice] = useState(15000)
  const [deposit, setDeposit] = useState(1500)
  const [term, setTerm] = useState(48)
  const [apr, setApr] = useState(9.9)

  const monthly = useMemo(() => {
    const principal = Math.max(0, price - deposit)
    const r = apr / 100 / 12
    if (r === 0) return principal / term
    const factor = Math.pow(1 + r, term)
    return (principal * r * factor) / (factor - 1)
  }, [price, deposit, term, apr])

  const totalCost = monthly * term + deposit
  const totalInterest = totalCost - price

  return (
    <form className={styles.calc} onSubmit={(e) => e.preventDefault()} aria-label="Finance calculator">
      <p className="auto-eyebrow">Quick illustration</p>
      <h3 className={styles.calcTitle}>Finance calculator</h3>

      <label className={styles.calcField}>
        <span>Vehicle price</span>
        <span className={styles.calcValue}>{formatGBP(price)}</span>
        <input
          type="range" min={3000} max={50000} step={500}
          value={price} onChange={(e) => setPrice(Number(e.target.value))}
          aria-label="Vehicle price"
        />
      </label>

      <label className={styles.calcField}>
        <span>Deposit</span>
        <span className={styles.calcValue}>{formatGBP(deposit)}</span>
        <input
          type="range" min={0} max={Math.max(500, price * 0.6)} step={250}
          value={Math.min(deposit, price * 0.6)} onChange={(e) => setDeposit(Number(e.target.value))}
          aria-label="Deposit"
        />
      </label>

      <label className={styles.calcField}>
        <span>Term (months)</span>
        <span className={styles.calcValue}>{term}</span>
        <input
          type="range" min={12} max={72} step={6}
          value={term} onChange={(e) => setTerm(Number(e.target.value))}
          aria-label="Term"
        />
      </label>

      <label className={styles.calcField}>
        <span>Representative APR</span>
        <span className={styles.calcValue}>{apr.toFixed(1)}%</span>
        <input
          type="range" min={3.9} max={19.9} step={0.5}
          value={apr} onChange={(e) => setApr(Number(e.target.value))}
          aria-label="APR"
        />
      </label>

      <div className={styles.calcResult}>
        <span className={styles.calcResultLabel}>Estimated monthly</span>
        <strong className={styles.calcResultValue}>{formatGBP(monthly)}</strong>
        <p className={styles.calcResultSub}>
          Total credit cost {formatGBP(totalInterest)} &middot; total payable {formatGBP(totalCost)}
        </p>
      </div>
    </form>
  )
}
