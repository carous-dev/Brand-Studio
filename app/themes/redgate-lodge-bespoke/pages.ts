import type { ThemePageRegistry } from '../types'
import { RedgateHomePage } from './pages/home/page'
import { RedgateAboutPage } from './pages/about/page'
import { RedgateContactPage } from './pages/contact/page'
import { RedgateServicesPage } from './pages/services/page'
import { RedgateSellYourCarPage } from './pages/sell-your-car/page'
import { RedgateFinancePage } from './pages/finance/page'
import { RedgatePartExchangePage } from './pages/part-exchange/page'
import { RedgateUsedCarsPage } from './pages/used-cars/page'
import { RedgateVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { RedgateRecentlySoldPage } from './pages/recently-sold/page'
import { RedgateComparePage } from './pages/compare/page'
import { RedgateWishlistPage } from './pages/wishlist/page'
import { RedgatePrivacyPolicyPage } from './pages/privacy-policy/page'
import { RedgateCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: RedgateHomePage,
  about: RedgateAboutPage,
  contact: RedgateContactPage,
  services: RedgateServicesPage,
  sellYourCar: RedgateSellYourCarPage,
  finance: RedgateFinancePage,
  partExchange: RedgatePartExchangePage,
  usedCars: RedgateUsedCarsPage,
  vehicleDetail: RedgateVehicleDetailPage,
  recentlySold: RedgateRecentlySoldPage,
  compare: RedgateComparePage,
  wishlist: RedgateWishlistPage,
  privacyPolicy: RedgatePrivacyPolicyPage,
  cookiePolicy: RedgateCookiePolicyPage,
}

export const redgateLodgeBespokePages = themePages
