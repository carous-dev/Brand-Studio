import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CompareIsland from './CompareIsland'

export function NcrComparePage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        eyebrow="Side-by-side"
        title="Compare your shortlist."
        lead="Up to four vans at a glance. Price, mileage, year, spec — all in one row."
        imageSlot="hero"
        pills={['Saved locally', 'Up to 4 vans']}
      />
      <CompareIsland />
    </>
  )
}

export default NcrComparePage
