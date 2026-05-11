import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import ServiceHighlights from '../../components/ServiceHighlights'
import WhyChooseUs from '../../components/WhyChooseUs'
import FeaturedStock from '../../components/FeaturedStock'
import CtaBanner from '../../components/CtaBanner'
import Reviews from '../../components/Reviews'

export function ShowroomHomePage(_: ThemePageProps) {
  return (
    <>
      <Hero />
      <ServiceHighlights />
      <WhyChooseUs />
      <FeaturedStock />
      <CtaBanner />
      <Reviews />
    </>
  )
}

export default ShowroomHomePage
