import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import CTAHero from '../../components/CTAHero'
import ServiceMain from '../../components/ServiceMain'
import Services from '../../components/Services'
import FeaturedRedesign from '../../components/Featured-redesign'
import CTAQuestion from '../../components/CTAQuestion'
import Testimonials from '../../components/Testimonials'
import ReviewsStrip from '../../components/ReviewsStrip'

export function ClassicHomePage(_: ThemePageProps) {
  return (
    <div suppressHydrationWarning>
      <Hero />
      <CTAHero />
      <ServiceMain />
      <Services />
      <CTAQuestion />
      <FeaturedRedesign />
      <Testimonials />
      <ReviewsStrip />
    </div>
  )
}

export default ClassicHomePage
