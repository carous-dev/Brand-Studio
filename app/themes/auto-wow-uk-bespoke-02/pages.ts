import type { ThemePageRegistry } from '../types'
import { AutoHomePage } from './pages/home/page'
import { AutoAboutPage } from './pages/about/page'
import { AutoContactPage } from './pages/contact/page'
import { AutoServicesPage } from './pages/services/page'
import { AutoSellYourCarPage } from './pages/sell-your-car/page'
import { AutoFinancePage } from './pages/finance/page'
import { AutoPartExchangePage } from './pages/part-exchange/page'
import { AutoUsedCarsPage } from './pages/used-cars/page'
import AutoVehicleDetailPage from './pages/used-cars/[slug]/page'
import { AutoRecentlySoldPage } from './pages/recently-sold/page'
import AutoComparePage from './pages/compare/page'
import AutoWishlistPage from './pages/wishlist/page'
import { AutoPrivacyPolicyPage } from './pages/privacy-policy/page'
import { AutoCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: AutoHomePage,
  about: AutoAboutPage,
  contact: AutoContactPage,
  services: AutoServicesPage,
  sellYourCar: AutoSellYourCarPage,
  finance: AutoFinancePage,
  partExchange: AutoPartExchangePage,
  usedCars: AutoUsedCarsPage,
  vehicleDetail: AutoVehicleDetailPage,
  recentlySold: AutoRecentlySoldPage,
  compare: AutoComparePage,
  wishlist: AutoWishlistPage,
  privacyPolicy: AutoPrivacyPolicyPage,
  cookiePolicy: AutoCookiePolicyPage,
}

export const autoWowUkBespoke02Pages = themePages
