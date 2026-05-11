import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CompareIsland from './CompareIsland'

export function AutoComparePage({ brand }: ThemePageProps) {
  return (
    <>
      <div data-aos="fade">
        <PageHero
          eyebrow="Compare"
          title="Side-by-side specs."
          lead="Drop up to four cars in and we’ll line up the numbers — price, miles, fuel, transmission — so the choice is obvious."
          imageSlot="hero"
        />
      </div>
      <div data-aos="fade-up" data-aos-delay="120"><CompareIsland /></div>
    </>
  )
}

export default AutoComparePage
