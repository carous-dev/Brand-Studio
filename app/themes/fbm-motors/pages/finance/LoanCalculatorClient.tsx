'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  display: string
}) {
  return (
    <div className={styles.slider}>
      <div className={styles.sliderHead}>
        <label className={styles.sliderLabel} htmlFor={label}>{label}</label>
        <span className={styles.sliderDisplay}>{display}</span>
      </div>
      <input
        id={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.sliderInput}
      />
    </div>
  )
}

export default function LoanCalculatorClient({ disclaimer }: { disclaimer?: string }) {
  const [price, setPrice] = useState(12000)
  const [deposit, setDeposit] = useState(2000)
  const [term, setTerm] = useState(48)
  const [apr, setApr] = useState(9.9)

  const { monthly, totalInterest, totalPayable } = useMemo(() => {
    const principal = Math.max(price - deposit, 0)
    const r = apr / 100 / 12
    const m = r === 0 ? principal / term : (principal * r) / (1 - Math.pow(1 + r, -term))
    const total = m * term
    return { monthly: m, totalInterest: total - principal, totalPayable: total + deposit }
  }, [price, deposit, term, apr])

  const fmt = (n: number) =>
    n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })

  return (
    <section className={styles.calc} aria-label="Loan calculator">
      <div className={styles.controls}>
        <Slider label="Vehicle price" value={price} min={1000} max={40000} step={250} onChange={setPrice} display={fmt(price)} />
        <Slider label="Deposit" value={deposit} min={0} max={Math.min(price, 20000)} step={250} onChange={setDeposit} display={fmt(deposit)} />
        <Slider label="Term" value={term} min={12} max={72} step={6} onChange={setTerm} display={`${term} months`} />
        <Slider label="APR" value={apr} min={3} max={20} step={0.1} onChange={setApr} display={`${apr.toFixed(1)}%`} />
      </div>

      <div className={styles.results}>
        <div className={styles.resultsHero}>
          <p className={styles.resultsLabel}>Estimated monthly payment</p>
          <p className={styles.resultsMonthly} aria-live="polite">
            {fmt(monthly)}
            <span className={styles.resultsMonthlySub}>/mo</span>
          </p>
        </div>
        <dl className={styles.statsGrid}>
          {([
            ['Amount financed', fmt(price - deposit)],
            ['Total interest', fmt(totalInterest)],
            ['Total payable', fmt(totalPayable)],
            ['Term', `${term} months`],
          ] as Array<[string, string]>).map(([k, v]) => (
            <div key={k} className={styles.statBox}>
              <dt className={styles.statBoxLabel}>{k}</dt>
              <dd className={styles.statBoxValue}>{v}</dd>
            </div>
          ))}
        </dl>
        <Link href="/contact" className={`fbm-btn-primary ${styles.calcCta}`}>Talk to our finance team →</Link>
        {disclaimer && <p className={styles.disclaimer}>{disclaimer}</p>}
      </div>
    </section>
  )
}
