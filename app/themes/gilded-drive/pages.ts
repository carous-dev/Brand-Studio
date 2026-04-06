import type { ThemePageRegistry } from '../types'
import { GildedHomePage } from './pages/home/page'
import { GildedAboutPage } from './pages/about/page'
import { GildedContactPage } from './pages/contact/page'
import { GildedServicesPage } from './pages/services/page'
import { GildedSellYourCarPage } from './pages/sell-your-car/page'
import { GildedRecentlySoldPage } from './pages/recently-sold/page'
import { GildedUsedCarsPage } from './pages/used-cars/page'
import { GildedVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { GildedComparePage } from './pages/compare/page'
import { GildedWishlistPage } from './pages/wishlist/page'
import { GildedPrivacyPolicyPage } from './pages/privacy-policy/page'
import { GildedCookiePolicyPage } from './pages/cookie-policy/page'

/**
 * Gilded drive theme page registry.
 */
export const themePages: ThemePageRegistry = {
  home: GildedHomePage,
  about: GildedAboutPage,
  contact: GildedContactPage,
  services: GildedServicesPage,
  sellYourCar: GildedSellYourCarPage,
  recentlySold: GildedRecentlySoldPage,
  usedCars: GildedUsedCarsPage,
  vehicleDetail: GildedVehicleDetailPage,
  compare: GildedComparePage,
  wishlist: GildedWishlistPage,
  privacyPolicy: GildedPrivacyPolicyPage,
  cookiePolicy: GildedCookiePolicyPage,
}
export const gildedDrivePages = themePages
