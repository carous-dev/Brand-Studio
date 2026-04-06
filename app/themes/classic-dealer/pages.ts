import type { ThemePageRegistry } from '../types'
import { ClassicHomePage } from './pages/home/page'
import { ClassicAboutPage } from './pages/about/page'
import { ClassicContactPage } from './pages/contact/page'
import { ClassicServicesPage } from './pages/services/page'
import { ClassicSellYourCarPage } from './pages/sell-your-car/page'
import { ClassicRecentlySoldPage } from './pages/recently-sold/page'
import { ClassicUsedCarsPage } from './pages/used-cars/page'
import { ClassicVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { ClassicComparePage } from './pages/compare/page'
import { ClassicWishlistPage } from './pages/wishlist/page'
import { ClassicPrivacyPolicyPage } from './pages/privacy-policy/page'
import { ClassicCookiePolicyPage } from './pages/cookie-policy/page'

/**
 * Classic dealer theme page registry.
 */
export const themePages: ThemePageRegistry = {
  home: ClassicHomePage,
  about: ClassicAboutPage,
  contact: ClassicContactPage,
  services: ClassicServicesPage,
  sellYourCar: ClassicSellYourCarPage,
  recentlySold: ClassicRecentlySoldPage,
  usedCars: ClassicUsedCarsPage,
  vehicleDetail: ClassicVehicleDetailPage,
  compare: ClassicComparePage,
  wishlist: ClassicWishlistPage,
  privacyPolicy: ClassicPrivacyPolicyPage,
  cookiePolicy: ClassicCookiePolicyPage,
}
export const classicDealerPages = themePages
