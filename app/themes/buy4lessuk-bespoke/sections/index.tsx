import type { ThemeSectionRegistry } from '../../types'

// Phase 8 design responsibility: register the section components the
// dashboard exposes for theme customization. The runtime can render a brand
// without any registered sections — keeping this empty is fine for an
// initial scaffold.
function HeroSection() {
  return null
}

export const themeSections: ThemeSectionRegistry = {
  hero: HeroSection,
}
