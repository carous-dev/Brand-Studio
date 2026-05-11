import type { ThemePageRegistry } from '../types'
import { ChesterfieldHomePage } from './pages/home/page'
import { ChesterfieldAboutPage } from './pages/about/page'
import { ChesterfieldContactPage } from './pages/contact/page'
import { ChesterfieldServicesPage } from './pages/services/page'
import { ChesterfieldSellYourCarPage } from './pages/sell-your-car/page'
import { ChesterfieldFinancePage } from './pages/finance/page'
import { ChesterfieldPartExchangePage } from './pages/part-exchange/page'
import { ChesterfieldUsedCarsPage } from './pages/used-cars/page'
import { ChesterfieldVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { ChesterfieldRecentlySoldPage } from './pages/recently-sold/page'
import { ChesterfieldComparePage } from './pages/compare/page'
import { ChesterfieldWishlistPage } from './pages/wishlist/page'
import { ChesterfieldPrivacyPolicyPage } from './pages/privacy-policy/page'
import { ChesterfieldCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: ChesterfieldHomePage,
  about: ChesterfieldAboutPage,
  contact: ChesterfieldContactPage,
  services: ChesterfieldServicesPage,
  sellYourCar: ChesterfieldSellYourCarPage,
  finance: ChesterfieldFinancePage,
  partExchange: ChesterfieldPartExchangePage,
  usedCars: ChesterfieldUsedCarsPage,
  vehicleDetail: ChesterfieldVehicleDetailPage,
  recentlySold: ChesterfieldRecentlySoldPage,
  compare: ChesterfieldComparePage,
  wishlist: ChesterfieldWishlistPage,
  privacyPolicy: ChesterfieldPrivacyPolicyPage,
  cookiePolicy: ChesterfieldCookiePolicyPage,
}

export const chesterfieldMotorEmpireBespokePages = themePages
