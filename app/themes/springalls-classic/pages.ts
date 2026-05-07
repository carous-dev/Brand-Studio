import type { ThemePageRegistry } from '../types'
import { SpringallsHomePage } from './pages/home/page'
import { SpringallsAboutPage } from './pages/about/page'
import { SpringallsContactPage } from './pages/contact/page'
import { SpringallsServicesPage } from './pages/services/page'
import { SpringallsSellYourCarPage } from './pages/sell-your-car/page'
import { SpringallsFinancePage } from './pages/finance/page'
import { SpringallsPartExchangePage } from './pages/part-exchange/page'
import { SpringallsUsedCarsPage } from './pages/used-cars/page'
import { SpringallsVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { SpringallsRecentlySoldPage } from './pages/recently-sold/page'
import { SpringallsComparePage } from './pages/compare/page'
import { SpringallsWishlistPage } from './pages/wishlist/page'
import { SpringallsPrivacyPolicyPage } from './pages/privacy-policy/page'
import { SpringallsCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: SpringallsHomePage,
  about: SpringallsAboutPage,
  contact: SpringallsContactPage,
  services: SpringallsServicesPage,
  sellYourCar: SpringallsSellYourCarPage,
  finance: SpringallsFinancePage,
  partExchange: SpringallsPartExchangePage,
  usedCars: SpringallsUsedCarsPage,
  vehicleDetail: SpringallsVehicleDetailPage,
  recentlySold: SpringallsRecentlySoldPage,
  compare: SpringallsComparePage,
  wishlist: SpringallsWishlistPage,
  privacyPolicy: SpringallsPrivacyPolicyPage,
  cookiePolicy: SpringallsCookiePolicyPage,
}

export const springallsClassicPages = themePages
