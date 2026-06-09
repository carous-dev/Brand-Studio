import type { ThemePageRegistry } from '../types'
import { WarwickHomePage } from './pages/home/page'
import { WarwickAboutPage } from './pages/about/page'
import { WarwickContactPage } from './pages/contact/page'
import { WarwickServicesPage } from './pages/services/page'
import { WarwickSellYourCarPage } from './pages/sell-your-car/page'
import { WarwickFinancePage } from './pages/finance/page'
import { WarwickPartExchangePage } from './pages/part-exchange/page'
import { WarwickWarrantyPage } from './pages/warranty/page'
import { WarwickDeliveryPage } from './pages/delivery/page'
import { WarwickReviewsPage } from './pages/reviews/page'
import { WarwickUsedCarsPage } from './pages/used-cars/page'
import { WarwickVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { WarwickRecentlySoldPage } from './pages/recently-sold/page'
import { WarwickComparePage } from './pages/compare/page'
import { WarwickWishlistPage } from './pages/wishlist/page'
import { WarwickPrivacyPolicyPage } from './pages/privacy-policy/page'
import { WarwickCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: WarwickHomePage,
  about: WarwickAboutPage,
  contact: WarwickContactPage,
  services: WarwickServicesPage,
  sellYourCar: WarwickSellYourCarPage,
  finance: WarwickFinancePage,
  partExchange: WarwickPartExchangePage,
  warranty: WarwickWarrantyPage,
  delivery: WarwickDeliveryPage,
  reviews: WarwickReviewsPage,
  usedCars: WarwickUsedCarsPage,
  vehicleDetail: WarwickVehicleDetailPage,
  recentlySold: WarwickRecentlySoldPage,
  compare: WarwickComparePage,
  wishlist: WarwickWishlistPage,
  privacyPolicy: WarwickPrivacyPolicyPage,
  cookiePolicy: WarwickCookiePolicyPage,
}

export const warwickHallCarsBespokePages = themePages
