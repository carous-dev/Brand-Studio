import type { ThemePageRegistry } from '../types'
import { EleHomePage } from './pages/home/page'
import { EleAboutPage } from './pages/about/page'
import { EleContactPage } from './pages/contact/page'
import { EleServicesPage } from './pages/services/page'
import { EleSellYourCarPage } from './pages/sell-your-car/page'
import { EleFinancePage } from './pages/finance/page'
import { ElePartExchangePage } from './pages/part-exchange/page'
import { EleUsedCarsPage } from './pages/used-cars/page'
import { EleVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { EleRecentlySoldPage } from './pages/recently-sold/page'
import { EleComparePage } from './pages/compare/page'
import { EleWishlistPage } from './pages/wishlist/page'
import { ElePrivacyPolicyPage } from './pages/privacy-policy/page'
import { EleCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: EleHomePage,
  about: EleAboutPage,
  contact: EleContactPage,
  services: EleServicesPage,
  sellYourCar: EleSellYourCarPage,
  finance: EleFinancePage,
  partExchange: ElePartExchangePage,
  usedCars: EleUsedCarsPage,
  vehicleDetail: EleVehicleDetailPage,
  recentlySold: EleRecentlySoldPage,
  compare: EleComparePage,
  wishlist: EleWishlistPage,
  privacyPolicy: ElePrivacyPolicyPage,
  cookiePolicy: EleCookiePolicyPage,
}

export const eleCarSalesBespokePages = themePages
