import type { ThemePageRegistry } from '../types'
import { AxisHomePage } from './pages/home/page'
import { AxisAboutPage } from './pages/about/page'
import { AxisContactPage } from './pages/contact/page'
import { AxisServicesPage } from './pages/services/page'
import { AxisSellYourCarPage } from './pages/sell-your-car/page'
import { AxisFinancePage } from './pages/finance/page'
import { AxisPartExchangePage } from './pages/part-exchange/page'
import { AxisUsedCarsPage } from './pages/used-cars/page'
import AxisVehicleDetailPage from './pages/used-cars/[slug]/page'
import { AxisRecentlySoldPage } from './pages/recently-sold/page'
import { AxisComparePage } from './pages/compare/page'
import { AxisWishlistPage } from './pages/wishlist/page'
import { AxisPrivacyPolicyPage } from './pages/privacy-policy/page'
import { AxisCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: AxisHomePage,
  about: AxisAboutPage,
  contact: AxisContactPage,
  services: AxisServicesPage,
  sellYourCar: AxisSellYourCarPage,
  finance: AxisFinancePage,
  partExchange: AxisPartExchangePage,
  usedCars: AxisUsedCarsPage,
  vehicleDetail: AxisVehicleDetailPage,
  recentlySold: AxisRecentlySoldPage,
  compare: AxisComparePage,
  wishlist: AxisWishlistPage,
  privacyPolicy: AxisPrivacyPolicyPage,
  cookiePolicy: AxisCookiePolicyPage,
}

export const axisAutosBespokePages = themePages
