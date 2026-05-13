import type { ThemePageRegistry } from '../types'
import { DualHomePage } from './pages/home/page'
import { DualAboutPage } from './pages/about/page'
import { DualContactPage } from './pages/contact/page'
import { DualServicesPage } from './pages/services/page'
import { DualSellYourCarPage } from './pages/sell-your-car/page'
import { DualFinancePage } from './pages/finance/page'
import { DualPartExchangePage } from './pages/part-exchange/page'
import { DualUsedCarsPage } from './pages/used-cars/page'
import { DualVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { DualRecentlySoldPage } from './pages/recently-sold/page'
import { DualComparePage } from './pages/compare/page'
import { DualWishlistPage } from './pages/wishlist/page'
import { DualPrivacyPolicyPage } from './pages/privacy-policy/page'
import { DualCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: DualHomePage,
  about: DualAboutPage,
  contact: DualContactPage,
  services: DualServicesPage,
  sellYourCar: DualSellYourCarPage,
  finance: DualFinancePage,
  partExchange: DualPartExchangePage,
  usedCars: DualUsedCarsPage,
  vehicleDetail: DualVehicleDetailPage,
  recentlySold: DualRecentlySoldPage,
  compare: DualComparePage,
  wishlist: DualWishlistPage,
  privacyPolicy: DualPrivacyPolicyPage,
  cookiePolicy: DualCookiePolicyPage,
}

export const dualStockModernBespokePages = themePages
