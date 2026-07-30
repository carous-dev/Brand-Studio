import type { ThemePageProps } from '../../../types'
import PageRibbon from '../../components/PageRibbon'
import PxInvite from '../../components/PxInvite'
import RecentlySoldClient from './RecentlySoldClient'

/**
 * Recently sold — Server Component (design-language §7): page-ribbon (warm
 * valediction lead) → showroom grid of sold-variant cards (bg, wide) → px-invite
 * `sold` copy variant ("yours could be next") → footer chain. The sold grid is a
 * client island (VehicleCard needs the garage/brand context); this wrapper stays
 * server and threads the inventory it was handed.
 */
export function RedgateRecentlySoldPage({ initialInventory, brand }: ThemePageProps) {
  const items = Array.isArray(initialInventory) ? initialInventory : []
  return (
    <>
      <PageRibbon
        brand={brand}
        eyebrowKey="ribbon.eyebrow"
        titleKey="ribbon.sold_title"
        leadKey="ribbon.sold_lead"
      />
      <RecentlySoldClient items={items} />
      <PxInvite brand={brand} variant="sold" />
    </>
  )
}

export default RedgateRecentlySoldPage
