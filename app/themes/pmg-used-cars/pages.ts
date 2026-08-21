// PMG Used Car Sales — Mode B clone of carous-platform/pmgcarsales.
// Source routes mapped to brandstudio's ThemePageRegistry enum.
//
// Custom source routes with no brandstudio enum slot:
//   - /car-sourcing        → registered via the additive `carSourcing` slot
//     (app/car-sourcing/page.tsx delegator).
//   - /make/[slug] and /used-cars-in/[town] SEO hubs have no per-theme dynamic
//     route in brandstudio's fixed router; their files remain on disk for
//     reference but are NOT registered. The footer links to them are retargeted
//     to brandstudio-native /used-cars?make=<make> filters.
import type { ThemePageRegistry } from '../types'

import AboutPage from './pages/about/page'
import CarSourcingPage from './pages/car-sourcing/page'
import ComparePage from './pages/compare/page'
import ContactPage from './pages/contact/page'
import CookiePolicyPage from './pages/cookie-policy/page'
import HomePage from './pages/home/page'
import PrivacyPolicyPage from './pages/privacy-policy/page'
import SellYourCarPage from './pages/sell-your-car/page'
import UsedCarsPage from './pages/used-cars/page'
import VehicleDetailPage from './pages/used-cars/[slug]/page'
import WishlistPage from './pages/wishlist/page'

export const themePages: ThemePageRegistry = {
  home: HomePage as any,
  about: AboutPage as any,
  carSourcing: CarSourcingPage as any,
  compare: ComparePage as any,
  contact: ContactPage as any,
  cookiePolicy: CookiePolicyPage as any,
  privacyPolicy: PrivacyPolicyPage as any,
  sellYourCar: SellYourCarPage as any,
  usedCars: UsedCarsPage as any,
  vehicleDetail: VehicleDetailPage as any,
  wishlist: WishlistPage as any,
}

export default themePages
