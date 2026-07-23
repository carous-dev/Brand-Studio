import Link from 'next/link'
import styles from './FinanceTradeSplit.module.css'

export default function FinanceTradeSplit() {
  return (
    <section className={styles.split} aria-label="Financing and part exchange">
      <div className={`${styles.panel} ${styles.panelLight}`}>
        <div className={styles.panelBg} aria-hidden />
        <div className={styles.panelWash} aria-hidden />
        <div className={styles.panelInner}>
          <p className={styles.eyebrow}>Easy Financing</p>
          <h2 className={styles.title}>Get Approved<br />In Minutes</h2>
          <p className={styles.text}>
            Apply online and get pre-approved quickly with no impact on your
            credit score.
          </p>
          <Link href="/finance" className={styles.cta}>
            Get Pre-Approved
          </Link>
        </div>
      </div>

      <div className={`${styles.panel} ${styles.panelDark}`}>
        <div className={`${styles.panelBg} ${styles.panelBgDark}`} aria-hidden />
        <div className={styles.panelInner}>
          <p className={`${styles.eyebrow} ${styles.eyebrowOnDark}`}>Value Your Trade</p>
          <h2 className={`${styles.title} ${styles.titleOnDark}`}>Know Your Car&apos;s<br />True Value</h2>
          <p className={`${styles.text} ${styles.textOnDark}`}>
            Get a fair market value for your vehicle in just a few easy steps.
          </p>
          <Link href="/sell-my-car" className={styles.ctaGhost}>
            Value Your Trade
          </Link>
        </div>
      </div>
    </section>
  )
}
