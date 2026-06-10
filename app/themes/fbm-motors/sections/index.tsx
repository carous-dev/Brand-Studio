import type { ThemeSectionRegistry } from '../../types'

// fbm-motors does not expose composable sections in the dashboard section picker.
// The home page assembles its sections directly from the source-app layout
// (hero, current stock, forecourt photo break, why us, partners ticker,
// testimonials, browse by make, visit us).
function FbmHeroSectionPlaceholder() {
  return null
}

export const themeSections: ThemeSectionRegistry = {
  hero: FbmHeroSectionPlaceholder,
}
