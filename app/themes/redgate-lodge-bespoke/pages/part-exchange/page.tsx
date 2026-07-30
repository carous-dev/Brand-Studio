import type { ThemePageProps } from '../../../types'
import PageRibbon from '../../components/PageRibbon'
import SellPxForm from '../../components/SellPxForm'

/**
 * Part exchange — Server Component (build-rules §3: no `'use client'` here). Page
 * ribbon (design §7), then the sell/PX form section in its `px` copy variant
 * (identical layout, PX copy). `brand` is plain JSON, so it passes safely into
 * the client SellPxForm.
 */
export function RedgatePartExchangePage({ brand }: ThemePageProps) {
  return (
    <>
      <PageRibbon
        brand={brand}
        eyebrowKey="ribbon.eyebrow"
        titleKey="ribbon.px_title"
        leadKey="ribbon.px_lead"
      />
      <SellPxForm brand={brand} variant="px" />
    </>
  )
}

export default RedgatePartExchangePage
