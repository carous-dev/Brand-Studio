import type { ThemeSectionRegistry } from '../../types'

function HeroSection() {
  return null
}

function ServicesSection() {
  return null
}

function InventorySection() {
  return null
}

function ContactSection() {
  return null
}

export const themeSections: ThemeSectionRegistry = {
  hero: HeroSection,
  services: ServicesSection,
  inventory: InventorySection,
  contact: ContactSection,
}
