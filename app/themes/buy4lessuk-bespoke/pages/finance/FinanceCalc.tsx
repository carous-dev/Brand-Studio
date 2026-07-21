'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

const gbp = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

function calculate(principal: number, termMonths: number, aprPct: number, deposit: number) {
  const financed = Math.max(0, principal - deposit)
  if (financed <= 0 || termMonths <= 0) return 0
  const r = aprPct / 100 / 12
  if (r === 0) return Math.round(financed / termMonths)
  const monthly = (r * financed * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1)
  return Math.round(monthly)
}

export default function FinanceCalc() {
  const [price, setPrice] = useState(12000)
  const [deposit, setDeposit] = useState(1000)
  const [term, setTerm] = useState(60)
  const [apr, setApr] = useState(9.9)
  const monthly = useMemo(() => calculate(price, term, apr, deposit), [price, term, apr, deposit])

  return (
    <div className={styles.grid}>
      <div className={styles.body}>
        <h2 className={styles.title}>Finance built around your budget</h2>
        <p>
          We work with a panel of FCA-regulated lenders to find a deal that fits, whether you have
          a perfect credit history or have been turned down before. Most decisions come back in
          under 60 seconds.
        </p>
        <ul className={styles.list}>
          <li>HP, PCP and lease purchase available</li>
          <li>Soft credit search — no impact on your score</li>
          <li>Terms from 12 to 60 months</li>
          <li>Deposit-free options on selected stock</li>
        </ul>
        <div className={styles.actions}>
          <Link href="/contact" className={styles.btnPrimary}>Apply for free</Link>
          <Link href="/used-cars" className={styles.btnGhost}>Browse stock</Link>
        </div>
      </div>

      <aside className={styles.calc} aria-label="Finance calculator">
        <h3>Quick calculator</h3>
        <label>
          <span>Car price</span>
          <span className={styles.value}>{gbp(price)}</span>
          <input
            type="range" min={2000} max={50000} step={500}
            value={price} onChange={(e) => setPrice(Number(e.target.value))}
          />
        </label>
        <label>
          <span>Deposit</span>
          <span className={styles.value}>{gbp(deposit)}</span>
          <input
            type="range" min={0} max={Math.min(price, 15000)} step={250}
            value={deposit} onChange={(e) => setDeposit(Number(e.target.value))}
          />
        </label>
        <label>
          <span>Term</span>
          <span className={styles.value}>{term} months</span>
          <input
            type="range" min={12} max={60} step={6}
            value={term} onChange={(e) => setTerm(Number(e.target.value))}
          />
        </label>
        <label>
          <span>Estimated APR</span>
          <span className={styles.value}>{apr.toFixed(1)}%</span>
          <input
            type="range" min={5.9} max={29.9} step={0.5}
            value={apr} onChange={(e) => setApr(Number(e.target.value))}
          />
        </label>
        <div className={styles.result}>
          <span className={styles.resultLabel}>Estimated monthly</span>
          <span className={styles.resultValue}>{gbp(monthly)}</span>
        </div>
        <p className={styles.disclaimer}>
          Indicative figure only. Final rate subject to lender approval and personal circumstances.
        </p>
      </aside>
    </div>
  )
}
