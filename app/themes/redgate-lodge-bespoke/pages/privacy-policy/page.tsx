import type { ThemePageProps } from '../../../types'
import PageRibbon from '../../components/PageRibbon'
import LegalProse from '../../components/LegalProse'

/**
 * Privacy policy — Server Component. Slim page ribbon (design §7), then the
 * 720px legal-prose measure (`bg`) via the shared LegalProse builder.
 */
export function RedgatePrivacyPolicyPage({ brand }: ThemePageProps) {
  return (
    <>
      <PageRibbon
        brand={brand}
        slim
        eyebrowKey="ribbon.eyebrow"
        titleKey="ribbon.privacy_title"
        leadKey="ribbon.privacy_lead"
      />
      <LegalProse brand={brand} keyPrefix="privacy" />
    </>
  )
}

export default RedgatePrivacyPolicyPage
