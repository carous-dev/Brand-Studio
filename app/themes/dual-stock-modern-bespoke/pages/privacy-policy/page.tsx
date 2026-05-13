import type { ThemePageProps } from '../../../types'
import Link from 'next/link'
import styles from './page.module.css'

export function DualPrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Dual Stock Dealer'
  return (
    <main>
      <section className="dual-page-hero dual-page-hero--privacy">
        <div className="dual-page-hero__inner">
          <nav className="dual-page-hero__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Privacy policy</span>
          </nav>
          <h1 className="dual-page-hero__title">Privacy policy</h1>
          <p className="dual-page-hero__lead">Last updated: 2026. How {brandName} handles your data.</p>
        </div>
      </section>

      <section className="dual-section">
        <div className={`dual-container ${styles.legal}`}>
          <h2>Who we are</h2>
          <p>{brandName} is an independent UK dealer for cars and motorcycles. Our website is operated on behalf of the dealer by Carous Limited.</p>

          <h2>What we collect</h2>
          <p>We collect the personal data you share with us via our enquiry, finance and sell-your-car forms — name, contact details, vehicle interest. We may also collect cookies (see our <Link href="/cookie-policy">cookie policy</Link>).</p>

          <h2>How we use it</h2>
          <p>To respond to your enquiries, process finance applications, arrange test drives or deliveries, and (with your consent) market relevant vehicles to you. We never sell your data.</p>

          <h2>Who we share it with</h2>
          <p>FCA-regulated finance lenders (only when you've started a finance application), vehicle history checking services, courier services for delivery, and our analytics provider for anonymised traffic data.</p>

          <h2>Your rights</h2>
          <p>You have the right to access, correct, delete or port your data. Contact us via the <Link href="/contact">contact page</Link> to action any of these.</p>

          <h2>Cookies</h2>
          <p>See our dedicated <Link href="/cookie-policy">cookie policy</Link> for details on essential, analytics and marketing cookies.</p>

          <h2>Changes</h2>
          <p>We'll update this page if our practices change. Material changes will be flagged at the top of the page.</p>
        </div>
      </section>
    </main>
  )
}

export default DualPrivacyPolicyPage
