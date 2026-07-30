import type { ThemePageProps } from '../../../types'
import PageRibbon from '../../components/PageRibbon'
import CompareClient from './CompareClient'

/**
 * Compare — Server Component. Slim page ribbon (design §7), then the compare
 * table (ledger-hairline rows + empty state) rendered by the client garage island.
 */
export function RedgateComparePage({ brand }: ThemePageProps) {
  return (
    <>
      <PageRibbon
        brand={brand}
        slim
        eyebrowKey="ribbon.eyebrow"
        titleKey="ribbon.compare_title"
        leadKey="ribbon.compare_lead"
      />
      <CompareClient />
    </>
  )
}

export default RedgateComparePage
