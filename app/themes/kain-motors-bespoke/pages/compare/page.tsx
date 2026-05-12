import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import KainCompareClient from './CompareClient'

export function KainComparePage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        variant="contact"
        eyebrow="Compare"
        title="Lay them out side-by-side."
        lead="Compare up to four vehicles head-to-head. Helpful when you’re narrowing down a shortlist."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Compare' }]}
      />
      <KainCompareClient />
    </>
  )
}

export default KainComparePage
