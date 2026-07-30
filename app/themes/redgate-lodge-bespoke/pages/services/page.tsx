import type { ThemePageProps } from '../../../types'
import PageRibbon from '../../components/PageRibbon'
import AftercareSuite from '../../components/AftercareSuite'
import HowItWorks from '../../components/HowItWorks'
import PxInvite from '../../components/PxInvite'

/**
 * Services — Server Component (design-language §7): page-ribbon (`surface`) →
 * aftercare-suite EXPANDED (`bg`, 6 cards) → how-it-works ledger-steps 01–03
 * (`surface`) → px-invite (`primary`) → footer chain. The ledger-steps are the
 * route's sole numbered-ledger motif (do-not §5 — no proof-ledger here).
 */
export function RedgateServicesPage({ brand }: ThemePageProps) {
  return (
    <>
      <PageRibbon
        brand={brand}
        eyebrowKey="ribbon.eyebrow"
        titleKey="ribbon.services_title"
        leadKey="ribbon.services_lead"
      />
      <AftercareSuite brand={brand} variant="services" />
      <HowItWorks
        brand={brand}
        eyebrowKey="services_steps.eyebrow"
        titleKey="services_steps.title"
        stepKeyPrefix="services_steps.step"
        stepsTitleSrKey="services_steps.title_sr"
        background="surface"
      />
      <PxInvite brand={brand} />
    </>
  )
}

export default RedgateServicesPage
