import type { ThemeSectionRegistry } from '../../types'

function ClassicHeroSection() {
  return null
}

function ClassicAboutSection() {
  return null
}

function ClassicContactSection() {
  return null
}

export const themeSections: ThemeSectionRegistry = {
  hero: ClassicHeroSection,
  about: ClassicAboutSection,
  contact: ClassicContactSection,
}
