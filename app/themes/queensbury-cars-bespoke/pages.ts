import type { ThemePageRegistry } from '../types'
import { QueensburyHomePage } from './pages/home/page'
import { QueensburyAboutPage } from './pages/about/page'
import { QueensburyContactPage } from './pages/contact/page'
import { QueensburyServicesPage } from './pages/services/page'
import { QueensburySellYourCarPage } from './pages/sell-your-car/page'
import { QueensburyFinancePage } from './pages/finance/page'
import { QueensburyPartExchangePage } from './pages/part-exchange/page'
import { QueensburyUsedCarsPage } from './pages/used-cars/page'
import { QueensburyVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { QueensburyRecentlySoldPage } from './pages/recently-sold/page'
import { QueensburyComparePage } from './pages/compare/page'
import { QueensburyWishlistPage } from './pages/wishlist/page'
import { QueensburyPrivacyPolicyPage } from './pages/privacy-policy/page'
import { QueensburyCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: QueensburyHomePage,
  about: QueensburyAboutPage,
  contact: QueensburyContactPage,
  services: QueensburyServicesPage,
  sellYourCar: QueensburySellYourCarPage,
  finance: QueensburyFinancePage,
  partExchange: QueensburyPartExchangePage,
  usedCars: QueensburyUsedCarsPage,
  vehicleDetail: QueensburyVehicleDetailPage,
  recentlySold: QueensburyRecentlySoldPage,
  compare: QueensburyComparePage,
  wishlist: QueensburyWishlistPage,
  privacyPolicy: QueensburyPrivacyPolicyPage,
  cookiePolicy: QueensburyCookiePolicyPage,
}

export const queensburyCarsBespokePages = themePages
