import type { ThemePageRegistry } from '../types'
import { KainHomePage } from './pages/home/page'
import { KainAboutPage } from './pages/about/page'
import { KainContactPage } from './pages/contact/page'
import { KainServicesPage } from './pages/services/page'
import { KainSellYourCarPage } from './pages/sell-your-car/page'
import { KainFinancePage } from './pages/finance/page'
import { KainPartExchangePage } from './pages/part-exchange/page'
import { KainUsedCarsPage } from './pages/used-cars/page'
import { KainVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { KainRecentlySoldPage } from './pages/recently-sold/page'
import { KainComparePage } from './pages/compare/page'
import { KainWishlistPage } from './pages/wishlist/page'
import { KainPrivacyPolicyPage } from './pages/privacy-policy/page'
import { KainCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: KainHomePage,
  about: KainAboutPage,
  contact: KainContactPage,
  services: KainServicesPage,
  sellYourCar: KainSellYourCarPage,
  finance: KainFinancePage,
  partExchange: KainPartExchangePage,
  usedCars: KainUsedCarsPage,
  vehicleDetail: KainVehicleDetailPage,
  recentlySold: KainRecentlySoldPage,
  compare: KainComparePage,
  wishlist: KainWishlistPage,
  privacyPolicy: KainPrivacyPolicyPage,
  cookiePolicy: KainCookiePolicyPage,
}

export const kainMotorsBespokePages = themePages
