import type { ThemePageProps } from '../../../types'
import PageRibbon from '../../components/PageRibbon'
import SellPxForm from '../../components/SellPxForm'
import Reviews from '../../components/Reviews'

/**
 * Sell my car — Server Component (build-rules §3: no `'use client'` here).
 * Design-language §7: page-ribbon (`surface`) → sell/PX form section, `sell`
 * copy variant (form card + LedgerSteps rail, `bg`) → reviews (`bg`) → footer
 * chain. `brand` is plain JSON, so it passes safely into the client SellPxForm.
 */
export function RedgateSellYourCarPage({ brand }: ThemePageProps) {
  return (
    <>
      <PageRibbon
        brand={brand}
        eyebrowKey="ribbon.eyebrow"
        titleKey="ribbon.sell_title"
        leadKey="ribbon.sell_lead"
      />
      <SellPxForm brand={brand} variant="sell" />
      <Reviews brand={brand} />
    </>
  )
}

export default RedgateSellYourCarPage
