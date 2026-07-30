import type { ThemePageProps } from '../../../types'
import PageRibbon from '../../components/PageRibbon'
import LegalProse from '../../components/LegalProse'

/**
 * Cookie policy — Server Component. Slim page ribbon (design §7), then the
 * 720px legal-prose measure (`bg`) via the shared LegalProse builder.
 */
export function RedgateCookiePolicyPage({ brand }: ThemePageProps) {
  return (
    <>
      <PageRibbon
        brand={brand}
        slim
        eyebrowKey="ribbon.eyebrow"
        titleKey="ribbon.cookie_title"
        leadKey="ribbon.cookie_lead"
      />
      <LegalProse brand={brand} keyPrefix="cookie" />
    </>
  )
}

export default RedgateCookiePolicyPage
