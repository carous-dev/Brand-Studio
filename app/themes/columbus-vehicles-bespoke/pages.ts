import type { ThemePageRegistry } from '../types'
import { ColumbusHomePage } from './pages/home/page'
import { ColumbusAboutPage } from './pages/about/page'
import { ColumbusContactPage } from './pages/contact/page'
import { ColumbusServicesPage } from './pages/services/page'
import { ColumbusSellYourCarPage } from './pages/sell-your-car/page'
import { ColumbusFinancePage } from './pages/finance/page'
import { ColumbusPartExchangePage } from './pages/part-exchange/page'
import { ColumbusUsedCarsPage } from './pages/used-cars/page'
import { ColumbusVehicleDetailPage } from './pages/used-cars/[slug]/page'
import { ColumbusRecentlySoldPage } from './pages/recently-sold/page'
import { ColumbusComparePage } from './pages/compare/page'
import { ColumbusWishlistPage } from './pages/wishlist/page'
import { ColumbusPrivacyPolicyPage } from './pages/privacy-policy/page'
import { ColumbusCookiePolicyPage } from './pages/cookie-policy/page'

export const themePages: ThemePageRegistry = {
  home: ColumbusHomePage,
  about: ColumbusAboutPage,
  contact: ColumbusContactPage,
  services: ColumbusServicesPage,
  sellYourCar: ColumbusSellYourCarPage,
  finance: ColumbusFinancePage,
  partExchange: ColumbusPartExchangePage,
  usedCars: ColumbusUsedCarsPage,
  vehicleDetail: ColumbusVehicleDetailPage,
  recentlySold: ColumbusRecentlySoldPage,
  compare: ColumbusComparePage,
  wishlist: ColumbusWishlistPage,
  privacyPolicy: ColumbusPrivacyPolicyPage,
  cookiePolicy: ColumbusCookiePolicyPage,
}

export const columbusVehiclesBespokePages = themePages
