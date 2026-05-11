import type { ThemePageRegistry } from '../types'
import { ShowroomHomePage } from './pages/home/page'
import { ShowroomAboutPage } from './pages/about/page'
import { ShowroomContactPage } from './pages/contact/page'
import { ShowroomServicesPage } from './pages/services/page'
import { ShowroomSellYourCarPage } from './pages/sell-your-car/page'
import { ShowroomFinancePage } from './pages/finance/page'
import { ShowroomPartExchangePage } from './pages/part-exchange/page'
import { ShowroomUsedCarsPage } from './pages/used-cars/page'
import { ShowroomVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { ShowroomRecentlySoldPage } from './pages/recently-sold/page'
import { ShowroomComparePage } from './pages/compare/page'
import { ShowroomWishlistPage } from './pages/wishlist/page'
import { ShowroomPrivacyPolicyPage } from './pages/privacy-policy/page'
import { ShowroomCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: ShowroomHomePage,
  about: ShowroomAboutPage,
  contact: ShowroomContactPage,
  services: ShowroomServicesPage,
  sellYourCar: ShowroomSellYourCarPage,
  finance: ShowroomFinancePage,
  partExchange: ShowroomPartExchangePage,
  usedCars: ShowroomUsedCarsPage,
  vehicleDetail: ShowroomVehicleDetailPage,
  recentlySold: ShowroomRecentlySoldPage,
  compare: ShowroomComparePage,
  wishlist: ShowroomWishlistPage,
  privacyPolicy: ShowroomPrivacyPolicyPage,
  cookiePolicy: ShowroomCookiePolicyPage,
}

export const showroomShineCarsBespokePages = themePages
