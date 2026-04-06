import type { ThemePageProps } from '../../../types'
import AboutSectionModern from '../../components/AboutSectionModern'
import Featured from '../../components/Featured'

export function GildedAboutPage(_: ThemePageProps) {
  return (
    <main>
      <AboutSectionModern />
      <Featured />
    </main>
  )
}

export default GildedAboutPage
