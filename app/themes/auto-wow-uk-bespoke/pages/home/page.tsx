import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import SpecsBar from '../../components/SpecsBar'
import LatestArrivals from '../../components/LatestArrivals'
import ServicesBand from '../../components/ServicesBand'
import RecentlySoldPreview from '../../components/RecentlySoldPreview'
import CtaBanner from '../../components/CtaBanner'
import Reviews from '../../components/Reviews'
import Directory from '../../components/Directory'

export function AutoHomePage({ brand }: ThemePageProps) {
  return (
    <>
      <Hero brand={brand} />
      <div data-aos="fade-up"><SpecsBar /></div>
      <div data-aos="fade-up" data-mfx-scroll="parallax-slow"><LatestArrivals brand={brand} limit={8} /></div>
      <div data-aos="zoom-in-up"><ServicesBand /></div>
      <div data-aos="fade-up" data-mfx-scroll="fade-out-on-exit"><RecentlySoldPreview brand={brand} /></div>
      <div data-aos="slide-up"><CtaBanner /></div>
      <div data-aos="fade-up"><Reviews /></div>
      <div data-aos="fade-up-right"><Directory brand={brand} /></div>
    </>
  )
}

export default AutoHomePage
