import type { ThemePageRegistry } from '../types'
import { FbmHomePage } from './pages/home/page'
import { FbmAboutPage } from './pages/about/page'
import { FbmContactPage } from './pages/contact/page'
import { FbmServicesPage } from './pages/services/page'
import { FbmSellYourCarPage } from './pages/sell-your-car/page'
import { FbmFinancePage } from './pages/finance/page'
import { FbmPartExchangePage } from './pages/part-exchange/page'
import { FbmUsedCarsPage } from './pages/used-cars/page'
import { FbmVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { FbmRecentlySoldPage } from './pages/recently-sold/page'
import { FbmComparePage } from './pages/compare/page'
import { FbmWishlistPage } from './pages/wishlist/page'
import { FbmPrivacyPolicyPage } from './pages/privacy-policy/page'
import { FbmCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: FbmHomePage,
  about: FbmAboutPage,
  contact: FbmContactPage,
  services: FbmServicesPage,
  sellYourCar: FbmSellYourCarPage,
  finance: FbmFinancePage,
  partExchange: FbmPartExchangePage,
  usedCars: FbmUsedCarsPage,
  vehicleDetail: FbmVehicleDetailPage,
  recentlySold: FbmRecentlySoldPage,
  compare: FbmComparePage,
  wishlist: FbmWishlistPage,
  privacyPolicy: FbmPrivacyPolicyPage,
  cookiePolicy: FbmCookiePolicyPage,
}

export const fbmMotorsPages = themePages
