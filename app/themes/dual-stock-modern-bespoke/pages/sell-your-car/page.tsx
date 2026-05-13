import type { ThemePageProps } from '../../../types'
import Link from 'next/link'
import SellYourCarMount from './SellYourCarMount'

export function DualSellYourCarPage(_props: ThemePageProps) {
  return (
    <main>
      <section className="dual-page-hero dual-page-hero--sell-your-car">
        <div className="dual-page-hero__inner">
          <nav className="dual-page-hero__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Sell your car</span>
          </nav>
          <h1 className="dual-page-hero__title">Sell your car (or bike) — same day.</h1>
          <p className="dual-page-hero__lead">
            Free online valuation, fair offer, payment same day. Cars AND motorcycles welcome.
          </p>
        </div>
      </section>
      <SellYourCarMount />
    </main>
  )
}

export default DualSellYourCarPage
