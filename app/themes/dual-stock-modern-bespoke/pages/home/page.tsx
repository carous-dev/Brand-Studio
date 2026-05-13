import type { ThemePageProps } from '../../../types'
import Hero from '../../components/sections/Hero'
import StatsBar from '../../components/sections/StatsBar'
import FeaturedStock from '../../components/sections/FeaturedStock'
import ServiceHighlights from '../../components/sections/ServiceHighlights'
import BrandTrust from '../../components/sections/BrandTrust'
import Testimonials from '../../components/sections/Testimonials'
import CtaBand from '../../components/sections/CtaBand'
import RecentlySoldRail from '../../components/sections/RecentlySoldRail'

export function DualHomePage(_props: ThemePageProps) {
  return (
    <>
      <div data-aos="fade"><Hero /></div>
      <div data-aos="fade-up" data-aos-delay="80"><StatsBar /></div>
      <div data-aos="fade-up" data-aos-delay="160"><FeaturedStock /></div>
      <div data-aos="fade-up" data-aos-delay="120"><ServiceHighlights /></div>
      <div data-aos="zoom-in" data-aos-delay="120"><BrandTrust /></div>
      <div data-aos="fade-up"><RecentlySoldRail /></div>
      <div data-aos="fade-up-right" data-aos-delay="80"><Testimonials /></div>
      <div data-aos-mfx-scroll="parallax-slow" data-aos="fade-up"><CtaBand /></div>
    </>
  )
}

export default DualHomePage
