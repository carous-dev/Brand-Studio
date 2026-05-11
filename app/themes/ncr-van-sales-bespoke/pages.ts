import type { ThemePageRegistry } from '../types'
import { NcrHomePage } from './pages/home/page'
import { NcrAboutPage } from './pages/about/page'
import { NcrContactPage } from './pages/contact/page'
import { NcrServicesPage } from './pages/services/page'
import { NcrSellYourCarPage } from './pages/sell-your-car/page'
import { NcrFinancePage } from './pages/finance/page'
import { NcrPartExchangePage } from './pages/part-exchange/page'
import { NcrUsedCarsPage } from './pages/used-cars/page'
import { NcrVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { NcrRecentlySoldPage } from './pages/recently-sold/page'
import { NcrComparePage } from './pages/compare/page'
import { NcrWishlistPage } from './pages/wishlist/page'
import { NcrPrivacyPolicyPage } from './pages/privacy-policy/page'
import { NcrCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: NcrHomePage,
  about: NcrAboutPage,
  contact: NcrContactPage,
  services: NcrServicesPage,
  sellYourCar: NcrSellYourCarPage,
  finance: NcrFinancePage,
  partExchange: NcrPartExchangePage,
  usedCars: NcrUsedCarsPage,
  vehicleDetail: NcrVehicleDetailPage,
  recentlySold: NcrRecentlySoldPage,
  compare: NcrComparePage,
  wishlist: NcrWishlistPage,
  privacyPolicy: NcrPrivacyPolicyPage,
  cookiePolicy: NcrCookiePolicyPage,
}

export const ncrVanSalesBespokePages = themePages
