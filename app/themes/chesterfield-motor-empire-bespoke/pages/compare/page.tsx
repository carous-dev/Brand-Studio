import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CompareIsland from './CompareIsland'

export function ChesterfieldComparePage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        eyebrow="Compare"
        title="Side-by-side comparison"
        lead="Drop up to four cars in here to weigh price, mileage, fuel, and the rest at a glance."
        variant="compact"
      />
      <CompareIsland />
    </>
  )
}

export default ChesterfieldComparePage
