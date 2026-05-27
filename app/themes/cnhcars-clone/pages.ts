// Mode B clone of carous-platform/cnhcars — pages registry.
// The brandstudio runtime calls these with `(props: ThemePageProps) => ReactNode`,
// not Next file-routed params. Phase 8 may need to adapt page-internal signatures
// (especially vehicleDetail, which expects { vehicleSlug, brand } not { params }).
//
// Source pages with no brandstudio ThemePageId equivalent (cookies, disclaimer,
// terms, testimonials) are intentionally NOT registered — their files remain on
// disk for reference but the brandstudio router won't reach them.
import type { ThemePageRegistry } from '../types'

import AboutPage from './pages/about/page'
import ContactPage from './pages/contact/page'
import CookiesPage from './pages/cookies/page'
import HomePage from './pages/home/page'
import PrivacyPage from './pages/privacy/page'
import SellYourCarPage from './pages/sell-your-car/page'
import ServicesPage from './pages/services/page'
import UsedCarsPage from './pages/used-cars/page'
import VehicleDetailPage from './pages/used-cars/[id]/page'
import WishlistPage from './pages/wishlist/page'

export const themePages: ThemePageRegistry = {
  home: HomePage as any,
  about: AboutPage as any,
  contact: ContactPage as any,
  services: ServicesPage as any,
  sellYourCar: SellYourCarPage as any,
  usedCars: UsedCarsPage as any,
  vehicleDetail: VehicleDetailPage as any,
  wishlist: WishlistPage as any,
  privacyPolicy: PrivacyPage as any,
  cookiePolicy: CookiesPage as any,
}

export default themePages
