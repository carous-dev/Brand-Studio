import type { ThemePageProps } from '../../../types'
import PageRibbon from '../../components/PageRibbon'
import AboutStory from '../../components/AboutStory'
import ProofLedger from '../../components/ProofLedger'
import AftercareSuite from '../../components/AftercareSuite'
import PxInvite from '../../components/PxInvite'

/**
 * About — Server Component (design-language §7): page-ribbon (`surface`) → story
 * split reusing the hero mat treatment (`bg`) → proof-ledger REUSED verbatim
 * (`surface`) → aftercare-suite (`surface`, separated by the ledger's bottom
 * hairline) → px-invite (`primary`) → footer chain. The proof-ledger is the
 * route's only numbered-ledger motif (do-not §5).
 */
export function RedgateAboutPage({ brand }: ThemePageProps) {
  return (
    <>
      <PageRibbon
        brand={brand}
        eyebrowKey="ribbon.eyebrow"
        titleKey="ribbon.about_title"
        leadKey="ribbon.about_lead"
      />
      <AboutStory brand={brand} />
      <ProofLedger brand={brand} />
      <AftercareSuite brand={brand} variant="home" />
      <PxInvite brand={brand} />
    </>
  )
}

export default RedgateAboutPage
