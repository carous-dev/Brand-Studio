import type { ThemePageRegistry } from '../types'
import { Buy4lessukHomePage } from './pages/home/page'
import { Buy4lessukAboutPage } from './pages/about/page'
import { Buy4lessukContactPage } from './pages/contact/page'
import { Buy4lessukServicesPage } from './pages/services/page'
import { Buy4lessukSellYourCarPage } from './pages/sell-your-car/page'
import { Buy4lessukFinancePage } from './pages/finance/page'
import { Buy4lessukPartExchangePage } from './pages/part-exchange/page'
import { Buy4lessukUsedCarsPage } from './pages/used-cars/page'
import { Buy4lessukVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { Buy4lessukRecentlySoldPage } from './pages/recently-sold/page'
import { Buy4lessukComparePage } from './pages/compare/page'
import { Buy4lessukWishlistPage } from './pages/wishlist/page'
import { Buy4lessukPrivacyPolicyPage } from './pages/privacy-policy/page'
import { Buy4lessukCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: Buy4lessukHomePage,
  about: Buy4lessukAboutPage,
  contact: Buy4lessukContactPage,
  services: Buy4lessukServicesPage,
  sellYourCar: Buy4lessukSellYourCarPage,
  finance: Buy4lessukFinancePage,
  partExchange: Buy4lessukPartExchangePage,
  usedCars: Buy4lessukUsedCarsPage,
  vehicleDetail: Buy4lessukVehicleDetailPage,
  recentlySold: Buy4lessukRecentlySoldPage,
  compare: Buy4lessukComparePage,
  wishlist: Buy4lessukWishlistPage,
  privacyPolicy: Buy4lessukPrivacyPolicyPage,
  cookiePolicy: Buy4lessukCookiePolicyPage,
}

export const buy4lessukBespokePages = themePages
