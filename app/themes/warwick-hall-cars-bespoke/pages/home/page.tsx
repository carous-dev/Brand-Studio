import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import AboutUs from '../../components/AboutUs'
import CustomerReviews from '../../components/CustomerReviews'
import LatestArrivals from '../../components/LatestArrivals'

export function WarwickHomePage(_props: ThemePageProps) {
  return (
    <>
      <Hero />
      <AboutUs />
      <CustomerReviews />
      <LatestArrivals />
    </>
  )
}

export default WarwickHomePage
