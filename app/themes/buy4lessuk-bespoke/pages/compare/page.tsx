import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CompareClient from './CompareClient'

export function Buy4lessukComparePage(_: ThemePageProps) {
  return (
    <>
      <PageHero title="Compare vehicles" eyebrow="Side by side" slot="about" />
      <CompareClient />
    </>
  )
}

export default Buy4lessukComparePage
